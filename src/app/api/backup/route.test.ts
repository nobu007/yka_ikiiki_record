import { POST, GET } from "./route";
import { globalCircuitBreaker } from "@/lib/resilience";

jest.mock("@/lib/config/env", () => ({
  isPrismaProvider: jest.fn(() => false),
}));

jest.mock("@/infrastructure/factories/repositoryFactory", () => ({
  createBackupService: jest.fn(),
}));

import { createBackupService } from "@/infrastructure/factories/repositoryFactory";
import { BackupService } from "@/application/services/BackupService";
import { InMemoryBackupRepository } from "@/infrastructure/repositories/InMemoryBackupRepository";
import { InMemoryRecordRepository } from "@/infrastructure/storage/InMemoryRecordRepository";
import { MockStatsRepository } from "@/infrastructure/storage/MockStatsRepository";
import { InMemoryAuditLogRepository } from "@/infrastructure/repositories/InMemoryAuditLogRepository";

const mockCreateBackupService = createBackupService as jest.Mock;

describe("POST /api/backup", () => {
  let backupService: BackupService;

  beforeEach(() => {
    jest.clearAllMocks();
    globalCircuitBreaker.reset();

    const backupRepository = new InMemoryBackupRepository();
    const recordRepository = new InMemoryRecordRepository();
    const statsRepository = new MockStatsRepository();
    const auditLogRepository = new InMemoryAuditLogRepository();

    backupService = new BackupService(
      backupRepository,
      recordRepository,
      statsRepository,
      auditLogRepository,
    );

    mockCreateBackupService.mockReturnValue(backupService);
  });

  test("creates a backup and returns backup metadata", async () => {
    const request = new Request("http://localhost:3000/api/backup", {
      method: "POST",
      body: JSON.stringify({
        source: "manual",
        entities: ["Record", "Stats", "AuditLog"],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty("id");
    expect(data.data).toHaveProperty("status", "completed");
    expect(data.data).toHaveProperty("recordCount");
    expect(data.data).toHaveProperty("size");
    expect(data.data).toHaveProperty("checksum");
    expect(data.data).toHaveProperty("timestamp");
    expect(data.data.source).toBe("manual");
  });

  test("creates backup with default metadata when body is empty", async () => {
    const request = new Request("http://localhost:3000/api/backup", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty("id");
    expect(data.data).toHaveProperty("status", "completed");
  });

  test("returns 400 when request body is invalid JSON", async () => {
    const request = new Request("http://localhost:3000/api/backup", {
      method: "POST",
      body: "invalid json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  test("returns 500 when backup creation fails", async () => {
    mockCreateBackupService.mockImplementation(() => {
      throw new Error("Database error");
    });

    const request = new Request("http://localhost:3000/api/backup", {
      method: "POST",
      body: JSON.stringify({ source: "manual" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
  });
});

describe("GET /api/backup", () => {
  let backupService: BackupService;

  beforeEach(async () => {
    jest.clearAllMocks();
    globalCircuitBreaker.reset();

    const backupRepository = new InMemoryBackupRepository();
    const recordRepository = new InMemoryRecordRepository();
    const statsRepository = new MockStatsRepository();
    const auditLogRepository = new InMemoryAuditLogRepository();

    backupService = new BackupService(
      backupRepository,
      recordRepository,
      statsRepository,
      auditLogRepository,
    );

    mockCreateBackupService.mockReturnValue(backupService);

    await backupService.createBackup({ source: "manual" }, "test-user");
  });

  test("returns list of all backups", async () => {
    const request = new Request("http://localhost:3000/api/backup", {
      method: "GET",
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.data[0]).toHaveProperty("id");
    expect(data.data[0]).toHaveProperty("status");
    expect(data.data[0]).toHaveProperty("timestamp");
  });

  test("filters backups by status query parameter", async () => {
    const request = new Request("http://localhost:3000/api/backup?status=completed", {
      method: "GET",
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.every((b: any) => b.status === "completed")).toBe(true);
  });

  test("filters backups by source query parameter", async () => {
    const request = new Request("http://localhost:3000/api/backup?source=manual", {
      method: "GET",
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.every((b: any) => b.source === "manual")).toBe(true);
  });

  test("returns empty array when no backups match filter", async () => {
    const request = new Request("http://localhost:3000/api/backup?source=scheduled", {
      method: "GET",
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  test("supports limit query parameter", async () => {
    await backupService.createBackup({ source: "manual" }, "test-user");
    await backupService.createBackup({ source: "manual" }, "test-user");

    const request = new Request("http://localhost:3000/api/backup?limit=2", {
      method: "GET",
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.length).toBeLessThanOrEqual(2);
  });

  test("supports offset query parameter for pagination", async () => {
    await backupService.createBackup({ source: "manual" }, "test-user");
    await backupService.createBackup({ source: "manual" }, "test-user");

    const firstRequest = new Request("http://localhost:3000/api/backup?limit=1", {
      method: "GET",
    });
    const firstResponse = await GET(firstRequest);
    const firstData = await firstResponse.json();

    const secondRequest = new Request("http://localhost:3000/api/backup?limit=1&offset=1", {
      method: "GET",
    });
    const secondResponse = await GET(secondRequest);
    const secondData = await secondResponse.json();

    expect(firstData.data[0].id).not.toBe(secondData.data[0]?.id);
  });
});
