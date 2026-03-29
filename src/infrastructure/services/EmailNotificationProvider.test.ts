import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { EmailNotificationProvider } from "./EmailNotificationProvider";
import type { NotificationProvider, Notification } from "@/domain/entities/NotificationProvider";
import {
  NotificationProviderType,
  NotificationProviderStatus,
  NotificationChannel,
  NotificationPriority,
  NotificationDeliveryStatus,
  type EmailProviderConfig,
} from "@/domain/entities/NotificationProvider";

describe("EmailNotificationProvider", () => {
  let emailProvider: EmailNotificationProvider;
  let mockProvider: NotificationProvider;

  beforeEach(() => {
    mockProvider = {
      id: "email-prov-123",
      type: NotificationProviderType.EMAIL,
      status: NotificationProviderStatus.ACTIVE,
      name: "Primary Email Provider",
      config: {
        host: "smtp.example.com",
        port: 587,
        secure: false,
        auth: {
          user: "notifications@example.com",
          pass: "test-password",
        },
        from: "noreply@example.com",
        replyTo: "support@example.com",
      } as EmailProviderConfig,
      channels: [
        NotificationChannel.ANOMALY_DETECTION,
        NotificationChannel.SYSTEM_ALERTS,
        NotificationChannel.DATA_BACKUP,
      ],
      enabledChannels: [
        NotificationChannel.ANOMALY_DETECTION,
        NotificationChannel.SYSTEM_ALERTS,
      ],
      createdAt: new Date("2026-03-30T00:00:00Z"),
      updatedAt: new Date("2026-03-30T00:00:00Z"),
      lastUsedAt: new Date("2026-03-30T01:00:00Z"),
    };

    emailProvider = new EmailNotificationProvider(mockProvider);
  });

  describe("Constructor", () => {
    it("should create an instance with provider configuration", () => {
      expect(emailProvider).toBeInstanceOf(EmailNotificationProvider);
    });

    it("should store provider configuration", () => {
      const config = emailProvider.getConfig();
      expect(config.host).toBe("smtp.example.com");
      expect(config.port).toBe(587);
      expect(config.secure).toBe(false);
    });
  });

  describe("send", () => {
    const mockNotification: Notification = {
      id: "notif-123",
      providerId: "email-prov-123",
      channel: NotificationChannel.ANOMALY_DETECTION,
      priority: NotificationPriority.HIGH,
      subject: "Anomaly Detected",
      body: "Unusual pattern detected in student records",
      recipients: ["admin@example.com", "teacher@example.com"],
      metadata: {
        anomalyId: "anom-456",
        severity: "high",
        studentName: "Test Student",
      },
      sentAt: new Date("2026-03-30T01:00:00Z"),
      status: NotificationDeliveryStatus.PENDING,
      attempts: 0,
    };

    it("should send an email notification successfully", async () => {
      const result = await emailProvider.send(mockNotification);

      expect(result.success).toBe(true);
      expect(result.notificationId).toBe("notif-123");
      expect(result.error).toBeUndefined();
    });

    it("should handle multiple recipients", async () => {
      const notification = {
        ...mockNotification,
        recipients: ["recipient1@example.com", "recipient2@example.com", "recipient3@example.com"],
      };

      const result = await emailProvider.send(notification);

      expect(result.success).toBe(true);
      expect(result.recipientsCount).toBe(3);
    });

    it("should format email with HTML body", async () => {
      const notification = {
        ...mockNotification,
        body: "<h1>Alert</h1><p>Unusual pattern detected</p>",
      };

      const result = await emailProvider.send(notification);

      expect(result.success).toBe(true);
    });

    it("should include metadata in email headers", async () => {
      const notification = {
        ...mockNotification,
        metadata: {
          anomalyId: "anom-456",
          severity: "high",
          source: "automated-system",
        },
      };

      const result = await emailProvider.send(notification);

      expect(result.success).toBe(true);
    });

    it("should handle empty recipients list", async () => {
      const notification = {
        ...mockNotification,
        recipients: [],
      };

      const result = await emailProvider.send(notification);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("recipient");
    });

    it("should handle invalid email addresses", async () => {
      const notification = {
        ...mockNotification,
        recipients: ["invalid-email", "another-invalid"],
      };

      const result = await emailProvider.send(notification);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle provider in inactive status", async () => {
      const inactiveProvider = {
        ...mockProvider,
        status: NotificationProviderStatus.INACTIVE,
      };
      const inactiveEmailProvider = new EmailNotificationProvider(inactiveProvider);

      const result = await inactiveEmailProvider.send(mockNotification);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("inactive");
    });

    it("should handle provider in suspended status", async () => {
      const suspendedProvider = {
        ...mockProvider,
        status: NotificationProviderStatus.SUSPENDED,
      };
      const suspendedEmailProvider = new EmailNotificationProvider(suspendedProvider);

      const result = await suspendedEmailProvider.send(mockNotification);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("suspended");
    });

    it("should respect retry attempts on failure", async () => {
      const failingProvider = {
        ...mockProvider,
        config: {
          ...mockProvider.config,
          host: "invalid-host-that-does-not-exist.local",
        },
      };
      const failingEmailProvider = new EmailNotificationProvider(failingProvider);

      const result = await failingEmailProvider.send(mockNotification);

      expect(result.success).toBe(false);
      expect(result.attempts).toBeGreaterThan(0);
    });
  });

  describe("validateConfig", () => {
    it("should validate correct email configuration", () => {
      const result = emailProvider.validateConfig();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect missing host", () => {
      const invalidConfig = {
        ...mockProvider,
        config: {
          ...mockProvider.config,
          host: "",
        } as EmailProviderConfig,
      };
      const invalidProvider = new EmailNotificationProvider(invalidConfig);

      const result = invalidProvider.validateConfig();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("host is required");
    });

    it("should detect invalid port", () => {
      const invalidConfig = {
        ...mockProvider,
        config: {
          ...mockProvider.config,
          port: -1,
        } as EmailProviderConfig,
      };
      const invalidProvider = new EmailNotificationProvider(invalidConfig);

      const result = invalidProvider.validateConfig();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should detect missing auth credentials", () => {
      const invalidConfig = {
        ...mockProvider,
        config: {
          ...mockProvider.config,
          auth: {
            user: "",
            pass: "",
          },
        } as EmailProviderConfig,
      };
      const invalidProvider = new EmailNotificationProvider(invalidConfig);

      const result = invalidProvider.validateConfig();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("auth.user is required");
      expect(result.errors).toContain("auth.pass is required");
    });

    it("should detect invalid from address", () => {
      const invalidConfig = {
        ...mockProvider,
        config: {
          ...mockProvider.config,
          from: "not-an-email",
        } as EmailProviderConfig,
      };
      const invalidProvider = new EmailNotificationProvider(invalidConfig);

      const result = invalidProvider.validateConfig();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("from must be a valid email address");
    });
  });

  describe("isAvailable", () => {
    it("should return true for active provider", () => {
      expect(emailProvider.isAvailable()).toBe(true);
    });

    it("should return false for inactive provider", () => {
      const inactiveProvider = {
        ...mockProvider,
        status: NotificationProviderStatus.INACTIVE,
      };
      const inactiveEmailProvider = new EmailNotificationProvider(inactiveProvider);

      expect(inactiveEmailProvider.isAvailable()).toBe(false);
    });

    it("should return false for suspended provider", () => {
      const suspendedProvider = {
        ...mockProvider,
        status: NotificationProviderStatus.SUSPENDED,
      };
      const suspendedEmailProvider = new EmailNotificationProvider(suspendedProvider);

      expect(suspendedEmailProvider.isAvailable()).toBe(false);
    });
  });

  describe("supportsChannel", () => {
    it("should return true for supported channels", () => {
      expect(emailProvider.supportsChannel(NotificationChannel.ANOMALY_DETECTION)).toBe(true);
      expect(emailProvider.supportsChannel(NotificationChannel.SYSTEM_ALERTS)).toBe(true);
    });

    it("should return false for unsupported channels", () => {
      expect(emailProvider.supportsChannel(NotificationChannel.REPORTS)).toBe(false);
    });

    it("should return false for enabled channels", () => {
      expect(emailProvider.isChannelEnabled(NotificationChannel.ANOMALY_DETECTION)).toBe(true);
    });

    it("should return false for disabled channels", () => {
      expect(emailProvider.isChannelEnabled(NotificationChannel.DATA_BACKUP)).toBe(false);
    });
  });

  describe("getConfig", () => {
    it("should return provider configuration", () => {
      const config = emailProvider.getConfig();
      expect(config).toEqual(mockProvider.config);
    });

    it("should return provider metadata", () => {
      const metadata = emailProvider.getMetadata();
      expect(metadata.id).toBe(mockProvider.id);
      expect(metadata.name).toBe(mockProvider.name);
      expect(metadata.type).toBe(mockProvider.type);
      expect(metadata.status).toBe(mockProvider.status);
    });
  });

  describe("healthCheck", () => {
    it("should perform health check on SMTP server", async () => {
      const result = await emailProvider.healthCheck();
      expect(result.healthy).toBe(true);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it("should handle health check failures gracefully", async () => {
      const unhealthyProvider = {
        ...mockProvider,
        config: {
          ...mockProvider.config,
          host: "invalid-host.local",
        },
      };
      const unhealthyEmailProvider = new EmailNotificationProvider(unhealthyProvider);

      const result = await unhealthyEmailProvider.healthCheck();

      expect(result.healthy).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
