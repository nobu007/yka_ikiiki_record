import { z } from "zod";

/**
 * Notification provider types supported by the system
 */
export enum NotificationProviderType {
  EMAIL = "email",
  SMS = "sms",
  SLACK = "slack",
  WEBHOOK = "webhook",
  IN_APP = "in_app",
}

/**
 * Notification provider status
 */
export enum NotificationProviderStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

/**
 * Notification channels for categorizing notifications
 */
export enum NotificationChannel {
  ANOMALY_DETECTION = "anomaly_detection",
  SYSTEM_ALERTS = "system_alerts",
  DATA_BACKUP = "data_backup",
  USER_ACTIVITY = "user_activity",
  REPORTS = "reports",
}

/**
 * Notification priority levels
 */
export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Email provider configuration
 */
export interface EmailProviderConfig {
  /** SMTP server host */
  host: string;
  /** SMTP server port */
  port: number;
  /** Whether to use TLS (false for STARTTLS) */
  secure: boolean;
  /** Authentication credentials */
  auth: {
    /** Username for authentication */
    user: string;
    /** Password for authentication */
    pass: string;
  };
  /** Default sender email address */
  from?: string;
  /** Default reply-to address */
  replyTo?: string;
}

/**
 * Webhook provider configuration
 */
export interface WebhookProviderConfig {
  /** Webhook URL */
  url: string;
  /** HTTP method (typically POST) */
  method: "POST" | "PUT" | "PATCH";
  /** HTTP headers to include in requests */
  headers: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts on failure */
  retryAttempts?: number;
}

/**
 * SMS provider configuration
 */
export interface SmsProviderConfig {
  /** SMS service API endpoint */
  apiUrl: string;
  /** API key for authentication */
  apiKey: string;
  /** Sender ID or phone number */
  senderId: string;
  /** Maximum message length */
  maxMessageLength?: number;
}

/**
 * Slack provider configuration
 */
export interface SlackProviderConfig {
  /** Slack webhook URL or OAuth token */
  webhookUrl: string;
  /** Default channel to post to */
  defaultChannel: string;
  /** Username to post as */
  username?: string;
  /** Custom icon URL */
  iconUrl?: string;
}

/**
 * In-app notification provider configuration
 */
export interface InAppProviderConfig {
  /** Number of days to retain notifications */
  retentionDays: number;
  /** Maximum number of notifications to store per user */
  maxNotifications: number;
  /** Whether users can dismiss notifications */
  allowDismiss?: boolean;
  /** Whether to play sound for notifications */
  soundEnabled?: boolean;
}

/**
 * Union type for all provider configurations
 */
export type ProviderConfig =
  | EmailProviderConfig
  | WebhookProviderConfig
  | SmsProviderConfig
  | SlackProviderConfig
  | InAppProviderConfig;

/**
 * Notification provider domain entity
 *
 * Represents a notification delivery mechanism (email, SMS, webhook, in-app, etc.)
 * with its configuration, supported channels, and operational status.
 */
export interface NotificationProvider {
  /** Unique identifier for the provider */
  id: string;
  /** Type of notification provider */
  type: NotificationProviderType;
  /** Current operational status */
  status: NotificationProviderStatus;
  /** Human-readable name for the provider */
  name: string;
  /** Provider-specific configuration */
  config: ProviderConfig;
  /** List of notification channels this provider supports */
  channels: NotificationChannel[];
  /** Subset of channels that are currently enabled */
  enabledChannels: NotificationChannel[];
  /** When this provider was created */
  createdAt: Date;
  /** When this provider was last updated */
  updatedAt: Date;
  /** When this provider was last used to send a notification */
  lastUsedAt?: Date;
}

/**
 * Notification delivery status
 */
export enum NotificationDeliveryStatus {
  PENDING = "pending",
  SENT = "sent",
  FAILED = "failed",
  RETRYING = "retrying",
}

/**
 * Notification domain entity
 *
 * Represents a single notification that was sent or is pending delivery.
 */
export interface Notification {
  /** Unique identifier for the notification */
  id: string;
  /** ID of the provider used to send this notification */
  providerId: string;
  /** Channel category for this notification */
  channel: NotificationChannel;
  /** Priority level of this notification */
  priority: NotificationPriority;
  /** Subject line or title */
  subject: string;
  /** Main content body */
  body: string;
  /** Recipients (email addresses, phone numbers, user IDs, etc.) */
  recipients: string[];
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** When this notification was sent */
  sentAt: Date;
  /** Current delivery status */
  status: NotificationDeliveryStatus;
  /** Number of delivery attempts made */
  attempts: number;
  /** Error message if delivery failed */
  errorMessage?: string;
}

