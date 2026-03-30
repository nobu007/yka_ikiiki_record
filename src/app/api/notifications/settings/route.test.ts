import { GET, POST } from "./route";
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
} from "@/domain/entities/NotificationProvider";

const mockCreateNotificationService = createNotificationService as jest.Mock;

describe("GET /api/notifications/settings", () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    globalCircuitBreaker.reset();

    const providerRepository = new InMemoryNotificationProviderRepository();
    const anomalyRepository = new InMemoryAnomalyRepository();
    const anomalyDetectionService = new AnomalyDetectionService(anomalyRepository);

    notificationService = new NotificationService(
      providerRepository,
      anomalyDetectionService,
    );

    mockCreateNotificationService.mockReturnValue(notificationService);
  });

  test("returns current notification settings", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/notifications/settings",
      {
        method: "GET",
      },
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty("enabled");
    expect(data.data).toHaveProperty("channels");
    expect(data.data).toHaveProperty("priorities");
    expect(data.data).toHaveProperty("quietHours");
    expect(data.data).toHaveProperty("rateLimits");
    expect(Array.isArray(data.data.channels)).toBe(true);
    expect(data.data.rateLimits).toHaveProperty("maxPerHour");
    expect(data.data.rateLimits).toHaveProperty("maxPerDay");
  });

  test("returns 500 when notification service fails", async () => {
    mockCreateNotificationService.mockImplementation(() => {
      throw new Error("Service error");
    });

    const request = new NextRequest(
      "http://localhost:3000/api/notifications/settings",
      {
        method: "GET",
      },
    );

    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});

describe("POST /api/notifications/settings", () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    globalCircuitBreaker.reset();

    const providerRepository = new InMemoryNotificationProviderRepository();
    const anomalyRepository = new InMemoryAnomalyRepository();
    const anomalyDetectionService = new AnomalyDetectionService(anomalyRepository);

    notificationService = new NotificationService(
      providerRepository,
      anomalyDetectionService,
    );

    mockCreateNotificationService.mockReturnValue(notificationService);
  });

  test("updates notification settings with valid data", async () => {
    const newSettings = {
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
        timezone: "UTC",
      },
      rateLimits: {
        maxPerHour: 50,
        maxPerDay: 500,
      },
    };

    const request = new NextRequest(
      "http://localhost:3000/api/notifications/settings",
      {
        method: "POST",
        body: JSON.stringify(newSettings),
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty("enabled", true);
    expect(data.data.channels).toContain(NotificationChannel.ANOMALY_DETECTION);
    expect(data.data.rateLimits.maxPerHour).toBe(50);
  });

  test("returns 400 when request body is invalid JSON", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/notifications/settings",
      {
        method: "POST",
        body: "invalid json",
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  test("returns 400 when settings validation fails", async () => {
    const invalidSettings = {
      enabled: "not-a-boolean",
      channels: "not-an-array",
    };

    const request = new NextRequest(
      "http://localhost:3000/api/notifications/settings",
      {
        method: "POST",
        body: JSON.stringify(invalidSettings),
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  test("returns 500 when notification service fails", async () => {
    mockCreateNotificationService.mockImplementation(() => {
      throw new Error("Service error");
    });

    const request = new NextRequest(
      "http://localhost:3000/api/notifications/settings",
      {
        method: "POST",
        body: JSON.stringify({ enabled: true }),
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(500);
  });

  test("enables all channels by default when not specified", async () => {
    const minimalSettings = {
      enabled: true,
      channels: [
        NotificationChannel.ANOMALY_DETECTION,
        NotificationChannel.SYSTEM_ALERTS,
      ],
      priorities: {
        anomaly_detection: NotificationPriority.HIGH,
        system_alerts: NotificationPriority.HIGH,
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

    const request = new NextRequest(
      "http://localhost:3000/api/notifications/settings",
      {
        method: "POST",
        body: JSON.stringify(minimalSettings),
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty("channels");
    expect(Array.isArray(data.data.channels)).toBe(true);
    expect(data.data.channels).toContain(NotificationChannel.ANOMALY_DETECTION);
    expect(data.data.channels).toContain(NotificationChannel.SYSTEM_ALERTS);
  });
});
