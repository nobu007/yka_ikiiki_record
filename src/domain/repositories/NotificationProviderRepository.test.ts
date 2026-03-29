import { describe, it, expect } from "@jest/globals";
import type {
  NotificationProviderRepository,
  NotificationProviderFilterOptions,
  NotificationProviderStatistics,
} from "./NotificationProviderRepository";
import {
  NotificationProvider,
  NotificationProviderType,
  NotificationProviderStatus,
  NotificationChannel,
  type EmailProviderConfig,
} from "@/domain/entities/NotificationProvider";

describe("NotificationProviderRepository Interface", () => {
  describe("Interface Contract", () => {
    it("should define a save method", () => {
      const repository: NotificationProviderRepository = {
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
      };

      expect(typeof repository.save).toBe("function");
      expect(typeof repository.findById).toBe("function");
      expect(typeof repository.findAll).toBe("function");
      expect(typeof repository.findByType).toBe("function");
      expect(typeof repository.findByStatus).toBe("function");
      expect(typeof repository.findByChannel).toBe("function");
      expect(typeof repository.findActiveProviders).toBe("function");
      expect(typeof repository.findProvidersByChannel).toBe("function");
      expect(typeof repository.updateStatus).toBe("function");
      expect(typeof repository.updateLastUsed).toBe("function");
      expect(typeof repository.delete).toBe("function");
      expect(typeof repository.getStatistics).toBe("function");
    });
  });

  describe("Method Signatures", () => {
    let mockRepository: NotificationProviderRepository;
    const mockProvider: NotificationProvider = {
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
      } as EmailProviderConfig,
      channels: [NotificationChannel.ANOMALY_DETECTION, NotificationChannel.SYSTEM_ALERTS],
      enabledChannels: [NotificationChannel.ANOMALY_DETECTION],
      createdAt: new Date("2026-03-30T00:00:00Z"),
      updatedAt: new Date("2026-03-30T00:00:00Z"),
      lastUsedAt: new Date("2026-03-30T01:00:00Z"),
    };

    beforeEach(() => {
      mockRepository = {
        save: jest.fn().mockResolvedValue(mockProvider),
        findById: jest.fn().mockResolvedValue(mockProvider),
        findAll: jest.fn().mockResolvedValue([mockProvider]),
        findByType: jest.fn().mockResolvedValue([mockProvider]),
        findByStatus: jest.fn().mockResolvedValue([mockProvider]),
        findByChannel: jest.fn().mockResolvedValue([mockProvider]),
        findActiveProviders: jest.fn().mockResolvedValue([mockProvider]),
        findProvidersByChannel: jest.fn().mockResolvedValue([mockProvider]),
        updateStatus: jest.fn().mockResolvedValue(mockProvider),
        updateLastUsed: jest.fn().mockResolvedValue(mockProvider),
        delete: jest.fn().mockResolvedValue(true),
        getStatistics: jest.fn().mockResolvedValue({
          total: 1,
          active: 1,
          inactive: 0,
          suspended: 0,
          byType: { email: 1 },
          byChannel: { anomaly_detection: 1, system_alerts: 1 },
          mostUsedType: "email",
          mostUsedChannel: "anomaly_detection",
        }),
      };
    });

    it("should have save method that accepts NotificationProvider and returns Promise<NotificationProvider>", async () => {
      const result = await mockRepository.save(mockProvider);
      expect(result).toEqual(mockProvider);
      expect(mockRepository.save).toHaveBeenCalledWith(mockProvider);
    });

    it("should have findById method that accepts string id and returns Promise<NotificationProvider | undefined>", async () => {
      const result = await mockRepository.findById("prov-123");
      expect(result).toEqual(mockProvider);
      expect(mockRepository.findById).toHaveBeenCalledWith("prov-123");
    });

    it("should have findAll method that accepts optional filter options and returns Promise<NotificationProvider[]>", async () => {
      const options: NotificationProviderFilterOptions = {
        type: NotificationProviderType.EMAIL,
        status: NotificationProviderStatus.ACTIVE,
        limit: 10,
        offset: 0,
      };
      const result = await mockRepository.findAll(options);
      expect(result).toEqual([mockProvider]);
      expect(mockRepository.findAll).toHaveBeenCalledWith(options);
    });

    it("should have findByType method that accepts provider type and returns Promise<NotificationProvider[]>", async () => {
      const result = await mockRepository.findByType(NotificationProviderType.EMAIL);
      expect(result).toEqual([mockProvider]);
      expect(mockRepository.findByType).toHaveBeenCalledWith(NotificationProviderType.EMAIL);
    });

    it("should have findByStatus method that accepts status and returns Promise<NotificationProvider[]>", async () => {
      const result = await mockRepository.findByStatus(NotificationProviderStatus.ACTIVE);
      expect(result).toEqual([mockProvider]);
      expect(mockRepository.findByStatus).toHaveBeenCalledWith(NotificationProviderStatus.ACTIVE);
    });

    it("should have findByChannel method that accepts channel and returns Promise<NotificationProvider[]>", async () => {
      const result = await mockRepository.findByChannel(NotificationChannel.ANOMALY_DETECTION);
      expect(result).toEqual([mockProvider]);
      expect(mockRepository.findByChannel).toHaveBeenCalledWith(NotificationChannel.ANOMALY_DETECTION);
    });

    it("should have findActiveProviders method that returns Promise<NotificationProvider[]>", async () => {
      const result = await mockRepository.findActiveProviders();
      expect(result).toEqual([mockProvider]);
      expect(mockRepository.findActiveProviders).toHaveBeenCalled();
    });

    it("should have findProvidersByChannel method that accepts channel and returns Promise<NotificationProvider[]>", async () => {
      const result = await mockRepository.findProvidersByChannel(NotificationChannel.ANOMALY_DETECTION);
      expect(result).toEqual([mockProvider]);
      expect(mockRepository.findProvidersByChannel).toHaveBeenCalledWith(
        NotificationChannel.ANOMALY_DETECTION,
      );
    });

    it("should have updateStatus method that accepts id and status, returns Promise<NotificationProvider | undefined>", async () => {
      const result = await mockRepository.updateStatus("prov-123", NotificationProviderStatus.INACTIVE);
      expect(result).toEqual(mockProvider);
      expect(mockRepository.updateStatus).toHaveBeenCalledWith("prov-123", NotificationProviderStatus.INACTIVE);
    });

    it("should have updateLastUsed method that accepts id and timestamp, returns Promise<NotificationProvider | undefined>", async () => {
      const timestamp = new Date("2026-03-30T02:00:00Z");
      const result = await mockRepository.updateLastUsed("prov-123", timestamp);
      expect(result).toEqual(mockProvider);
      expect(mockRepository.updateLastUsed).toHaveBeenCalledWith("prov-123", timestamp);
    });

    it("should have delete method that accepts id and returns Promise<boolean>", async () => {
      const result = await mockRepository.delete("prov-123");
      expect(result).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith("prov-123");
    });

    it("should have getStatistics method that returns Promise<NotificationProviderStatistics>", async () => {
      const result = await mockRepository.getStatistics();
      expect(result).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.active).toBe(1);
      expect(mockRepository.getStatistics).toHaveBeenCalled();
    });
  });

  describe("NotificationProviderFilterOptions Interface", () => {
    it("should accept various filter options", () => {
      const options: NotificationProviderFilterOptions = {
        type: NotificationProviderType.EMAIL,
        status: NotificationProviderStatus.ACTIVE,
        channel: NotificationChannel.ANOMALY_DETECTION,
        limit: 10,
        offset: 0,
        sortBy: "name",
        sortOrder: "asc",
      };

      expect(options.type).toBe(NotificationProviderType.EMAIL);
      expect(options.status).toBe(NotificationProviderStatus.ACTIVE);
      expect(options.channel).toBe(NotificationChannel.ANOMALY_DETECTION);
      expect(options.limit).toBe(10);
      expect(options.offset).toBe(0);
      expect(options.sortBy).toBe("name");
      expect(options.sortOrder).toBe("asc");
    });

    it("should accept only required fields", () => {
      const options: NotificationProviderFilterOptions = {};

      expect(options).toBeDefined();
    });
  });

  describe("NotificationProviderStatistics Interface", () => {
    it("should contain all statistical fields", () => {
      const stats: NotificationProviderStatistics = {
        total: 5,
        active: 3,
        inactive: 1,
        suspended: 1,
        byType: {
          email: 2,
          webhook: 2,
          in_app: 1,
        },
        byChannel: {
          anomaly_detection: 3,
          system_alerts: 3,
          data_backup: 2,
        },
        mostUsedType: "email",
        mostUsedChannel: "anomaly_detection",
      };

      expect(stats.total).toBe(5);
      expect(stats.active).toBe(3);
      expect(stats.inactive).toBe(1);
      expect(stats.suspended).toBe(1);
      expect(stats.byType.email).toBe(2);
      expect(stats.byChannel.anomaly_detection).toBe(3);
      expect(stats.mostUsedType).toBe("email");
      expect(stats.mostUsedChannel).toBe("anomaly_detection");
    });
  });

  describe("Repository Usage Patterns", () => {
    it("should support creating a new provider", async () => {
      const repository: NotificationProviderRepository = {
        save: jest.fn().mockResolvedValue({
          id: "prov-new",
          type: NotificationProviderType.EMAIL,
          status: NotificationProviderStatus.ACTIVE,
          name: "New Email Provider",
          config: {
            host: "smtp.new.com",
            port: 587,
            secure: false,
            auth: { user: "user", pass: "pass" },
          },
          channels: [NotificationChannel.SYSTEM_ALERTS],
          enabledChannels: [NotificationChannel.SYSTEM_ALERTS],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
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
      };

      const newProvider = {
        id: "prov-new",
        type: NotificationProviderType.EMAIL,
        status: NotificationProviderStatus.ACTIVE,
        name: "New Email Provider",
        config: {
          host: "smtp.new.com",
          port: 587,
          secure: false,
          auth: { user: "user", pass: "pass" },
        },
        channels: [NotificationChannel.SYSTEM_ALERTS],
        enabledChannels: [NotificationChannel.SYSTEM_ALERTS],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const saved = await repository.save(newProvider);
      expect(saved.id).toBe("prov-new");
    });

    it("should support finding providers by multiple criteria", async () => {
      const mockProvider: NotificationProvider = {
        id: "prov-123",
        type: NotificationProviderType.EMAIL,
        status: NotificationProviderStatus.ACTIVE,
        name: "Test Provider",
        config: {
          host: "smtp.test.com",
          port: 587,
          secure: false,
          auth: { user: "user", pass: "pass" },
        },
        channels: [NotificationChannel.ANOMALY_DETECTION],
        enabledChannels: [NotificationChannel.ANOMALY_DETECTION],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const repository: NotificationProviderRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn().mockResolvedValue([mockProvider]),
        findByType: jest.fn().mockResolvedValue([mockProvider]),
        findByStatus: jest.fn().mockResolvedValue([mockProvider]),
        findByChannel: jest.fn().mockResolvedValue([mockProvider]),
        findActiveProviders: jest.fn().mockResolvedValue([mockProvider]),
        findProvidersByChannel: jest.fn().mockResolvedValue([mockProvider]),
        updateStatus: jest.fn(),
        updateLastUsed: jest.fn(),
        delete: jest.fn(),
        getStatistics: jest.fn().mockResolvedValue({
          total: 1,
          active: 1,
          inactive: 0,
          suspended: 0,
          byType: { email: 1 },
          byChannel: { anomaly_detection: 1 },
          mostUsedType: "email",
          mostUsedChannel: "anomaly_detection",
        }),
      };

      // Find all active email providers
      const results = await repository.findAll({
        type: NotificationProviderType.EMAIL,
        status: NotificationProviderStatus.ACTIVE,
      });

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe(NotificationProviderType.EMAIL);
      expect(results[0].status).toBe(NotificationProviderStatus.ACTIVE);
    });
  });
});
