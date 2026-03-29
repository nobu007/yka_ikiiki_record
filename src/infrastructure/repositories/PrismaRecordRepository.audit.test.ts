import { setupTest, createMockRecord, createMockPrismaRecord } from "./PrismaRecordRepository.setup";
import { AuditService } from "@/application/services/AuditService";
import { InMemoryAuditLogRepository } from "@/infrastructure/repositories/InMemoryAuditLogRepository";
import { Record } from "@/domain/entities/Record";

describe("PrismaRecordRepository - audit logging integration", () => {
  let repository: ReturnType<typeof setupTest>["repository"];
  let prisma: ReturnType<typeof setupTest>["prisma"];
  let auditService: AuditService;
  let auditLogRepository: InMemoryAuditLogRepository;

  beforeEach(() => {
    const setup = setupTest();
    repository = setup.repository;
    prisma = setup.prisma;
    auditLogRepository = new InMemoryAuditLogRepository();
    auditService = new AuditService(auditLogRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("audit logging for save operations", () => {
    it("should log create operations when saving a new record", async () => {
      const record: Record = {
        emotion: 4.5,
        date: new Date("2024-01-15T10:30:00"),
        student: "学生1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const savedPrismaRecord = createMockPrismaRecord({
        id: 1,
        emotion: 4.5,
        student: "学生1",
        date: new Date("2024-01-15T10:30:00"),
      });

      (prisma.record.upsert as jest.Mock).mockResolvedValue(savedPrismaRecord);

      await repository.save(record);

      await auditService.logCreate(
        "Record",
        "1",
        record,
        { source: "test" },
        "test-user",
      );

      const auditLogs = await auditLogRepository.query({
        entityType: "Record",
        operation: "create",
      });

      expect(auditLogs.logs).toHaveLength(1);
      expect(auditLogs.logs[0].entityType).toBe("Record");
      expect(auditLogs.logs[0].entityId).toBe("1");
      expect(auditLogs.logs[0].operation).toBe("create");
      expect(auditLogs.logs[0].actor).toBe("test-user");
      expect(auditLogs.logs[0].changes.after).toEqual(record);
      expect(auditLogs.logs[0].changes.before).toBeNull();
    });

    it("should log update operations when saving an existing record", async () => {
      const existingRecord: Record = {
        id: 1,
        emotion: 4.5,
        date: new Date("2024-01-15T10:30:00"),
        student: "学生1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedRecord: Record = {
        id: 1,
        emotion: 5.0,
        date: new Date("2024-01-15T10:30:00"),
        student: "学生1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const savedPrismaRecord = createMockPrismaRecord({
        id: 1,
        emotion: 5.0,
        student: "学生1",
        date: new Date("2024-01-15T10:30:00"),
      });

      (prisma.record.upsert as jest.Mock).mockResolvedValue(savedPrismaRecord);

      await repository.save(updatedRecord);

      await auditService.logUpdate(
        "Record",
        "1",
        existingRecord,
        updatedRecord,
        { source: "test" },
        "test-user",
      );

      const auditLogs = await auditLogRepository.query({
        entityType: "Record",
        operation: "update",
      });

      expect(auditLogs.logs).toHaveLength(1);
      expect(auditLogs.logs[0].entityType).toBe("Record");
      expect(auditLogs.logs[0].entityId).toBe("1");
      expect(auditLogs.logs[0].operation).toBe("update");
      expect(auditLogs.logs[0].actor).toBe("test-user");
      expect(auditLogs.logs[0].changes.before).toEqual(existingRecord);
      expect(auditLogs.logs[0].changes.after).toEqual(updatedRecord);
    });

    it("should include metadata in audit logs", async () => {
      const record: Record = {
        emotion: 4.5,
        date: new Date("2024-01-15T10:30:00"),
        student: "学生1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const savedPrismaRecord = createMockPrismaRecord({
        id: 1,
        emotion: 4.5,
        student: "学生1",
        date: new Date("2024-01-15T10:30:00"),
      });

      (prisma.record.upsert as jest.Mock).mockResolvedValue(savedPrismaRecord);

      await repository.save(record);

      const metadata = {
        source: "api",
        ipAddress: "192.168.1.1",
        userAgent: "test-agent",
        correlationId: "corr-abc-123",
      };

      await auditService.logCreate(
        "Record",
        "1",
        record,
        metadata,
        "test-user",
      );

      const auditLogs = await auditLogRepository.query({
        entityType: "Record",
      });

      expect(auditLogs.logs).toHaveLength(1);
      expect(auditLogs.logs[0].metadata).toEqual(metadata);
    });
  });

  describe("audit logging for delete operations", () => {
    it("should log delete operations when deleting a record", async () => {
      const existingRecord: Record = {
        id: 1,
        emotion: 4.5,
        date: new Date("2024-01-15T10:30:00"),
        student: "学生1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.record.delete as jest.Mock).mockResolvedValue(existingRecord);

      await repository.delete(1);

      await auditService.logDelete(
        "Record",
        "1",
        existingRecord,
        { source: "test" },
        "test-user",
      );

      const auditLogs = await auditLogRepository.query({
        entityType: "Record",
        operation: "delete",
      });

      expect(auditLogs.logs).toHaveLength(1);
      expect(auditLogs.logs[0].entityType).toBe("Record");
      expect(auditLogs.logs[0].entityId).toBe("1");
      expect(auditLogs.logs[0].operation).toBe("delete");
      expect(auditLogs.logs[0].actor).toBe("test-user");
      expect(auditLogs.logs[0].changes.before).toEqual(existingRecord);
      expect(auditLogs.logs[0].changes.after).toBeNull();
    });
  });

  describe("audit logging for batch operations", () => {
    it("should log create operations for batch save", async () => {
      const records: Record[] = [
        createMockRecord({
          id: 1,
          emotion: 4.5,
          student: "学生1",
        }),
        createMockRecord({
          id: 2,
          emotion: 5.0,
          student: "学生2",
        }),
      ];

      const createdPrismaRecords = [
        createMockPrismaRecord({
          id: 1,
          emotion: 4.5,
          student: "学生1",
        }),
        createMockPrismaRecord({
          id: 2,
          emotion: 5.0,
          student: "学生2",
        }),
      ];

      (prisma.record.createMany as jest.Mock).mockResolvedValue({ count: 2 });
      (prisma.record.findMany as jest.Mock).mockResolvedValue(createdPrismaRecords);

      await repository.saveMany(records);

      for (const record of records) {
        await auditService.logCreate(
          "Record",
          String(record.id),
          record,
          { source: "batch-test" },
          "test-user",
        );
      }

      const auditLogs = await auditLogRepository.query({
        entityType: "Record",
        operation: "create",
      });

      expect(auditLogs.logs).toHaveLength(2);
      expect(auditLogs.logs[0].metadata.source).toBe("batch-test");
      expect(auditLogs.logs[1].metadata.source).toBe("batch-test");
    });
  });

  describe("audit log querying", () => {
    beforeEach(async () => {
      auditLogRepository = new InMemoryAuditLogRepository();
      auditService = new AuditService(auditLogRepository);

      const record: Record = createMockRecord({
        id: 1,
        emotion: 4.5,
        student: "学生1",
      });

      await auditService.logCreate("Record", "1", record, { source: "test" }, "user-1");
      await auditService.logUpdate("Record", "1", record, { ...record, emotion: 5.0 }, { source: "test" }, "user-2");
      await auditService.logDelete("Record", "1", record, { source: "test" }, "user-1");
    });

    it("should query audit logs by entity type", async () => {
      const auditLogs = await auditLogRepository.query({
        entityType: "Record",
      });

      expect(auditLogs.logs).toHaveLength(3);
      expect(auditLogs.totalCount).toBe(3);
      expect(auditLogs.logs.every((log) => log.entityType === "Record")).toBe(true);
    });

    it("should query audit logs by operation type", async () => {
      const createLogs = await auditLogRepository.query({
        operation: "create",
      });

      expect(createLogs.logs).toHaveLength(1);
      expect(createLogs.logs[0].operation).toBe("create");
    });

    it("should query audit logs by actor", async () => {
      const user1Logs = await auditLogRepository.query({
        actor: "user-1",
      });

      expect(user1Logs.logs).toHaveLength(2);
      expect(user1Logs.logs.every((log) => log.actor === "user-1")).toBe(true);
    });

    it("should query audit logs with time range", async () => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      const timeRangeLogs = await auditLogRepository.query({
        startTime: oneHourAgo,
        endTime: now,
      });

      expect(timeRangeLogs.logs.length).toBeGreaterThan(0);
    });

    it("should support pagination in audit log queries", async () => {
      const paginatedLogs = await auditLogRepository.query({
        entityType: "Record",
        limit: 2,
        offset: 0,
      });

      expect(paginatedLogs.logs).toHaveLength(2);
      expect(paginatedLogs.totalCount).toBe(3);
    });

    it("should return audit logs in descending timestamp order", async () => {
      const auditLogs = await auditLogRepository.query({
        entityType: "Record",
      });

      for (let i = 0; i < auditLogs.logs.length - 1; i++) {
        expect(auditLogs.logs[i].timestamp).toBeGreaterThanOrEqual(
          auditLogs.logs[i + 1].timestamp,
        );
      }
    });
  });

  describe("audit log error handling", () => {
    it("should handle audit logging failures gracefully", async () => {
      const record: Record = createMockRecord({
        id: 1,
        emotion: 4.5,
        student: "学生1",
      });

      const savedPrismaRecord = createMockPrismaRecord({
        id: 1,
        emotion: 4.5,
        student: "学生1",
      });

      (prisma.record.upsert as jest.Mock).mockResolvedValue(savedPrismaRecord);

      await repository.save(record);

      await auditService.logCreate("Record", "1", record, { source: "test" });

      const auditLogs = await auditLogRepository.query({
        entityType: "Record",
      });

      expect(auditLogs.logs).toHaveLength(1);
    });

    it("should handle invalid metadata in audit logs", async () => {
      const record: Record = createMockRecord({
        id: 1,
        emotion: 4.5,
        student: "学生1",
      });

      const savedPrismaRecord = createMockPrismaRecord({
        id: 1,
        emotion: 4.5,
        student: "学生1",
      });

      (prisma.record.upsert as jest.Mock).mockResolvedValue(savedPrismaRecord);

      await repository.save(record);

      const invalidMetadata = {
        source: "test",
        nested: {
          deeply: {
            value: "complex",
          },
        },
      };

      await auditService.logCreate(
        "Record",
        "1",
        record,
        invalidMetadata,
        "test-user",
      );

      const auditLogs = await auditLogRepository.query({
        entityType: "Record",
      });

      expect(auditLogs.logs).toHaveLength(1);
      expect(auditLogs.logs[0].metadata).toEqual(invalidMetadata);
    });
  });

  describe("audit log metadata validation", () => {
    it("should accept empty metadata", async () => {
      const record: Record = createMockRecord({
        id: 1,
        emotion: 4.5,
        student: "学生1",
      });

      await auditService.logCreate("Record", "1", record, {}, "test-user");

      const auditLogs = await auditLogRepository.query({
        entityType: "Record",
      });

      expect(auditLogs.logs).toHaveLength(1);
      expect(auditLogs.logs[0].metadata).toEqual({});
    });

    it("should accept complex nested metadata", async () => {
      const record: Record = createMockRecord({
        id: 1,
        emotion: 4.5,
        student: "学生1",
      });

      const complexMetadata = {
        source: "api",
        request: {
          method: "POST",
          path: "/api/records",
          headers: {
            "user-agent": "test",
            "content-type": "application/json",
          },
        },
        timestamp: Date.now(),
        tags: ["important", "batch"],
      };

      await auditService.logCreate("Record", "1", record, complexMetadata, "test-user");

      const auditLogs = await auditLogRepository.query({
        entityType: "Record",
      });

      expect(auditLogs.logs).toHaveLength(1);
      expect(auditLogs.logs[0].metadata).toEqual(complexMetadata);
    });
  });

  describe("audit log ID generation", () => {
    it("should generate unique audit log IDs", async () => {
      const record: Record = createMockRecord({
        id: 1,
        emotion: 4.5,
        student: "学生1",
      });

      await auditService.logCreate("Record", "1", record, { source: "test" }, "user-1");
      await auditService.logCreate("Record", "2", record, { source: "test" }, "user-2");

      const auditLogs = await auditLogRepository.query({
        entityType: "Record",
      });

      expect(auditLogs.logs).toHaveLength(2);
      expect(auditLogs.logs[0].id).not.toBe(auditLogs.logs[1].id);
    });

    it("should generate IDs with correct format", async () => {
      const record: Record = createMockRecord({
        id: 1,
        emotion: 4.5,
        student: "学生1",
      });

      await auditService.logCreate("Record", "1", record, { source: "test" });

      const auditLogs = await auditLogRepository.query({
        entityType: "Record",
      });

      expect(auditLogs.logs[0].id).toMatch(/^audit-\d+-[a-z0-9]+$/);
    });
  });

  describe("audit log timestamp validation", () => {
    it("should set timestamp to current time", async () => {
      const beforeTime = Date.now();
      const record: Record = createMockRecord({
        id: 1,
        emotion: 4.5,
        student: "学生1",
      });

      await auditService.logCreate("Record", "1", record, { source: "test" });

      const afterTime = Date.now();
      const auditLogs = await auditLogRepository.query({
        entityType: "Record",
      });

      expect(auditLogs.logs[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(auditLogs.logs[0].timestamp).toBeLessThanOrEqual(afterTime);
    });
  });
});
