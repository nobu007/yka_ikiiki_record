import { z } from "zod";
import type { NotificationProviderRepository } from "@/domain/repositories/NotificationProviderRepository";
import type { AnomalyDetectionService } from "@/domain/services/AnomalyDetectionService";
import type { Anomaly, AnomalyContext } from "@/domain/entities/Anomaly";
import {
  NotificationProviderType,
  NotificationProviderStatus,
  NotificationChannel,
  NotificationPriority,
  NotificationDeliveryStatus,
  type NotificationProvider,
  type Notification,
  type NotificationConfig,
  type ProviderConfig,
  NotificationConfigSchema,
} from "@/domain/entities/NotificationProvider";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SendNotificationOptions {
  channel: NotificationChannel;
  priority: NotificationPriority;
  subject: string;
  body: string;
  recipients: string[];
  metadata?: Record<string, unknown>;
}

interface SendNotificationResult {
  success: boolean;
  notificationId?: string;
  recipientsCount?: number;
  attempts: number;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

interface NotificationHistoryOptions {
  channel?: NotificationChannel;
  status?: NotificationDeliveryStatus;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface ProviderStatusInfo {
  id: string;
  name: string;
  type: NotificationProviderType;
  status: NotificationProviderStatus;
  channels: NotificationChannel[];
  enabledChannels: NotificationChannel[];
  lastUsedAt?: Date;
  healthy: boolean;
}

const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  enabled: true,
  channels: [
    NotificationChannel.ANOMALY_DETECTION,
    NotificationChannel.SYSTEM_ALERTS,
    NotificationChannel.DATA_BACKUP,
    NotificationChannel.USER_ACTIVITY,
    NotificationChannel.REPORTS,
  ],
  priorities: {
    anomaly_detection: NotificationPriority.HIGH,
    system_alerts: NotificationPriority.HIGH,
    data_backup: NotificationPriority.MEDIUM,
    user_activity: NotificationPriority.LOW,
    reports: NotificationPriority.LOW,
  },
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
    timezone: "UTC",
  },
  rateLimits: {
    maxPerHour: 100,
    maxPerDay: 1000,
  },
};

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

const notificationStorage: Map<string, Notification> = new Map();
let notificationCounter = 0;

const rateLimitTracker: Map<string, { count: number; resetAt: number }> =
  new Map();

export class NotificationService {
  private config: NotificationConfig;
  private providerRepository: NotificationProviderRepository;
  private anomalyDetectionService: AnomalyDetectionService;

  constructor(
    providerRepository: NotificationProviderRepository,
    anomalyDetectionService: AnomalyDetectionService,
  ) {
    this.providerRepository = providerRepository;
    this.anomalyDetectionService = anomalyDetectionService;
    this.config = DEFAULT_NOTIFICATION_CONFIG;
  }

  updateConfig(newConfig: NotificationConfig): void {
    const validated = NotificationConfigSchema.parse(newConfig);
    this.config = validated;
  }

  getNotificationSettings(): NotificationConfig {
    return { ...this.config };
  }

  async sendNotification(
    options: SendNotificationOptions,
  ): Promise<SendNotificationResult> {
    if (!this.config.enabled) {
      return {
        success: false,
        attempts: 0,
        error: {
          code: "NOTIFICATIONS_DISABLED",
          message: "Notifications are currently disabled",
        },
      };
    }

    const validationResult = this.validateRecipients(options.recipients);
    if (!validationResult.valid) {
      return {
        success: false,
        attempts: 0,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid recipient email addresses",
          details: validationResult.errors,
        },
      };
    }

    if (!this.isChannelEnabled(options.channel)) {
      return {
        success: false,
        attempts: 0,
        error: {
          code: "CHANNEL_DISABLED",
          message: `Channel ${options.channel} is not enabled`,
        },
      };
    }

    if (
      options.priority !== NotificationPriority.CRITICAL &&
      this.isWithinQuietHours()
    ) {
      return {
        success: false,
        attempts: 0,
        error: {
          code: "QUIET_HOURS",
          message: "Currently within quiet hours",
        },
      };
    }

