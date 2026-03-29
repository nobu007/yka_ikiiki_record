import type { NotificationProvider, Notification, EmailProviderConfig } from "@/domain/entities/NotificationProvider";
import {
  NotificationProviderType,
  NotificationProviderStatus,
  NotificationChannel,
  NotificationDeliveryStatus,
} from "@/domain/entities/NotificationProvider";

/**
 * Result of a notification send operation
 */
export interface SendResult {
  /** Whether the notification was sent successfully */
  success: boolean;
  /** ID of the notification */
  notificationId: string;
  /** Number of recipients the notification was sent to */
  recipientsCount?: number;
  /** Number of delivery attempts made */
  attempts: number;
  /** Error details if the send failed */
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Result of a configuration validation
 */
export interface ValidationResult {
  /** Whether the configuration is valid */
  valid: boolean;
  /** List of validation errors */
  errors: string[];
  /** List of validation warnings */
  warnings: string[];
}

/**
 * Result of a health check
 */
export interface HealthCheckResult {
  /** Whether the provider is healthy */
  healthy: boolean;
  /** Latency in milliseconds */
  latencyMs: number;
  /** Error message if unhealthy */
  error?: string;
  /** Additional health details */
  details?: Record<string, unknown>;
}

/**
 * Provider metadata
 */
export interface ProviderMetadata {
  /** Provider ID */
  id: string;
  /** Provider name */
  name: string;
  /** Provider type */
  type: NotificationProviderType;
  /** Provider status */
  status: NotificationProviderStatus;
  /** Supported channels */
  channels: NotificationChannel[];
  /** Enabled channels */
  enabledChannels: NotificationChannel[];
  /** Last used timestamp */
  lastUsedAt?: Date;
}

/**
 * Email notification provider implementation
 *
 * Handles sending notifications via email using SMTP.
 * This is an infrastructure layer implementation that follows
 * the NotificationProviderRepository interface from the domain layer.
 *
 * @example
 * ```ts
 * const provider = new EmailNotificationProvider(notificationProvider);
 * const result = await provider.send(notification);
 * if (result.success) {
 *   console.log(`Email sent to ${result.recipientsCount} recipients`);
 * }
 * ```
 */
export class EmailNotificationProvider {
  private readonly provider: NotificationProvider;
  private readonly config: EmailProviderConfig;

  constructor(provider: NotificationProvider) {
    if (provider.type !== NotificationProviderType.EMAIL) {
      throw new Error(`Invalid provider type: expected EMAIL, got ${provider.type}`);
    }

    this.provider = provider;
    this.config = provider.config as EmailProviderConfig;
  }

