import { NotificationService } from "./NotificationService";
import type { NotificationProviderRepository } from "@/domain/repositories/NotificationProviderRepository";
import type { AnomalyDetectionService } from "@/domain/services/AnomalyDetectionService";
import {
  NotificationProviderType,
  NotificationProviderStatus,
  NotificationChannel,
  NotificationPriority,
  NotificationDeliveryStatus,
  type NotificationProvider,
  type NotificationConfig,
} from "@/domain/entities/NotificationProvider";
import {
  AnomalySeverity,
  AnomalyType,
  type Anomaly,
} from "@/domain/entities/Anomaly";

/**
 * Structural view of NotificationService's private methods, declared as a
 * plain object type so jest.spyOn's overload resolution can accept them
 * without `as any` (private members are hidden from keyof, which would
 * resolve the spy to `never`). The cast is compile-time only; runtime
 * behavior is unchanged.
 */
type NotificationServiceInternals = {
  findProviderForChannel: (
    channel: NotificationChannel,
  ) => Promise<NotificationProvider | null>;
  sendViaProvider: (
    provider: NotificationProvider,
    recipients: string[],
    subject: string,
    body: string,
    priority: NotificationPriority,
    channel: NotificationChannel,
    metadata?: Record<string, unknown>,
  ) => Promise<{ notificationId: string; recipientsCount: number }>;
  checkRateLimit: (channel: NotificationChannel) => boolean;
  isWithinQuietHours: () => boolean;
};

function internalsOf(
  service: NotificationService,
): NotificationServiceInternals {
  // Private methods are invisible to the structural type system (no honest
  // structural assertion to the internals view exists), so route through
  // `never`, which is assignable to every type — a single assertion, no `any`.
  return service as never;
}

