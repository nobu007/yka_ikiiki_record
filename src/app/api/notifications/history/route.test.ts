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
import { InMemoryAnomalyRepository } from "@/infrastructure/storage/InMemoryAnomalyRepository";
import {
  NotificationChannel,
  NotificationPriority,
  NotificationProviderType,
  NotificationProviderStatus,
  NotificationDeliveryStatus,
} from "@/domain/entities/NotificationProvider";
import type { Anomaly } from "@/domain/entities/Anomaly";

const mockCreateNotificationService = createNotificationService as jest.Mock;

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
        auth: { user: "test@example.com", pass: "password" },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const anomalyRepository = new InMemoryAnomalyRepository();
    const anomalyDetectionService = new AnomalyDetectionService(anomalyRepository);

    notificationService = new NotificationService(
      providerRepository,
      anomalyDetectionService,
    );

    mockCreateNotificationService.mockReturnValue(notificationService);

    // Send some test notifications to populate history
    const testAnomaly: Anomaly = {
      id: "anomaly-1",
      type: "performance_degradation",
      severity: "high",
      description: "Test anomaly",
      detectedAt: new Date(),
      recommendations: ["Fix it"],
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