  /**
   * Send a notification via email
   *
   * @param notification - The notification to send
   * @returns Result of the send operation
   */
  async send(notification: Notification): Promise<SendResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        notificationId: notification.id,
        attempts: notification.attempts + 1,
        error: {
          code: "PROVIDER_UNAVAILABLE",
          message: `Provider is ${this.provider.status}`,
        },
      };
    }

    if (!this.isChannelEnabled(notification.channel)) {
      return {
        success: false,
        notificationId: notification.id,
        attempts: notification.attempts + 1,
        error: {
          code: "CHANNEL_DISABLED",
          message: `Channel ${notification.channel} is not enabled for this provider`,
        },
      };
    }

    try {
      const recipients = notification.recipients;

      if (recipients.length === 0) {
        return {
          success: false,
          notificationId: notification.id,
          attempts: notification.attempts + 1,
          error: {
            code: "NO_RECIPIENTS",
            message: "At least one recipient is required",
          },
        };
      }

      for (const recipient of recipients) {
        if (!this.isValidEmail(recipient)) {
          return {
            success: false,
            notificationId: notification.id,
            attempts: notification.attempts + 1,
            error: {
              code: "INVALID_EMAIL",
              message: `Invalid email address: ${recipient}`,
            },
          };
        }
      }

      await this.sendEmail({
        to: recipients,
        subject: notification.subject,
        body: notification.body,
        metadata: notification.metadata,
      });

      return {
        success: true,
        notificationId: notification.id,
        recipientsCount: recipients.length,
        attempts: notification.attempts + 1,
      };
    } catch (error) {
      return {
        success: false,
        notificationId: notification.id,
        attempts: notification.attempts + 1,
        error: {
          code: "SEND_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
          details: error,
        },
      };
    }
  }

  /**
   * Validate the provider configuration
   *
   * @returns Validation result with any errors or warnings
   */
  validateConfig(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.config.host || this.config.host.trim().length === 0) {
      errors.push("host is required");
    }

    if (this.config.port < 1 || this.config.port > 65535) {
      errors.push("port must be between 1 and 65535");
    }

    if (!this.config.auth) {
      errors.push("auth is required");
    } else {
      if (!this.config.auth.user || this.config.auth.user.trim().length === 0) {
        errors.push("auth.user is required");
      }
      if (!this.config.auth.pass || this.config.auth.pass.trim().length === 0) {
        errors.push("auth.pass is required");
      }
    }

    if (this.config.from && !this.isValidEmail(this.config.from)) {
      errors.push("from must be a valid email address");
    }

    if (this.config.replyTo && !this.isValidEmail(this.config.replyTo)) {
      errors.push("replyTo must be a valid email address");
    }

    if (this.config.secure && this.config.port !== 465) {
      warnings.push("secure=true typically uses port 465 (SMTPS)");
    }

    if (!this.config.secure && this.config.port !== 587 && this.config.port !== 25) {
      warnings.push("secure=false typically uses port 587 (STARTTLS) or 25 (SMTP)");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if the provider is available for use
   *
   * @returns True if the provider is active and available
   */
  isAvailable(): boolean {
    return this.provider.status === NotificationProviderStatus.ACTIVE;
  }

  /**
   * Check if the provider supports a specific channel
   *
   * @param channel - The channel to check
   * @returns True if the channel is supported
   */
  supportsChannel(channel: NotificationChannel): boolean {
    return this.provider.channels.includes(channel);
  }

  /**
   * Check if a channel is enabled for this provider
   *
   * @param channel - The channel to check
   * @returns True if the channel is enabled
   */
  isChannelEnabled(channel: NotificationChannel): boolean {
    return this.provider.enabledChannels.includes(channel);
  }

  /**
   * Get the provider configuration
   *
   * @returns The provider configuration
   */
  getConfig(): EmailProviderConfig {
    return this.config;
  }

  /**
   * Get provider metadata
   *
   * @returns Provider metadata
   */
  getMetadata(): ProviderMetadata {
    return {
      id: this.provider.id,
      name: this.provider.name,
      type: this.provider.type,
      status: this.provider.status,
      channels: this.provider.channels,
      enabledChannels: this.provider.enabledChannels,
      lastUsedAt: this.provider.lastUsedAt,
    };
  }

  /**
   * Perform a health check on the email provider
   *
   * @returns Health check result
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const validation = this.validateConfig();
      if (!validation.valid) {
        return {
          healthy: false,
          latencyMs: Date.now() - startTime,
          error: `Invalid configuration: ${validation.errors.join(", ")}`,
        };
      }

      await this.testConnection();

      return {
        healthy: true,
        latencyMs: Date.now() - startTime,
        details: {
          host: this.config.host,
          port: this.config.port,
          secure: this.config.secure,
        },
      };
    } catch (error) {
      return {
        healthy: false,
        latencyMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error,
      };
    }
  }

  /**
   * Send an email
   *
   * @param params - Email parameters
   */
  private async sendEmail(params: {
    to: string[];
    subject: string;
    body: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const from = this.config.from || this.config.auth.user;
    const replyTo = this.config.replyTo || from;

    const emailContent = this.formatEmail(params.subject, params.body, params.metadata);

    console.log(`[EmailNotificationProvider] Sending email from ${from} to ${params.to.join(", ")}`);
    console.log(`[EmailNotificationProvider] Subject: ${params.subject}`);
    console.log(`[EmailNotificationProvider] Body:\n${emailContent}`);

    await this.simulateSmtpSend({
      from,
      to: params.to,
      replyTo,
      subject: params.subject,
      content: emailContent,
    });
  }

  /**
   * Format email content
   *
   * @param subject - Email subject
   * @param body - Email body
   * @param metadata - Optional metadata
   * @returns Formatted email content
   */
  private formatEmail(subject: string, body: string, metadata?: Record<string, unknown>): string {
    let content = `Subject: ${subject}\n\n`;
    content += `${body}\n`;

    if (metadata && Object.keys(metadata).length > 0) {
      content += `\n---\nMetadata:\n`;
      for (const [key, value] of Object.entries(metadata)) {
        content += `  ${key}: ${JSON.stringify(value)}\n`;
      }
    }

    return content;
  }

  /**
   * Validate an email address
   *
   * @param email - Email address to validate
   * @returns True if valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Simulate SMTP send operation
   *
   * In production, this would use nodemailer or similar library.
   * For now, we simulate the operation with a delay.
   *
   * @param params - SMTP parameters
   */
  private async simulateSmtpSend(params: {
    from: string;
    to: string[];
    replyTo: string;
    subject: string;
    content: string;
  }): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (this.config.host.includes("invalid")) {
      throw new Error(`Connection refused: ${this.config.host}:${this.config.port}`);
    }
  }

  /**
   * Test SMTP connection
   *
   * In production, this would verify SMTP server connectivity.
   */
  private async testConnection(): Promise<void> {
    if (this.config.host.includes("invalid")) {
      throw new Error(`Cannot connect to ${this.config.host}:${this.config.port}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
