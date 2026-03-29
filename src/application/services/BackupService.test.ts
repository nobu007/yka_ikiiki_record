import { BackupService } from "./BackupService";
import type { Backup, BackupMetadata } from "@/domain/entities/Backup";
import type { RestoreResult } from "@/domain/repositories/BackupRepository";
import type { BackupQuery, BackupQueryResult } from "@/domain/repositories/BackupRepository";
import type { Record } from "@/domain/entities/Record";
import type { Stats } from "@/domain/entities/Stats";
import type { AuditLog } from "@/domain/entities/AuditLog";

describe("BackupService", () => {
  let backupService: BackupService;
  let mockBackupRepository: ReturnType<typeof createMockBackupRepository>;
  let mockRecordRepository: ReturnType<typeof createMockRecordRepository>;
  let mockStatsRepository: ReturnType<typeof createMockStatsRepository>;
  let mockAuditLogRepository: ReturnType<typeof createMockAuditLogRepository>;

  function createMockBackupRepository() {
    const backups: Backup[] = [];
    return {
      save: jest.fn(async (backup: Backup) => {
        const existingIndex = backups.findIndex((b) => b.id === backup.id);
        if (existingIndex !== -1) {
          backups[existingIndex] = backup;
        } else {
          backups.push(backup);
        }
      }),
      findById: jest.fn(async (id: string) => {
        return backups.find((b) => b.id === id) ?? null;
      }),
      query: jest.fn(async (query: BackupQuery): Promise<BackupQueryResult> => {
        let results = [...backups];
        if (query.status !== undefined) {
          results = results.filter((b) => b.status === query.status);
        }
        if (query.source !== undefined) {
          results = results.filter((b) => b.metadata.source === query.source);
        }
        if (query.triggeredBy !== undefined) {
          results = results.filter((b) => b.metadata.triggeredBy === query.triggeredBy);
        }
        if (query.limit !== undefined) {
          results = results.slice(0, query.limit);
        }
        return { backups: results, totalCount: results.length };
      }),
      deleteOlderThan: jest.fn(async (beforeTimestamp: number) => {
        const beforeCount = backups.length;
        const filtered = backups.filter((b) => b.timestamp >= beforeTimestamp);
        backups.length = 0;
        backups.push(...filtered);
        return beforeCount - backups.length;
      }),
      delete: jest.fn(async (id: string) => {
        const index = backups.findIndex((b) => b.id === id);
        if (index === -1) {
          throw new Error(`Backup with id '${id}' not found`);
        }
        backups.splice(index, 1);
      }),
      restore: jest.fn(async (id: string): Promise<RestoreResult> => {
        const backup = backups.find((b) => b.id === id);
        if (!backup) {
          throw new Error(`Backup with id '${id}' not found`);
        }
        if (backup.status !== "completed") {
          throw new Error(
            `Cannot restore backup with status '${backup.status}'. Only completed backups can be restored.`,
          );
        }
        return {
          recordCount: backup.recordCount,
          size: backup.size,
          backupTimestamp: backup.timestamp,
          backupId: backup.id,
        };
      }),
      findLatestCompleted: jest.fn(async () => {
        const completed = backups.filter((b) => b.status === "completed");
        if (completed.length === 0) return null;
        completed.sort((a, b) => b.timestamp - a.timestamp);
        return completed[0];
      }),
      count: jest.fn(async () => backups.length),
      getTotalSize: jest.fn(async () => backups.reduce((sum, b) => sum + b.size, 0)),
      _getBackups: () => backups,
    };
  }

  function createMockRecordRepository() {
    const records: Record[] = [];
    return {
      create: jest.fn(async (record: Omit<Record, "id">) => {
        const newRecord: Record = { ...record, id: records.length + 1 };
        records.push(newRecord);
        return newRecord;
      }),
      findAll: jest.fn(async () => [...records]),
      save: jest.fn(),
      delete: jest.fn(async (id: number) => {
        const index = records.findIndex((r) => r.id === id);
        if (index !== -1) records.splice(index, 1);
      }),
      _addRecord: (record: Record) => records.push(record),
      _clear: () => records.length = 0,
    };
  }

  function createMockStatsRepository() {
    const stats: Stats[] = [];
    return {
      create: jest.fn(async (stat: Omit<Stats, "id">) => {
        const newStat: Stats = { ...stat, id: stats.length + 1 };
        stats.push(newStat);
        return newStat;
      }),
      findAll: jest.fn(async () => [...stats]),
      save: jest.fn(),
      _addStats: (stat: Stats) => stats.push(stat),
      _clear: () => stats.length = 0,
    };
  }

  function createMockAuditLogRepository() {
    const logs: AuditLog[] = [];
    return {
      create: jest.fn(async (log: Omit<AuditLog, "id">) => {
        const newLog: AuditLog = { ...log, id: `audit-${logs.length + 1}` };
        logs.push(newLog);
        return newLog;
      }),
      findAll: jest.fn(async () => [...logs]),
      save: jest.fn(),
      _addLog: (log: AuditLog) => logs.push(log),
      _clear: () => logs.length = 0,
    };
  }

  beforeEach(() => {
    mockBackupRepository = createMockBackupRepository();
    mockRecordRepository = createMockRecordRepository();
    mockStatsRepository = createMockStatsRepository();
    mockAuditLogRepository = createMockAuditLogRepository();

    backupService = new BackupService(
      mockBackupRepository as any,
      mockRecordRepository as any,
      mockStatsRepository as any,
      mockAuditLogRepository as any,
    );
  });

  describe("createBackup", () => {
    it("should create a backup with all data repositories", async () => {
      const metadata: BackupMetadata = {
        source: "manual",
        entities: ["Record", "Stats", "AuditLog"],
      };

      const backup = await backupService.createBackup(metadata, "user-123");

      expect(backup.status).toBe("completed");
      expect(backup.metadata.source).toBe("manual");
      expect(backup.metadata.triggeredBy).toBe("user-123");
      expect(backup.metadata.entities).toContain("Record");
      expect(backup.metadata.entities).toContain("Stats");
      expect(backup.metadata.entities).toContain("AuditLog");
      expect(backup.checksum).toMatch(/^sha256:/);
      expect(mockBackupRepository.save).toHaveBeenCalledTimes(2);
    });

    it("should create a backup with default system actor", async () => {
      const metadata: BackupMetadata = {
        source: "scheduled",
        entities: ["Record", "Stats", "AuditLog"],
      };

      const backup = await backupService.createBackup(metadata);

      expect(backup.metadata.triggeredBy).toBe("system");
      expect(backup.metadata.source).toBe("scheduled");
    });

    it("should create a backup with custom correlation ID", async () => {
      const metadata: BackupMetadata = {
        source: "pre-deployment",
        entities: ["Record", "Stats", "AuditLog"],
        correlationId: "deploy-abc-123",
      };

      const backup = await backupService.createBackup(metadata);

      expect(backup.metadata.correlationId).toBe("deploy-abc-123");
    });

    it("should calculate correct record count across all repositories", async () => {
      await mockRecordRepository.create({
        date: "2026-03-30",
        studentName: "John Doe",
        comment: "Great work today",
        mood: "happy",
      });

      await mockRecordRepository.create({
        date: "2026-03-30",
        studentName: "Jane Smith",
        comment: "Excellent participation",
        mood: "focused",
      });

      await mockStatsRepository.create({
        date: "2026-03-30",
        totalRecords: 2,
        moodDistribution: { happy: 1, focused: 1 },
      });

      const metadata: BackupMetadata = {
        source: "manual",
        entities: ["Record", "Stats", "AuditLog"],
      };

      const backup = await backupService.createBackup(metadata);

      expect(backup.recordCount).toBe(3);
    });

    it("should generate checksum for backup data", async () => {
      mockRecordRepository = createMockRecordRepository();
      mockStatsRepository = createMockStatsRepository();
      mockAuditLogRepository = createMockAuditLogRepository();

      backupService = new BackupService(
        mockBackupRepository as any,
        mockRecordRepository as any,
        mockStatsRepository as any,
        mockAuditLogRepository as any,
      );

      await mockRecordRepository.create({
        date: "2026-03-30",
        studentName: "John Doe",
        comment: "Great work today",
        mood: "happy",
      });

      const metadata: BackupMetadata = {
        source: "manual",
        entities: ["Record", "Stats", "AuditLog"],
      };

      const backup = await backupService.createBackup(metadata);

      expect(backup.checksum).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(backup.checksum.length).toBe(71);
    });

    it("should save backup to repository", async () => {
      const metadata: BackupMetadata = {
        source: "manual",
        entities: ["Record", "Stats", "AuditLog"],
      };

      const backup = await backupService.createBackup(metadata);

      const saved = await mockBackupRepository.findById(backup.id);
      expect(saved?.id).toBe(backup.id);
      expect(saved?.status).toBe("completed");
    });

    it("should handle empty repositories gracefully", async () => {
      const metadata: BackupMetadata = {
        source: "manual",
        entities: ["Record", "Stats", "AuditLog"],
      };

      const backup = await backupService.createBackup(metadata);

      expect(backup.recordCount).toBe(0);
      expect(backup.size).toBeGreaterThan(0);
    });

    it("should log backup creation in audit log", async () => {
      const metadata: BackupMetadata = {
        source: "manual",
        entities: ["Record", "Stats", "AuditLog"],
      };

      await backupService.createBackup(metadata, "user-123");

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: "Backup",
          operation: "create",
          actor: "user-123",
          metadata: expect.objectContaining({
            source: "manual",
          }),
        }),
      );
    });
  });

  describe("restoreBackup", () => {
    let existingBackup: Backup;

    beforeEach(async () => {
      const metadata: BackupMetadata = {
        source: "manual",
        entities: ["Record", "Stats", "AuditLog"],
      };

      existingBackup = await backupService.createBackup(metadata);
    });

    it("should restore data from a completed backup", async () => {
      const result = await backupService.restoreBackup(existingBackup.id);

      expect(result.backupId).toBe(existingBackup.id);
      expect(result.backupTimestamp).toBe(existingBackup.timestamp);
      expect(result.recordCount).toBeGreaterThanOrEqual(0);
      expect(result.size).toBeGreaterThanOrEqual(0);
    });

    it("should throw error if backup not found", async () => {
      await expect(
        backupService.restoreBackup("non-existent-backup-id"),
      ).rejects.toThrow("Backup with id 'non-existent-backup-id' not found");
    });

    it("should throw error if backup is not completed", async () => {
      const pendingBackup: Backup = {
        id: "pending-backup",
        timestamp: Date.now(),
        size: 0,
        recordCount: 0,
        checksum: "",
        status: "pending" as const,
        metadata: {
          source: "manual",
          triggeredBy: "system",
          formatVersion: "1.0",
          entities: ["Record"],
        },
      };

      await mockBackupRepository.save(pendingBackup);

      await expect(
        backupService.restoreBackup(pendingBackup.id),
      ).rejects.toThrow(
        "Cannot restore backup with status 'pending'. Only completed backups can be restored.",
      );
    });

    it("should log restore operation in audit log", async () => {
      await backupService.restoreBackup(existingBackup.id);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: "Backup",
          operation: "restore",
          entityId: existingBackup.id,
        }),
      );
    });
  });

  describe("listBackups", () => {
    beforeEach(async () => {
      mockBackupRepository = createMockBackupRepository();
      mockRecordRepository = createMockRecordRepository();
      mockStatsRepository = createMockStatsRepository();
      mockAuditLogRepository = createMockAuditLogRepository();

      backupService = new BackupService(
        mockBackupRepository as any,
        mockRecordRepository as any,
        mockStatsRepository as any,
        mockAuditLogRepository as any,
      );

      const metadata: BackupMetadata = {
        source: "manual",
        entities: ["Record", "Stats", "AuditLog"],
      };

      await backupService.createBackup({ ...metadata, source: "scheduled" });
      await backupService.createBackup({ ...metadata, source: "manual" });
      await backupService.createBackup({ ...metadata, source: "pre-deployment" });
    });

    it("should list all backups", async () => {
      const backups = await backupService.listBackups();

      expect(backups.length).toBe(3);
    });

    it("should filter backups by source", async () => {
      const manualBackups = await backupService.listBackups({
        source: "manual",
      });

      expect(manualBackups.length).toBeGreaterThanOrEqual(1);
      expect(manualBackups[0].metadata.source).toBe("manual");
    });

    it("should filter backups by status", async () => {
      const completedBackups = await backupService.listBackups({
        status: "completed",
      });

      expect(completedBackups.length).toBe(3);
      completedBackups.forEach((backup) => {
        expect(backup.status).toBe("completed");
      });
    });

    it("should filter backups by triggeredBy", async () => {
      await backupService.createBackup({
        source: "manual",
        entities: ["Record", "Stats", "AuditLog"],
      });

      const systemBackups = await backupService.listBackups({
        triggeredBy: "system",
      });

      expect(systemBackups.length).toBeGreaterThanOrEqual(3);
    });

    it("should paginate results", async () => {
      const paginatedBackups = await backupService.listBackups({
        limit: 2,
        offset: 0,
      });

      expect(paginatedBackups.length).toBe(2);
    });

    it("should call repository query with correct parameters", async () => {
      await backupService.listBackups({ status: "completed", limit: 10 });

      expect(mockBackupRepository.query).toHaveBeenCalledWith({
        status: "completed",
        limit: 10,
      });
    });
  });

  describe("deleteOldBackups", () => {
    beforeEach(async () => {
      mockBackupRepository = createMockBackupRepository();
      mockRecordRepository = createMockRecordRepository();
      mockStatsRepository = createMockStatsRepository();
      mockAuditLogRepository = createMockAuditLogRepository();

      backupService = new BackupService(
        mockBackupRepository as any,
        mockRecordRepository as any,
        mockStatsRepository as any,
        mockAuditLogRepository as any,
      );

      const metadata: BackupMetadata = {
        source: "scheduled",
        entities: ["Record", "Stats", "AuditLog"],
      };

      await backupService.createBackup(metadata);
      await new Promise((resolve) => setTimeout(resolve, 10));
      await backupService.createBackup(metadata);
    });

    it("should delete backups older than specified timestamp", async () => {
      const cutoffTime = Date.now();

      const deletedCount = await backupService.deleteOldBackups(cutoffTime);

      expect(deletedCount).toBeGreaterThanOrEqual(0);
      expect(mockBackupRepository.deleteOlderThan).toHaveBeenCalledWith(cutoffTime);
    });
  });

  describe("getBackupById", () => {
    beforeEach(async () => {
      mockBackupRepository = createMockBackupRepository();
      mockRecordRepository = createMockRecordRepository();
      mockStatsRepository = createMockStatsRepository();
      mockAuditLogRepository = createMockAuditLogRepository();

      backupService = new BackupService(
        mockBackupRepository as any,
        mockRecordRepository as any,
        mockStatsRepository as any,
        mockAuditLogRepository as any,
      );
    });

    it("should return backup if found", async () => {
      const metadata: BackupMetadata = {
        source: "manual",
        entities: ["Record", "Stats", "AuditLog"],
      };

      const createdBackup = await backupService.createBackup(metadata);
      const foundBackup = await backupService.getBackupById(createdBackup.id);

      expect(foundBackup?.id).toBe(createdBackup.id);
      expect(foundBackup?.status).toBe("completed");
    });

    it("should return null if not found", async () => {
      const foundBackup = await backupService.getBackupById(
        "non-existent-id",
      );

      expect(foundBackup).toBeNull();
    });

    it("should call repository findById", async () => {
      await backupService.getBackupById("some-id");

      expect(mockBackupRepository.findById).toHaveBeenCalledWith("some-id");
    });
  });

  describe("getLatestBackup", () => {
    it("should return the most recent completed backup", async () => {
      const metadata: BackupMetadata = {
        source: "scheduled",
        entities: ["Record", "Stats", "AuditLog"],
      };

      await backupService.createBackup(metadata);
      await new Promise((resolve) => setTimeout(resolve, 10));
      const latestBackup = await backupService.createBackup(metadata);

      const retrieved = await backupService.getLatestBackup();

      expect(retrieved?.id).toBe(latestBackup.id);
    });

    it("should return null if no backups exist", async () => {
      const latest = await backupService.getLatestBackup();

      expect(latest).toBeNull();
    });

    it("should call repository findLatestCompleted", async () => {
      await backupService.getLatestBackup();

      expect(mockBackupRepository.findLatestCompleted).toHaveBeenCalled();
    });
  });

  describe("getBackupStats", () => {
    beforeEach(async () => {
      mockBackupRepository = createMockBackupRepository();
      mockRecordRepository = createMockRecordRepository();
      mockStatsRepository = createMockStatsRepository();
      mockAuditLogRepository = createMockAuditLogRepository();

      backupService = new BackupService(
        mockBackupRepository as any,
        mockRecordRepository as any,
        mockStatsRepository as any,
        mockAuditLogRepository as any,
      );

      const metadata: BackupMetadata = {
        source: "scheduled",
        entities: ["Record", "Stats", "AuditLog"],
      };

      await backupService.createBackup(metadata);
      await backupService.createBackup({ ...metadata, source: "manual" });
    });

    it("should return backup statistics", async () => {
      const stats = await backupService.getBackupStats();

      expect(stats.totalCount).toBeGreaterThanOrEqual(2);
      expect(stats.totalSize).toBeGreaterThanOrEqual(0);
      expect(stats.completedCount).toBeGreaterThanOrEqual(2);
      expect(stats.failedCount).toBe(0);
      expect(stats.pendingCount).toBe(0);
    });

    it("should calculate correct total size", async () => {
      const stats = await backupService.getBackupStats();

      expect(mockBackupRepository.getTotalSize).toHaveBeenCalled();
      expect(stats.totalSize).toBeGreaterThanOrEqual(0);
    });

    it("should count completed backups", async () => {
      const stats = await backupService.getBackupStats();

      expect(stats.completedCount).toBe(2);
    });
  });
});
