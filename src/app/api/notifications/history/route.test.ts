import { GET } from "./route";
import { globalCircuitBreaker } from "@/lib/resilience";
import { NextRequest } from "next/server";

jest.mock("@/infrastructure/factories/repositoryFactory", () => ({
  createNotificationService: jest.fn(),
}));

import { createNotificationService } from "@/infrastructure/factories/repositoryFactory";
import { NotificationService } from "@/application/services/NotificationService";
import { InMemoryNotificationProviderRepository } from "@/infrastructure/storage/InMemoryNotificationProviderRepository";
import { AnomalyDetectionService } from "@/domain/services/AnomalyDetectionService";
import {
  NotificationChannel,
  NotificationPriority,
  NotificationProviderType,
  NotificationProviderStatus,
  NotificationDeliveryStatus,
} from "@/domain/entities/NotificationProvider";
import {
  AnomalyType,
  AnomalySeverity,
  type Anomaly,
} from "@/domain/entities/Anomaly";
import type { NotificationProviderRepository } from "@/domain/repositories/NotificationProviderRepository";

const mockCreateNotificationService = createNotificationService as jest.Mock;

/**
 * Adapt the storage-layer in-memory repository (which returns `null` and
 * omits a few query helpers) to the full domain repository contract.
 */
function toProviderRepository(
  repo: InMemoryNotificationProviderRepository,
): NotificationProviderRepository {
  const findAllProviders = async () => repo.findAll();
  const mostUsed = (record: Record<string, number>) =>
    Object.entries(record).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

  return {
    save: (provider) => repo.save(provider),
    findById: async (id) => (await repo.findById(id)) ?? undefined,
    findAll: () => findAllProviders(),
    findByType: async (type) =>
      (await findAllProviders()).filter((p) => p.type === type),
    findByStatus: async (status) =>
      (await findAllProviders()).filter((p) => p.status === status),
    findByChannel: async (channel) =>
      (await findAllProviders()).filter((p) => p.channels.includes(channel)),
    findActiveProviders: async () =>
      (await findAllProviders()).filter(
        (p) => p.status === NotificationProviderStatus.ACTIVE,
      ),
    findProvidersByChannel: (channel) =>
      repo.findProvidersByChannel(channel),
    updateStatus: async (id, status) =>
      (await repo.updateStatus(id, status)) ?? undefined,
    updateLastUsed: async (id, lastUsedAt) =>
      (await repo.updateLastUsed(id, lastUsedAt)) ?? undefined,
    delete: (id) => repo.delete(id),
    getStatistics: async () => {
      const providers = await findAllProviders();
      const byType: Record<string, number> = {};
      const byChannel: Record<string, number> = {};
      let active = 0;
      let inactive = 0;
      let suspended = 0;
      for (const p of providers) {
        byType[p.type] = (byType[p.type] ?? 0) + 1;
        for (const channel of p.channels) {
          byChannel[channel] = (byChannel[channel] ?? 0) + 1;
        }
        if (p.status === NotificationProviderStatus.ACTIVE) {
          active += 1;
        } else if (p.status === NotificationProviderStatus.INACTIVE) {
          inactive += 1;
        } else {
          suspended += 1;
        }
      }
      return {
        total: providers.length,
        active,
        inactive,
        suspended,
        byType,
        byChannel,
        mostUsedType: mostUsed(byType),
        mostUsedChannel: mostUsed(byChannel),
      };
    },
  };
}