    if (!this.checkRateLimit(options.channel)) {
      return {
        success: false,
        attempts: 0,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Rate limit exceeded for this channel",
        },
      };
    }

    const provider = await this.findProviderForChannel(options.channel);
    if (!provider) {
      return {
        success: false,
        attempts: 0,
        error: {
          code: "NO_PROVIDER_AVAILABLE",
          message: `No active provider found for channel ${options.channel}`,
        },
      };
    }

    let lastError: Error | undefined;
    let attempts = 0;

    for (let i = 0; i < MAX_RETRY_ATTEMPTS; i++) {
      attempts++;
      try {
        const result = await this.sendViaProvider(
          provider,
          options.recipients,
          options.subject,
          options.body,
          options.priority,
          options.channel,
          options.metadata,
        );

        await this.providerRepository.updateLastUsed(provider.id, new Date());

        return {
          success: true,
          notificationId: result.notificationId,
          recipientsCount: result.recipientsCount,
          attempts,
        };
      } catch (error) {
        lastError = error as Error;
        if (i < MAX_RETRY_ATTEMPTS - 1) {
          await this.delay(RETRY_DELAY_MS * (i + 1));
        }
      }
    }

    return {
      success: false,
      attempts,
      error: {
        code: "SEND_FAILED",
        message: lastError?.message || "Failed to send notification after retries",
      },
    };
  }

  async sendAnomalyAlert(
    anomaly: Anomaly,
    recipients: string[],
  ): Promise<SendNotificationResult> {
    const subject = this.formatAnomalySubject(anomaly);
    const body = this.formatAnomalyBody(anomaly);

    return this.sendNotification({
      channel: NotificationChannel.ANOMALY_DETECTION,
      priority: this.mapSeverityToPriority(anomaly.severity),
      subject,
      body,
      recipients,
      metadata: {
        anomalyId: anomaly.id,
        anomalyType: anomaly.type,
        anomalySeverity: anomaly.severity,
        context: anomaly.context,
      },
    });
  }

  async getNotificationHistory(
    options?: NotificationHistoryOptions,
  ): Promise<Notification[]> {
    let notifications = Array.from(notificationStorage.values());

    if (options?.channel) {
      notifications = notifications.filter((n) => n.channel === options.channel);
    }

    if (options?.status) {
      notifications = notifications.filter((n) => n.status === options.status);
    }

    if (options?.priority) {
      notifications = notifications.filter((n) => n.priority === options.priority);
    }

    if (options?.startDate) {
      notifications = notifications.filter(
        (n) => n.sentAt >= options.startDate!,
      );
    }

    if (options?.endDate) {
      notifications = notifications.filter((n) => n.sentAt <= options.endDate!);
    }

    notifications.sort(
      (a, b) => b.sentAt.getTime() - a.sentAt.getTime(),
    );

    const offset = options?.offset || 0;
    const limit = options?.limit || notifications.length;

    return notifications.slice(offset, offset + limit);
  }

  async getProviderStatus(
    channel?: NotificationChannel,
  ): Promise<ProviderStatusInfo[]> {
    let providers: NotificationProvider[];

    if (channel) {
      providers = await this.providerRepository.findProvidersByChannel(channel);
    } else {
      providers = await this.providerRepository.findAll();
    }

    return providers.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      status: p.status,
      channels: p.channels,
      enabledChannels: p.enabledChannels,
      lastUsedAt: p.lastUsedAt,
      healthy: p.status === NotificationProviderStatus.ACTIVE,
    }));
  }

  async validateProviderConfiguration(
    config: Partial<NotificationProvider> & {
      type: NotificationProviderType;
      name: string;
      config: ProviderConfig;
      channels: NotificationChannel[];
      enabledChannels: NotificationChannel[];
    },
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config.name || config.name.trim().length === 0) {
      errors.push("Provider name is required");
    }

    if (config.channels.length === 0) {
      errors.push("At least one channel must be specified");
    }

    const invalidChannels = config.enabledChannels.filter(
      (ch) => !config.channels.includes(ch),
    );
    if (invalidChannels.length > 0) {
      errors.push(
        `Enabled channels must be a subset of channels: ${invalidChannels.join(", ")}`,
      );
    }

    switch (config.type) {
      case NotificationProviderType.EMAIL:
        const emailConfig = config.config as any;
        if (!emailConfig.host || emailConfig.host.trim().length === 0) {
          errors.push("Email provider requires a valid SMTP host");
        }
        if (!emailConfig.port || emailConfig.port <= 0 || emailConfig.port > 65535) {
          errors.push("Email provider requires a valid SMTP port (1-65535)");
        }
        if (!emailConfig.auth || !emailConfig.auth.user) {
          warnings.push("Email provider missing authentication credentials");
        }
        break;

      case NotificationProviderType.WEBHOOK:
        const webhookConfig = config.config as any;
        try {
          new URL(webhookConfig.url);
        } catch {
          errors.push("Webhook provider requires a valid URL");
        }
        if (!webhookConfig.method) {
          errors.push("Webhook provider requires an HTTP method");
        }
        break;

      case NotificationProviderType.SMS:
        const smsConfig = config.config as any;
        if (!smsConfig.apiUrl || smsConfig.apiUrl.trim().length === 0) {
          errors.push("SMS provider requires an API URL");
        }
        if (!smsConfig.apiKey) {
          warnings.push("SMS provider missing API key");
        }
        break;

      case NotificationProviderType.SLACK:
        const slackConfig = config.config as any;
        if (!slackConfig.webhookUrl || slackConfig.webhookUrl.trim().length === 0) {
          errors.push("Slack provider requires a webhook URL");
        }
        if (!slackConfig.defaultChannel) {
          errors.push("Slack provider requires a default channel");
        }
        break;

      case NotificationProviderType.IN_APP:
        const inAppConfig = config.config as any;
        if (inAppConfig.retentionDays <= 0) {
          errors.push("In-app provider requires positive retention days");
        }
        if (inAppConfig.maxNotifications <= 0) {
          errors.push("In-app provider requires positive max notifications");
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async enableChannel(
    providerId: string,
    channel: NotificationChannel,
  ): Promise<NotificationProvider> {
    const provider = await this.providerRepository.findById(providerId);
    if (!provider) {
      throw new Error("Provider not found");
    }

    if (!provider.channels.includes(channel)) {
      throw new Error("Channel not supported by provider");
    }

    if (provider.enabledChannels.includes(channel)) {
      return provider;
    }

    const updated: NotificationProvider = {
      ...provider,
      enabledChannels: [...provider.enabledChannels, channel],
      updatedAt: new Date(),
    };

    return this.providerRepository.save(updated);
  }

  async disableChannel(
    providerId: string,
    channel: NotificationChannel,
  ): Promise<NotificationProvider> {
    const provider = await this.providerRepository.findById(providerId);
    if (!provider) {
      throw new Error("Provider not found");
    }

    const updated: NotificationProvider = {
      ...provider,
      enabledChannels: provider.enabledChannels.filter((ch) => ch !== channel),
      updatedAt: new Date(),
    };

    return this.providerRepository.save(updated);
  }

  async setProviderStatus(
    providerId: string,
    status: NotificationProviderStatus,
  ): Promise<NotificationProvider | undefined> {
    return this.providerRepository.updateStatus(providerId, status);
  }

  private validateRecipients(recipients: string[]): ValidationResult {
    const errors: string[] = [];

    if (recipients.length === 0) {
      errors.push("At least one recipient is required");
    }

    for (const recipient of recipients) {
      if (!EMAIL_REGEX.test(recipient)) {
        errors.push(`Invalid email address: ${recipient}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  private isChannelEnabled(channel: NotificationChannel): boolean {
    return this.config.channels.includes(channel);
  }

  private isWithinQuietHours(): boolean {
    if (!this.config.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const { start, end } = this.config.quietHours;

    if (start < end) {
      return currentTime >= start && currentTime <= end;
    } else {
      return currentTime >= start || currentTime <= end;
    }
  }

  private checkRateLimit(channel: NotificationChannel): boolean {
    const now = Date.now();
    const hourKey = `${channel}-${Math.floor(now / 3600000)}`;
    const dayKey = `${channel}-${Math.floor(now / 86400000)}`;

    const hourTracker = rateLimitTracker.get(hourKey);
    const dayTracker = rateLimitTracker.get(dayKey);

    if (hourTracker && hourTracker.count >= this.config.rateLimits.maxPerHour) {
      return false;
    }

    if (dayTracker && dayTracker.count >= this.config.rateLimits.maxPerDay) {
      return false;
    }

    if (hourTracker) {
      hourTracker.count++;
    } else {
      rateLimitTracker.set(hourKey, { count: 1, resetAt: now + 3600000 });
    }

    if (dayTracker) {
      dayTracker.count++;
    } else {
      rateLimitTracker.set(dayKey, { count: 1, resetAt: now + 86400000 });
    }

    this.cleanupExpiredRateLimits(now);
    return true;
  }

  private cleanupExpiredRateLimits(now: number): void {
    for (const [key, value] of rateLimitTracker.entries()) {
      if (value.resetAt < now) {
        rateLimitTracker.delete(key);
      }
    }
  }

  private async findProviderForChannel(
    channel: NotificationChannel,
  ): Promise<NotificationProvider | null> {
    const providers =
      await this.providerRepository.findProvidersByChannel(channel);

    const activeProviders = providers.filter(
      (p) =>
        p.status === NotificationProviderStatus.ACTIVE &&
        p.enabledChannels.includes(channel),
    );

    if (activeProviders.length === 0) {
      return null;
    }

    return activeProviders[0];
  }

  private async sendViaProvider(
    provider: NotificationProvider,
    recipients: string[],
    subject: string,
    body: string,
    priority: NotificationPriority,
    channel: NotificationChannel,
    metadata?: Record<string, unknown>,
  ): Promise<{
    notificationId: string;
    recipientsCount: number;
  }> {
    const notificationId = `notif-${++notificationCounter}`;

    const notification: Notification = {
      id: notificationId,
      providerId: provider.id,
      channel,
      priority,
      subject,
      body,
      recipients,
      metadata,
      sentAt: new Date(),
      status: NotificationDeliveryStatus.SENT,
      attempts: 1,
    };

    notificationStorage.set(notificationId, notification);

    return {
      notificationId,
      recipientsCount: recipients.length,
    };
  }

  private formatAnomalySubject(anomaly: Anomaly): string {
    return `[${anomaly.severity.toUpperCase()}] ${anomaly.type.replace(/_/g, " ").toUpperCase()}: ${anomaly.description}`;
  }

  private formatAnomalyBody(anomaly: Anomaly): string {
    const context = anomaly.context;
    let body = `Anomaly Details:\n`;
    body += `Type: ${anomaly.type}\n`;
    body += `Severity: ${anomaly.severity}\n`;
    body += `Description: ${anomaly.description}\n`;
    body += `Detected At: ${anomaly.detectedAt.toISOString()}\n\n`;

    if (context) {
      body += `Context:\n`;
      for (const [key, value] of Object.entries(context)) {
        body += `  ${key}: ${JSON.stringify(value)}\n`;
      }
      body += `\n`;
    }

    if (anomaly.recommendations.length > 0) {
      body += `Recommendations:\n`;
      anomaly.recommendations.forEach((rec, i) => {
        body += `  ${i + 1}. ${rec}\n`;
      });
    }

    return body;
  }

  private mapSeverityToPriority(severity: string): NotificationPriority {
    switch (severity.toLowerCase()) {
      case "critical":
        return NotificationPriority.CRITICAL;
      case "high":
        return NotificationPriority.HIGH;
      case "medium":
        return NotificationPriority.MEDIUM;
      case "low":
        return NotificationPriority.LOW;
      default:
        return NotificationPriority.MEDIUM;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