/**
 * Notification configuration
 *
 * System-wide settings for notification behavior
 */
export interface NotificationConfig {
  /** Whether notifications are globally enabled */
  enabled: boolean;
  /** Active notification channels */
  channels: NotificationChannel[];
  /** Default priority for each channel */
  priorities: Record<string, NotificationPriority>;
  /** Quiet hours configuration */
  quietHours: {
    /** Whether quiet hours are enabled */
    enabled: boolean;
    /** Start time (HH:MM format) */
    start: string;
    /** End time (HH:MM format) */
    end: string;
    /** Timezone for quiet hours */
    timezone: string;
  };
  /** Rate limiting configuration */
  rateLimits: {
    /** Maximum notifications per hour */
    maxPerHour: number;
    /** Maximum notifications per day */
    maxPerDay: number;
  };
}

/**
 * Zod schema for NotificationProvider entity validation
 */
export const NotificationProviderSchema = z
  .object({
    id: z.string().min(1),
    type: z.nativeEnum(NotificationProviderType),
    status: z.nativeEnum(NotificationProviderStatus),
    name: z.string().min(1).max(200),
    config: z.object({
      host: z.string().optional(),
      port: z.number().optional(),
      secure: z.boolean().optional(),
      auth: z
        .object({
          user: z.string().optional(),
          pass: z.string().optional(),
        })
        .optional(),
      from: z.string().email().optional(),
      replyTo: z.string().email().optional(),
      url: z.string().url().optional(),
      method: z.enum(["POST", "PUT", "PATCH"]).optional(),
      headers: z.record(z.string()).optional(),
      timeout: z.number().optional(),
      retryAttempts: z.number().optional(),
      apiUrl: z.string().optional(),
      apiKey: z.string().optional(),
      senderId: z.string().optional(),
      maxMessageLength: z.number().optional(),
      webhookUrl: z.string().optional(),
      defaultChannel: z.string().optional(),
      username: z.string().optional(),
      iconUrl: z.string().url().optional(),
      retentionDays: z.number().optional(),
      maxNotifications: z.number().optional(),
      allowDismiss: z.boolean().optional(),
      soundEnabled: z.boolean().optional(),
    }),
    channels: z.array(z.nativeEnum(NotificationChannel)).min(1),
    enabledChannels: z.array(z.nativeEnum(NotificationChannel)).min(1),
    createdAt: z.date(),
    updatedAt: z.date(),
    lastUsedAt: z.date().optional(),
  })
  .refine(
    (data) =>
      data.enabledChannels.every((channel) => data.channels.includes(channel)),
    {
      message: "enabledChannels must be a subset of channels",
      path: ["enabledChannels"],
    },
  );

export type NotificationProviderDTO = z.infer<typeof NotificationProviderSchema>;

/**
 * Zod schema for Notification entity validation
 */
export const NotificationSchema = z.object({
  id: z.string().min(1),
  providerId: z.string().min(1),
  channel: z.nativeEnum(NotificationChannel),
  priority: z.nativeEnum(NotificationPriority),
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(5000),
  recipients: z.array(z.string().email()).min(1),
  metadata: z.record(z.unknown()).optional(),
  sentAt: z.date(),
  status: z.nativeEnum(NotificationDeliveryStatus),
  attempts: z.number().int().min(0),
  errorMessage: z.string().optional(),
});

export type NotificationDTO = z.infer<typeof NotificationSchema>;

/**
 * Zod schema for NotificationConfig validation
 */
export const NotificationConfigSchema = z.object({
  enabled: z.boolean(),
  channels: z.array(z.nativeEnum(NotificationChannel)),
  priorities: z.record(z.nativeEnum(NotificationPriority)),
  quietHours: z.object({
    enabled: z.boolean(),
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    timezone: z.string(),
  }),
  rateLimits: z.object({
    maxPerHour: z.number().int().positive(),
    maxPerDay: z.number().int().positive(),
  }),
});

export type NotificationConfigDTO = z.infer<typeof NotificationConfigSchema>;