describe("GET /api/notifications/history", () => {
  let notificationService: NotificationService;

  beforeEach(async () => {
    jest.clearAllMocks();
    globalCircuitBreaker.reset();

    const providerRepository = new InMemoryNotificationProviderRepository();
    await providerRepository.save({
      id: "email-provider-1",
      name: "Test Email Provider",
      type: NotificationProviderType.EMAIL,
      status: NotificationProviderStatus.ACTIVE,
      channels: [NotificationChannel.ANOMALY_DETECTION],
      enabledChannels: [NotificationChannel.ANOMALY_DETECTION],
      config: {
        host: "smtp.example.com",
        port: 587,
        secure: false,
        auth: { user: "test@example.com", pass: "password" },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const anomalyDetectionService = new AnomalyDetectionService();

    notificationService = new NotificationService(
      toProviderRepository(providerRepository),
      anomalyDetectionService,
    );

    mockCreateNotificationService.mockReturnValue(notificationService);

    // Send some test notifications to populate history
    const testAnomaly: Anomaly = {
      id: "anomaly-1",
      type: AnomalyType.UNUSUAL_PATTERN,
      severity: AnomalySeverity.HIGH,
      description: "Test anomaly",
      detectedAt: new Date(),
      context: {
        startDate: new Date(),
        endDate: new Date(),
        actualValue: 1,
        expectedValue: 0,
        deviation: 1,
      },
      recommendations: ["Fix it"],
      acknowledged: false,
    };

    await notificationService.sendAnomalyAlert(testAnomaly, ["test@example.com"]);
    await notificationService.sendAnomalyAlert(testAnomaly, ["admin@example.com"]);
  });

  test("returns notification history with default parameters", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/notifications/history",
      {
        method: "GET",
      },
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.data[0]).toHaveProperty("id");
    expect(data.data[0]).toHaveProperty("channel");
    expect(data.data[0]).toHaveProperty("priority");
    expect(data.data[0]).toHaveProperty("subject");
    expect(data.data[0]).toHaveProperty("recipients");
    expect(data.data[0]).toHaveProperty("sentAt");
  });

  test("filters notification history by channel", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/notifications/history?channel=anomaly_detection",
      {
        method: "GET",
      },
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    if (data.data.length > 0) {
      expect(data.data[0].channel).toBe(NotificationChannel.ANOMALY_DETECTION);
    }
  });

  test("filters notification history by status", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/notifications/history?status=sent",
      {
        method: "GET",
      },
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    if (data.data.length > 0) {
      expect(data.data[0].status).toBe(NotificationDeliveryStatus.SENT);
    }
  });

  test("filters notification history by priority", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/notifications/history?priority=high",
      {
        method: "GET",
      },
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    if (data.data.length > 0) {
      expect(data.data[0].priority).toBe(NotificationPriority.HIGH);
    }
  });

  test("applies limit and offset pagination", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/notifications/history?limit=1&offset=0",
      {
        method: "GET",
      },
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.length).toBeLessThanOrEqual(1);
  });

  test("filters by date range", async () => {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 1);
    const endDate = new Date();

    const request = new NextRequest(
      `http://localhost:3000/api/notifications/history?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      {
        method: "GET",
      },
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test("returns empty array when no notifications match filters", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/notifications/history?channel=system_alerts",
      {
        method: "GET",
      },
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBe(0);
  });

  test("returns 400 when limit is invalid", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/notifications/history?limit=invalid",
      {
        method: "GET",
      },
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  test("returns 400 when offset is invalid", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/notifications/history?offset=invalid",
      {
        method: "GET",
      },
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  test("returns 500 when notification service fails", async () => {
    mockCreateNotificationService.mockImplementation(() => {
      throw new Error("Service error");
    });

    const request = new NextRequest(
      "http://localhost:3000/api/notifications/history",
      {
        method: "GET",
      },
    );

    const response = await GET(request);

    expect(response.status).toBe(500);
  });

  test("returns notifications sorted by sentAt in descending order", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/notifications/history",
      {
        method: "GET",
      },
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    if (data.data.length > 1) {
      const firstDate = new Date(data.data[0].sentAt).getTime();
      const secondDate = new Date(data.data[1].sentAt).getTime();
      expect(firstDate).toBeGreaterThanOrEqual(secondDate);
    }
  });
});
