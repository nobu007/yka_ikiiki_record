import { POST } from "./route";
import { globalCircuitBreaker } from "@/lib/resilience";
import { NextRequest } from "next/server";

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

describe("POST /api/restore", () => {
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
  });

  test("restores from backup and returns restore result", async () => {
    const backup = await backupService.createBackup({ source: "manual" }, "test-user");

    const request = new NextRequest("http://localhost:3000/api/restore", {
      method: "POST",
      body: JSON.stringify({ backupId: backup.id }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty("backupId", backup.id);
    expect(data.data).toHaveProperty("backupTimestamp");
    expect(data.data).toHaveProperty("recordCount");
    expect(data.data).toHaveProperty("size");
  });

  test("returns 400 when backupId is missing from request body", async () => {
    const request = new NextRequest("http://localhost:3000/api/restore", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  test("returns 400 when request body is invalid JSON", async () => {
    const request = new NextRequest("http://localhost:3000/api/restore", {
      method: "POST",
      body: "invalid json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  test("returns 404 when backup not found", async () => {
    const request = new NextRequest("http://localhost:3000/api/restore", {
      method: "POST",
      body: JSON.stringify({ backupId: "non-existent-backup-id" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect([400, 404]).toContain(response.status);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  test("returns 400 when attempting to restore from non-completed backup", async () => {
    const backupRepository = new InMemoryBackupRepository();
    const recordRepository = new InMemoryRecordRepository();
    const statsRepository = new MockStatsRepository();
    const auditLogRepository = new InMemoryAuditLogRepository();

    const testService = new BackupService(
      backupRepository,
      recordRepository,
      statsRepository,
      auditLogRepository,
    );

    await backupRepository.save({
      id: "pending-backup",
      timestamp: Date.now(),
      status: "pending",
      source: "manual",
      triggeredBy: "test-user",
      entities: ["Record", "Stats", "AuditLog"],
      recordCount: 0,
      size: 0,
      checksum: "",
      errorMessage: undefined,
      metadata: {},
    });

    mockCreateBackupService.mockReturnValue(testService);

    const request = new NextRequest("http://localhost:3000/api/restore", {
      method: "POST",
      body: JSON.stringify({ backupId: "pending-backup" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Cannot restore backup");
  });

  test("returns 500 when restore operation fails", async () => {
    mockCreateBackupService.mockImplementation(() => {
      throw new Error("Service error");
    });

    const request = new NextRequest("http://localhost:3000/api/restore", {
      method: "POST",
      body: JSON.stringify({ backupId: "some-backup-id" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  test("handles restore from failed backup", async () => {
    const backupRepository = new InMemoryBackupRepository();
    const recordRepository = new InMemoryRecordRepository();
    const statsRepository = new MockStatsRepository();
    const auditLogRepository = new InMemoryAuditLogRepository();

    const testService = new BackupService(
      backupRepository,
      recordRepository,
      statsRepository,
      auditLogRepository,
    );

    await backupRepository.save({
      id: "failed-backup",
      timestamp: Date.now(),
      status: "failed",
      source: "manual",
      triggeredBy: "test-user",
      entities: ["Record", "Stats", "AuditLog"],
      recordCount: 0,
      size: 0,
      checksum: "",
      errorMessage: "Backup failed",
      metadata: {},
    });

    mockCreateBackupService.mockReturnValue(testService);

    const request = new NextRequest("http://localhost:3000/api/restore", {
      method: "POST",
      body: JSON.stringify({ backupId: "failed-backup" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Cannot restore backup");
  });
});