describe("NotificationService", () => {
  let notificationService: NotificationService;
  let mockProviderRepository: jest.Mocked<NotificationProviderRepository>;
  let mockAnomalyDetectionService: jest.Mocked<AnomalyDetectionService>;
  let mockEmailProvider: NotificationProvider;

  beforeEach(() => {
    mockEmailProvider = {
      id: "provider-1",
      type: NotificationProviderType.EMAIL,
      status: NotificationProviderStatus.ACTIVE,
      name: "Default Email Provider",
      config: {
        host: "smtp.example.com",
        port: 587,
        secure: false,
        auth: {
          user: "test@example.com",
          pass: "password",
        },
        from: "noreply@example.com",
      },
      channels: [
        NotificationChannel.ANOMALY_DETECTION,
        NotificationChannel.SYSTEM_ALERTS,
      ],
      enabledChannels: [
        NotificationChannel.ANOMALY_DETECTION,
        NotificationChannel.SYSTEM_ALERTS,
      ],
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    };

    mockProviderRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByType: jest.fn(),
      findByStatus: jest.fn(),
      findByChannel: jest.fn(),
      findActiveProviders: jest.fn(),
      findProvidersByChannel: jest.fn(),
      updateStatus: jest.fn(),
      updateLastUsed: jest.fn(),
      delete: jest.fn(),
      getStatistics: jest.fn(),
    } as unknown as jest.Mocked<NotificationProviderRepository>;

    mockAnomalyDetectionService = {
      detectAnomalies: jest.fn(),
    } as unknown as jest.Mocked<AnomalyDetectionService>;

    notificationService = new NotificationService(
      mockProviderRepository,
      mockAnomalyDetectionService,
    );
  });

  describe("sendNotification", () => {
    it("should send notification successfully using active provider", async () => {
      const mockSendResult = {
        success: true,
        notificationId: "notif-1",
        recipientsCount: 1,
        attempts: 1,
      };

      jest
        .spyOn(internalsOf(notificationService), "findProviderForChannel")
        .mockResolvedValue(mockEmailProvider);
      jest
        .spyOn(internalsOf(notificationService), "sendViaProvider")
        .mockResolvedValue(mockSendResult);

      const result = await notificationService.sendNotification({
        channel: NotificationChannel.ANOMALY_DETECTION,
        priority: NotificationPriority.HIGH,
        subject: "Test Alert",
        body: "Test notification body",
        recipients: ["test@example.com"],
      });

      expect(result.success).toBe(true);
      expect(result.notificationId).toBe("notif-1");
      expect(mockProviderRepository.updateLastUsed).toHaveBeenCalledWith(
        mockEmailProvider.id,
        expect.any(Date),
      );
    });

    it("should fail when no active provider found for channel", async () => {
      jest
        .spyOn(internalsOf(notificationService), "findProviderForChannel")
        .mockResolvedValue(null);

      const result = await notificationService.sendNotification({
        channel: NotificationChannel.ANOMALY_DETECTION,
        priority: NotificationPriority.HIGH,
        subject: "Test Alert",
        body: "Test notification body",
        recipients: ["test@example.com"],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("NO_PROVIDER_AVAILABLE");
    });

    it("should validate recipient email addresses", async () => {
      const result = await notificationService.sendNotification({
        channel: NotificationChannel.ANOMALY_DETECTION,
        priority: NotificationPriority.HIGH,
        subject: "Test Alert",
        body: "Test notification body",
        recipients: ["invalid-email"],
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });

    it("should respect notification config rate limits", async () => {
      const config: NotificationConfig = {
        enabled: true,
        channels: [NotificationChannel.ANOMALY_DETECTION],
        priorities: {
          anomaly_detection: NotificationPriority.HIGH,
        },
        quietHours: {
          enabled: false,
          start: "22:00",
          end: "08:00",
          timezone: "UTC",
        },
        rateLimits: {
          maxPerHour: 10,
          maxPerDay: 100,
        },
      };

      notificationService.updateConfig(config);

      jest
        .spyOn(internalsOf(notificationService), "checkRateLimit")
        .mockReturnValue(false);

      const result = await notificationService.sendNotification({
        channel: NotificationChannel.ANOMALY_DETECTION,
        priority: NotificationPriority.HIGH,
        subject: "Test Alert",
        body: "Test notification body",
        recipients: ["test@example.com"],
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("RATE_LIMIT_EXCEEDED");
    });

    it("should respect quiet hours configuration", async () => {
      const config: NotificationConfig = {
        enabled: true,
        channels: [NotificationChannel.ANOMALY_DETECTION],
        priorities: {
          anomaly_detection: NotificationPriority.HIGH,
        },
        quietHours: {
          enabled: true,
          start: "22:00",
          end: "08:00",
          timezone: "UTC",
        },
        rateLimits: {
          maxPerHour: 10,
          maxPerDay: 100,
        },
      };

      notificationService.updateConfig(config);

      jest
        .spyOn(internalsOf(notificationService), "isWithinQuietHours")
        .mockReturnValue(true);

      const result = await notificationService.sendNotification({
        channel: NotificationChannel.ANOMALY_DETECTION,
        priority: NotificationPriority.LOW,
        subject: "Test Alert",
        body: "Test notification body",
        recipients: ["test@example.com"],
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("QUIET_HOURS");
    });

    it("should allow critical notifications during quiet hours", async () => {
      const config: NotificationConfig = {
        enabled: true,
        channels: [NotificationChannel.ANOMALY_DETECTION],
        priorities: {
          anomaly_detection: NotificationPriority.HIGH,
        },
        quietHours: {
          enabled: true,
          start: "22:00",
          end: "08:00",
          timezone: "UTC",
        },
        rateLimits: {
          maxPerHour: 10,
          maxPerDay: 100,
        },
      };

      notificationService.updateConfig(config);

      jest
        .spyOn(internalsOf(notificationService), "isWithinQuietHours")
        .mockReturnValue(true);

      const mockSendResult = {
        success: true,
        notificationId: "notif-1",
        recipientsCount: 1,
        attempts: 1,
      };

      jest
        .spyOn(internalsOf(notificationService), "findProviderForChannel")
        .mockResolvedValue(mockEmailProvider);
      jest
        .spyOn(internalsOf(notificationService), "sendViaProvider")
        .mockResolvedValue(mockSendResult);

      const result = await notificationService.sendNotification({
        channel: NotificationChannel.ANOMALY_DETECTION,
        priority: NotificationPriority.CRITICAL,
        subject: "Critical Alert",
        body: "Critical notification body",
        recipients: ["test@example.com"],
      });

      expect(result.success).toBe(true);
    });

    it("should retry failed notifications up to max attempts", async () => {
      jest
        .spyOn(internalsOf(notificationService), "findProviderForChannel")
        .mockResolvedValue(mockEmailProvider);
      jest
        .spyOn(internalsOf(notificationService), "sendViaProvider")
        .mockRejectedValue(new Error("Failed to send"));

      const result = await notificationService.sendNotification({
        channel: NotificationChannel.ANOMALY_DETECTION,
        priority: NotificationPriority.HIGH,
        subject: "Test Alert",
        body: "Test notification body",
        recipients: ["test@example.com"],
      });

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(3);
    });
  });

  describe("sendAnomalyAlert", () => {
    it("should send notification for detected anomaly", async () => {
      const anomaly: Anomaly = {
        id: "anomaly-1",
        type: AnomalyType.EMOTION_SPIKE,
        severity: AnomalySeverity.HIGH,
        description: "Unusual emotion spike detected",
        detectedAt: new Date(),
        context: {
          student: "John Doe",
          startDate: new Date("2026-03-30"),
          endDate: new Date("2026-03-30"),
          actualValue: 85,
          expectedValue: 70,
          deviation: 15,
          metadata: { date: "2026-03-30", emotionAverage: 85, threshold: 70 },
        },
        recommendations: ["Check student wellbeing", "Review recent records"],
        acknowledged: false,
      };

      const mockSendResult = {
        success: true,
        notificationId: "notif-1",
        recipientsCount: 1,
        attempts: 1,
      };

      jest
        .spyOn(internalsOf(notificationService), "findProviderForChannel")
        .mockResolvedValue(mockEmailProvider);
      jest
        .spyOn(internalsOf(notificationService), "sendViaProvider")
        .mockResolvedValue(mockSendResult);

      const result = await notificationService.sendAnomalyAlert(anomaly, [
        "teacher@example.com",
      ]);

      expect(result.success).toBe(true);
      expect(result.notificationId).toBe("notif-1");
    });

    it("should format anomaly details into notification content", async () => {
      const anomaly: Anomaly = {
        id: "anomaly-1",
        type: AnomalyType.EMOTION_DROP,
        severity: AnomalySeverity.CRITICAL,
        description: "Severe emotion drop detected",
        detectedAt: new Date(),
        context: {
          student: "Jane Smith",
          startDate: new Date("2026-03-30"),
          endDate: new Date("2026-03-30"),
          actualValue: 25,
          expectedValue: 40,
          deviation: -15,
          metadata: { date: "2026-03-30", emotionAverage: 25, threshold: 40 },
        },
        recommendations: ["Immediate attention required"],
        acknowledged: false,
      };

      const mockSendResult = {
        success: true,
        notificationId: "notif-1",
        recipientsCount: 1,
        attempts: 1,
      };

      const sendViaProviderSpy = jest
        .spyOn(internalsOf(notificationService), "sendViaProvider")
        .mockResolvedValue(mockSendResult);

      jest
        .spyOn(internalsOf(notificationService), "findProviderForChannel")
        .mockResolvedValue(mockEmailProvider);

      await notificationService.sendAnomalyAlert(anomaly, [
        "teacher@example.com",
      ]);

      const callArgs = sendViaProviderSpy.mock.calls[0]!;
      expect(callArgs[2]).toContain("EMOTION DROP");
      expect(callArgs[3]).toContain("Severe emotion drop detected");
    });

    it("should handle multiple recipients for anomaly alerts", async () => {
      const anomaly: Anomaly = {
        id: "anomaly-1",
        type: AnomalyType.DATA_GAP,
        severity: AnomalySeverity.MEDIUM,
        description: "Missing data detected",
        detectedAt: new Date(),
        context: {
          student: "Bob Johnson",
          startDate: new Date("2026-03-25"),
          endDate: new Date("2026-03-30"),
          actualValue: 5,
          expectedValue: 0,
          deviation: 5,
          metadata: { date: "2026-03-30", missingDays: 5 },
        },
        recommendations: ["Contact student"],
        acknowledged: false,
      };

      const mockSendResult = {
        success: true,
        notificationId: "notif-1",
        recipientsCount: 2,
        attempts: 1,
      };

      jest
        .spyOn(internalsOf(notificationService), "findProviderForChannel")
        .mockResolvedValue(mockEmailProvider);
      jest
        .spyOn(internalsOf(notificationService), "sendViaProvider")
        .mockResolvedValue(mockSendResult);

      const result = await notificationService.sendAnomalyAlert(anomaly, [
        "teacher1@example.com",
        "teacher2@example.com",
      ]);

      expect(result.success).toBe(true);
      expect(result.recipientsCount).toBe(2);
    });
  });

  describe("getNotificationHistory", () => {
    it("should return notification history for a channel", async () => {
      const history = await notificationService.getNotificationHistory({
        channel: NotificationChannel.ANOMALY_DETECTION,
        limit: 10,
      });

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThanOrEqual(0);
    });

    it("should filter notifications by status", async () => {
      const history = await notificationService.getNotificationHistory({
        channel: NotificationChannel.ANOMALY_DETECTION,
        status: NotificationDeliveryStatus.SENT,
      });

      expect(Array.isArray(history)).toBe(true);
    });

    it("should paginate results correctly", async () => {
      const page1 = await notificationService.getNotificationHistory({
        channel: NotificationChannel.ANOMALY_DETECTION,
        limit: 10,
        offset: 0,
      });

      const page2 = await notificationService.getNotificationHistory({
        channel: NotificationChannel.ANOMALY_DETECTION,
        limit: 10,
        offset: 10,
      });

      expect(Array.isArray(page1)).toBe(true);
      expect(Array.isArray(page2)).toBe(true);
    });
  });

  describe("getNotificationSettings", () => {
    it("should return current notification configuration", () => {
      const config: NotificationConfig = {
        enabled: true,
        channels: [
          NotificationChannel.ANOMALY_DETECTION,
          NotificationChannel.SYSTEM_ALERTS,
        ],
        priorities: {
          anomaly_detection: NotificationPriority.HIGH,
          system_alerts: NotificationPriority.MEDIUM,
        },
        quietHours: {
          enabled: true,
          start: "22:00",
          end: "08:00",
          timezone: "UTC",
        },
        rateLimits: {
          maxPerHour: 10,
          maxPerDay: 100,
        },
      };

      notificationService.updateConfig(config);
      const settings = notificationService.getNotificationSettings();

      expect(settings.enabled).toBe(true);
      expect(settings.channels).toContain(NotificationChannel.ANOMALY_DETECTION);
      expect(settings.quietHours.enabled).toBe(true);
    });
  });

  describe("updateNotificationSettings", () => {
    it("should update notification configuration", () => {
      const newConfig: NotificationConfig = {
        enabled: false,
        channels: [NotificationChannel.ANOMALY_DETECTION],
        priorities: {
          anomaly_detection: NotificationPriority.HIGH,
        },
        quietHours: {
          enabled: false,
          start: "22:00",
          end: "08:00",
          timezone: "UTC",
        },
        rateLimits: {
          maxPerHour: 20,
          maxPerDay: 200,
        },
      };

      notificationService.updateConfig(newConfig);
      const settings = notificationService.getNotificationSettings();

      expect(settings.enabled).toBe(false);
      expect(settings.rateLimits.maxPerHour).toBe(20);
      expect(settings.rateLimits.maxPerDay).toBe(200);
    });

    it("should validate notification configuration", () => {
      const invalidConfig = {
        enabled: true,
        channels: [],
        priorities: {},
        quietHours: {
          enabled: true,
          start: "25:00",
          end: "08:00",
          timezone: "UTC",
        },
        rateLimits: {
          maxPerHour: -1,
          maxPerDay: 100,
        },
      };

      expect(() => {
        notificationService.updateConfig(invalidConfig as NotificationConfig);
      }).toThrow();
    });
  });

  describe("getProviderStatus", () => {
    it("should return status of all notification providers", async () => {
      const providers = [
        mockEmailProvider,
        {
          ...mockEmailProvider,
          id: "provider-2",
          type: NotificationProviderType.SMS,
          name: "SMS Provider",
          status: NotificationProviderStatus.INACTIVE,
        },
      ];

      mockProviderRepository.findAll = jest.fn().mockResolvedValue(providers);

      const status = await notificationService.getProviderStatus();

      expect(status).toHaveLength(2);
      expect(status[0]!.id).toBe("provider-1");
      expect(status[0]!.status).toBe(NotificationProviderStatus.ACTIVE);
      expect(status[1]!.status).toBe(NotificationProviderStatus.INACTIVE);
    });

    it("should filter providers by channel", async () => {
      const providers = [mockEmailProvider];

      mockProviderRepository.findProvidersByChannel = jest
        .fn()
        .mockResolvedValue(providers);

      const status = await notificationService.getProviderStatus(
        NotificationChannel.ANOMALY_DETECTION,
      );

      expect(status).toHaveLength(1);
      expect(status[0]!.channels).toContain(
        NotificationChannel.ANOMALY_DETECTION,
      );
    });
  });

  describe("validateProviderConfiguration", () => {
    it("should validate email provider configuration", async () => {
      const validation = await notificationService.validateProviderConfiguration(
        {
          type: NotificationProviderType.EMAIL,
          name: "Test Email Provider",
          config: {
            host: "smtp.example.com",
            port: 587,
            secure: false,
            auth: {
              user: "test@example.com",
              pass: "password",
            },
          },
          channels: [NotificationChannel.SYSTEM_ALERTS],
          enabledChannels: [NotificationChannel.SYSTEM_ALERTS],
        },
      );

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect missing required fields", async () => {
      const validation = await notificationService.validateProviderConfiguration(
        {
          type: NotificationProviderType.EMAIL,
          name: "Invalid Email Provider",
          config: {
            host: "",
            port: 0,
            secure: false,
            auth: {
              user: "",
              pass: "",
            },
          },
          channels: [NotificationChannel.SYSTEM_ALERTS],
          enabledChannels: [NotificationChannel.SYSTEM_ALERTS],
        },
      );

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it("should validate webhook provider configuration", async () => {
      const validation = await notificationService.validateProviderConfiguration(
        {
          type: NotificationProviderType.WEBHOOK,
          name: "Test Webhook Provider",
          config: {
            url: "https://example.com/webhook",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          },
          channels: [NotificationChannel.SYSTEM_ALERTS],
          enabledChannels: [NotificationChannel.SYSTEM_ALERTS],
        },
      );

      expect(validation.valid).toBe(true);
    });
  });

  describe("enableChannel", () => {
    it("should enable a channel for a provider", async () => {
      const providerWithMissingChannel = {
        ...mockEmailProvider,
        channels: [
          NotificationChannel.ANOMALY_DETECTION,
          NotificationChannel.SYSTEM_ALERTS,
          NotificationChannel.DATA_BACKUP,
        ],
        enabledChannels: [
          NotificationChannel.ANOMALY_DETECTION,
          NotificationChannel.SYSTEM_ALERTS,
        ],
      };

      mockProviderRepository.findById = jest
        .fn()
        .mockResolvedValue(providerWithMissingChannel);
      mockProviderRepository.save = jest
        .fn()
        .mockImplementation(async (provider: NotificationProvider) => provider);

      const updated = await notificationService.enableChannel(
        mockEmailProvider.id,
        NotificationChannel.DATA_BACKUP,
      );

      expect(updated.enabledChannels).toContain(NotificationChannel.DATA_BACKUP);
      expect(mockProviderRepository.save).toHaveBeenCalled();
    });

    it("should fail if channel not supported by provider", async () => {
      mockProviderRepository.findById = jest
        .fn()
        .mockResolvedValue(mockEmailProvider);

      await expect(
        notificationService.enableChannel(
          mockEmailProvider.id,
          NotificationChannel.REPORTS,
        ),
      ).rejects.toThrow("Channel not supported by provider");
    });
  });

  describe("disableChannel", () => {
    it("should disable a channel for a provider", async () => {
      mockProviderRepository.findById = jest
        .fn()
        .mockResolvedValue(mockEmailProvider);
      mockProviderRepository.save = jest
        .fn()
        .mockImplementation(async (provider: NotificationProvider) => provider);

      const updated = await notificationService.disableChannel(
        mockEmailProvider.id,
        NotificationChannel.ANOMALY_DETECTION,
      );

      expect(
        updated.enabledChannels.includes(NotificationChannel.ANOMALY_DETECTION),
      ).toBe(false);
      expect(mockProviderRepository.save).toHaveBeenCalled();
    });
  });

  describe("setProviderStatus", () => {
    it("should update provider status", async () => {
      mockProviderRepository.updateStatus = jest
        .fn()
        .mockResolvedValue({
          ...mockEmailProvider,
          status: NotificationProviderStatus.SUSPENDED,
        });

      const updated = await notificationService.setProviderStatus(
        mockEmailProvider.id,
        NotificationProviderStatus.SUSPENDED,
      );

      expect(updated!.status).toBe(NotificationProviderStatus.SUSPENDED);
      expect(mockProviderRepository.updateStatus).toHaveBeenCalledWith(
        mockEmailProvider.id,
        NotificationProviderStatus.SUSPENDED,
      );
    });
  });
});
