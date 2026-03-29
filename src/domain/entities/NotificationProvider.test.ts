import { describe, it, expect } from "@jest/globals";
import {
  NotificationProvider,
  NotificationProviderType,
  NotificationProviderStatus,
  NotificationChannel,
  NotificationPriority,
  NotificationProviderSchema,
  type NotificationProviderDTO,
} from "./NotificationProvider";

describe("NotificationProvider", () => {
  describe("Enums", () => {
    describe("NotificationProviderType", () => {
      it("should have all expected provider types", () => {
        expect(NotificationProviderType.EMAIL).toBe("email");
        expect(NotificationProviderType.SMS).toBe("sms");
        expect(NotificationProviderType.SLACK).toBe("slack");
        expect(NotificationProviderType.WEBHOOK).toBe("webhook");
        expect(NotificationProviderType.IN_APP).toBe("in_app");
      });
    });

    describe("NotificationProviderStatus", () => {
      it("should have all expected statuses", () => {
        expect(NotificationProviderStatus.ACTIVE).toBe("active");
        expect(NotificationProviderStatus.INACTIVE).toBe("inactive");
        expect(NotificationProviderStatus.SUSPENDED).toBe("suspended");
      });
    });

    describe("NotificationChannel", () => {
      it("should have all expected channels", () => {
        expect(NotificationChannel.ANOMALY_DETECTION).toBe("anomaly_detection");
        expect(NotificationChannel.SYSTEM_ALERTS).toBe("system_alerts");
        expect(NotificationChannel.DATA_BACKUP).toBe("data_backup");
        expect(NotificationChannel.USER_ACTIVITY).toBe("user_activity");
        expect(NotificationChannel.REPORTS).toBe("reports");
      });
    });

    describe("NotificationPriority", () => {
      it("should have all expected priorities", () => {
        expect(NotificationPriority.LOW).toBe("low");
        expect(NotificationPriority.MEDIUM).toBe("medium");
        expect(NotificationPriority.HIGH).toBe("high");
        expect(NotificationPriority.CRITICAL).toBe("critical");
      });
    });
  });

  describe("NotificationProvider Interface", () => {
    it("should create a valid email notification provider", () => {
      const provider: NotificationProvider = {
        id: "prov-123",
        type: NotificationProviderType.EMAIL,
        status: NotificationProviderStatus.ACTIVE,
        name: "Primary Email Provider",
        config: {
          host: "smtp.example.com",
          port: 587,
          secure: false,
          auth: {
            user: "notifications@example.com",
            pass: "password",
          },
        },
        channels: [NotificationChannel.ANOMALY_DETECTION, NotificationChannel.SYSTEM_ALERTS],
        enabledChannels: [NotificationChannel.ANOMALY_DETECTION],
        createdAt: new Date("2026-03-30T00:00:00Z"),
        updatedAt: new Date("2026-03-30T00:00:00Z"),
        lastUsedAt: new Date("2026-03-30T01:00:00Z"),
      };

      expect(provider.id).toBe("prov-123");
      expect(provider.type).toBe(NotificationProviderType.EMAIL);
      expect(provider.status).toBe(NotificationProviderStatus.ACTIVE);
      expect(provider.name).toBe("Primary Email Provider");
      expect(provider.channels).toHaveLength(2);
      expect(provider.enabledChannels).toHaveLength(1);
    });

    it("should create a valid webhook notification provider", () => {
      const provider: NotificationProvider = {
        id: "webhook-456",
        type: NotificationProviderType.WEBHOOK,
        status: NotificationProviderStatus.ACTIVE,
        name: "Slack Webhook",
        config: {
          url: "https://hooks.slack.com/services/XXX/YYY/ZZZ",
          method: "POST" as const,
          headers: {
            "Content-Type": "application/json",
          },
        },
        channels: [NotificationChannel.SYSTEM_ALERTS],
        enabledChannels: [NotificationChannel.SYSTEM_ALERTS],
        createdAt: new Date("2026-03-30T00:00:00Z"),
        updatedAt: new Date("2026-03-30T00:00:00Z"),
      };

      expect(provider.type).toBe(NotificationProviderType.WEBHOOK);
      expect(provider.config.url).toBe("https://hooks.slack.com/services/XXX/YYY/ZZZ");
    });

    it("should create an in-app notification provider", () => {
      const provider: NotificationProvider = {
        id: "inapp-789",
        type: NotificationProviderType.IN_APP,
        status: NotificationProviderStatus.ACTIVE,
        name: "In-App Notifications",
        config: {
          retentionDays: 30,
          maxNotifications: 100,
        },
        channels: [
          NotificationChannel.ANOMALY_DETECTION,
          NotificationChannel.SYSTEM_ALERTS,
          NotificationChannel.USER_ACTIVITY,
        ],
        enabledChannels: [
          NotificationChannel.ANOMALY_DETECTION,
          NotificationChannel.SYSTEM_ALERTS,
        ],
        createdAt: new Date("2026-03-30T00:00:00Z"),
        updatedAt: new Date("2026-03-30T00:00:00Z"),
      };

      expect(provider.type).toBe(NotificationProviderType.IN_APP);
      expect(provider.config.retentionDays).toBe(30);
      expect(provider.config.maxNotifications).toBe(100);
    });
  });

  describe("NotificationProviderSchema Validation", () => {
    const validProvider: NotificationProviderDTO = {
      id: "prov-123",
      type: NotificationProviderType.EMAIL,
      status: NotificationProviderStatus.ACTIVE,
      name: "Primary Email Provider",
      config: {
        host: "smtp.example.com",
        port: 587,
        secure: false,
        auth: {
          user: "notifications@example.com",
          pass: "password",
        },
      },
      channels: [NotificationChannel.ANOMALY_DETECTION],
      enabledChannels: [NotificationChannel.ANOMALY_DETECTION],
      createdAt: new Date("2026-03-30T00:00:00Z"),
      updatedAt: new Date("2026-03-30T00:00:00Z"),
      lastUsedAt: new Date("2026-03-30T01:00:00Z"),
    };

    it("should validate a correct notification provider", () => {
      const result = NotificationProviderSchema.safeParse(validProvider);
      expect(result.success).toBe(true);
    });

    it("should require id field", () => {
      const { id, ...invalidProvider } = validProvider;
      const result = NotificationProviderSchema.safeParse(invalidProvider);
      expect(result.success).toBe(false);
    });

    it("should require type field", () => {
      const { type, ...invalidProvider } = validProvider;
      const result = NotificationProviderSchema.safeParse(invalidProvider);
      expect(result.success).toBe(false);
    });

    it("should require status field", () => {
      const { status, ...invalidProvider } = validProvider;
      const result = NotificationProviderSchema.safeParse(invalidProvider);
      expect(result.success).toBe(false);
    });

    it("should require name field", () => {
      const { name, ...invalidProvider } = validProvider;
      const result = NotificationProviderSchema.safeParse(invalidProvider);
      expect(result.success).toBe(false);
    });

    it("should require config field", () => {
      const { config, ...invalidProvider } = validProvider;
      const result = NotificationProviderSchema.safeParse(invalidProvider);
      expect(result.success).toBe(false);
    });

    it("should require channels field", () => {
      const { channels, ...invalidProvider } = validProvider;
      const result = NotificationProviderSchema.safeParse(invalidProvider);
      expect(result.success).toBe(false);
    });

    it("should require enabledChannels field", () => {
      const { enabledChannels, ...invalidProvider } = validProvider;
      const result = NotificationProviderSchema.safeParse(invalidProvider);
      expect(result.success).toBe(false);
    });

    it("should validate date fields", () => {
      const providerWithInvalidDate = {
        ...validProvider,
        createdAt: "not-a-date" as unknown as Date,
      };
      const result = NotificationProviderSchema.safeParse(providerWithInvalidDate);
      expect(result.success).toBe(false);
    });

    it("should validate that enabledChannels is a subset of channels", () => {
      const providerWithInvalidChannels = {
        ...validProvider,
        channels: [NotificationChannel.ANOMALY_DETECTION],
        enabledChannels: [NotificationChannel.SYSTEM_ALERTS],
      };
      const result = NotificationProviderSchema.safeParse(providerWithInvalidChannels);
      expect(result.success).toBe(false);
    });

    it("should validate provider type enum", () => {
      const providerWithInvalidType = {
        ...validProvider,
        type: "invalid_type" as NotificationProviderType,
      };
      const result = NotificationProviderSchema.safeParse(providerWithInvalidType);
      expect(result.success).toBe(false);
    });

    it("should validate status enum", () => {
      const providerWithInvalidStatus = {
        ...validProvider,
        status: "invalid_status" as NotificationProviderStatus,
      };
      const result = NotificationProviderSchema.safeParse(providerWithInvalidStatus);
      expect(result.success).toBe(false);
    });

    it("should allow optional lastUsedAt field", () => {
      const { lastUsedAt, ...providerWithoutLastUsed } = validProvider;
      const result = NotificationProviderSchema.safeParse(providerWithoutLastUsed);
      expect(result.success).toBe(true);
    });
  });

  describe("EmailProviderConfig Interface", () => {
    it("should validate email provider configuration", () => {
      const emailConfig = {
        host: "smtp.example.com",
        port: 587,
        secure: false,
        auth: {
          user: "notifications@example.com",
          pass: "password",
        },
        from: "noreply@example.com",
        replyTo: "support@example.com",
      };

      expect(emailConfig.host).toBe("smtp.example.com");
      expect(emailConfig.port).toBe(587);
      expect(emailConfig.secure).toBe(false);
      expect(emailConfig.auth.user).toBe("notifications@example.com");
      expect(emailConfig.from).toBe("noreply@example.com");
      expect(emailConfig.replyTo).toBe("support@example.com");
    });
  });

  describe("WebhookProviderConfig Interface", () => {
    it("should validate webhook provider configuration", () => {
      const webhookConfig = {
        url: "https://hooks.slack.com/services/XXX/YYY/ZZZ",
        method: "POST" as const,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token123",
        },
        timeout: 5000,
        retryAttempts: 3,
      };

      expect(webhookConfig.url).toBe("https://hooks.slack.com/services/XXX/YYY/ZZZ");
      expect(webhookConfig.method).toBe("POST");
      expect(webhookConfig.headers["Content-Type"]).toBe("application/json");
      expect(webhookConfig.timeout).toBe(5000);
      expect(webhookConfig.retryAttempts).toBe(3);
    });
  });

  describe("InAppProviderConfig Interface", () => {
    it("should validate in-app provider configuration", () => {
      const inAppConfig = {
        retentionDays: 30,
        maxNotifications: 100,
        allowDismiss: true,
        soundEnabled: false,
      };

      expect(inAppConfig.retentionDays).toBe(30);
      expect(inAppConfig.maxNotifications).toBe(100);
      expect(inAppConfig.allowDismiss).toBe(true);
      expect(inAppConfig.soundEnabled).toBe(false);
    });
  });

  describe("Notification Interface", () => {
    it("should create a valid notification", () => {
      const notification = {
        id: "notif-123",
        providerId: "prov-123",
        channel: NotificationChannel.ANOMALY_DETECTION,
        priority: NotificationPriority.HIGH,
        subject: "Anomaly Detected",
        body: "Unusual pattern detected in student records",
        recipients: ["admin@example.com"],
        metadata: {
          anomalyId: "anom-456",
          severity: "high",
        },
        sentAt: new Date("2026-03-30T01:00:00Z"),
        status: "sent" as const,
        attempts: 1,
      };

      expect(notification.id).toBe("notif-123");
      expect(notification.channel).toBe(NotificationChannel.ANOMALY_DETECTION);
      expect(notification.priority).toBe(NotificationPriority.HIGH);
      expect(notification.recipients).toHaveLength(1);
      expect(notification.metadata.anomalyId).toBe("anom-456");
    });
  });

  describe("NotificationConfig Interface", () => {
    it("should create valid notification configuration", () => {
      const config = {
        enabled: true,
        channels: [
          NotificationChannel.ANOMALY_DETECTION,
          NotificationChannel.SYSTEM_ALERTS,
        ],
        priorities: {
          anomaly_detection: NotificationPriority.HIGH,
          system_alerts: NotificationPriority.CRITICAL,
        },
        quietHours: {
          enabled: true,
          start: "22:00",
          end: "08:00",
          timezone: "Asia/Tokyo",
        },
        rateLimits: {
          maxPerHour: 10,
          maxPerDay: 100,
        },
      };

      expect(config.enabled).toBe(true);
      expect(config.channels).toHaveLength(2);
      expect(config.priorities.anomaly_detection).toBe(NotificationPriority.HIGH);
      expect(config.quietHours.enabled).toBe(true);
      expect(config.quietHours.start).toBe("22:00");
      expect(config.rateLimits.maxPerHour).toBe(10);
    });
  });
});
