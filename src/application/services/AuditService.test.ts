import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import type { AuditLogRepository } from "@/domain/repositories/AuditLogRepository";
import { AuditService } from "./AuditService";
import type { AuditLog } from "@/domain/entities/AuditLog";
import { AuditOperation } from "@/domain/entities/AuditLog";

describe("AuditService", () => {
  let mockRepository: AuditLogRepository;
  let auditService: AuditService;
  let savedLogs: AuditLog[];

  beforeEach(() => {
    savedLogs = [];
    mockRepository = {
      save: jest.fn(async (log: AuditLog) => {
        savedLogs.push(log);
      }),
      findById: jest.fn(),
      query: jest.fn(),
      deleteOlderThan: jest.fn(),
      count: jest.fn(),
    };
    auditService = new AuditService(mockRepository);
  });

  describe("logCreate", () => {
    it("should create an audit log for create operation", async () => {
      const entityType = "Record";
      const entityId = "record-123";
      const after = { id: 1, student: "John Doe", date: "2026-03-30" };
      const metadata = { source: "api" };

      await auditService.logCreate(entityType, entityId, after, metadata);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      const savedLog = savedLogs[0];
      expect(savedLog.entityType).toBe(entityType);
      expect(savedLog.entityId).toBe(entityId);
      expect(savedLog.operation).toBe("create");
      expect(savedLog.changes.before).toBeNull();
      expect(savedLog.changes.after).toEqual(after);
      expect(savedLog.metadata).toEqual(metadata);
      expect(savedLog.actor).toBe("system");
    });

    it("should use custom actor when provided", async () => {
      const actor = "user-456";

      await auditService.logCreate(
        "Record",
        "record-123",
        { id: 1 },
        { source: "api" },
        actor,
      );

      const savedLog = savedLogs[0];
      expect(savedLog.actor).toBe(actor);
    });

    it("should include correlation ID in metadata when provided", async () => {
      const correlationId = "corr-abc-123";

      await auditService.logCreate(
        "Record",
        "record-123",
        { id: 1 },
        { source: "api", correlationId },
      );

      const savedLog = savedLogs[0];
      expect(savedLog.metadata.correlationId).toBe(correlationId);
    });

    it("should generate unique ID for each audit log", async () => {
      await auditService.logCreate("Record", "record-1", { id: 1 }, {
        source: "api",
      });
      await auditService.logCreate("Record", "record-2", { id: 2 }, {
        source: "api",
      });

      expect(savedLogs[0].id).not.toBe(savedLogs[1].id);
    });

    it("should set timestamp to current time", async () => {
      const beforeTime = Date.now();
      await auditService.logCreate("Record", "record-123", { id: 1 }, {
        source: "api",
      });
      const afterTime = Date.now();

      const savedLog = savedLogs[0];
      expect(savedLog.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(savedLog.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe("logUpdate", () => {
    it("should create an audit log for update operation", async () => {
      const entityType = "Record";
      const entityId = "record-123";
      const before = { id: 1, student: "John Doe", comment: "Old comment" };
      const after = { id: 1, student: "John Doe", comment: "New comment" };
      const metadata = { source: "api" };

      await auditService.logUpdate(entityType, entityId, before, after, metadata);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      const savedLog = savedLogs[0];
      expect(savedLog.entityType).toBe(entityType);
      expect(savedLog.entityId).toBe(entityId);
      expect(savedLog.operation).toBe("update");
      expect(savedLog.changes.before).toEqual(before);
      expect(savedLog.changes.after).toEqual(after);
      expect(savedLog.metadata).toEqual(metadata);
    });

    it("should use custom actor when provided", async () => {
      const actor = "user-789";

      await auditService.logUpdate(
        "Record",
        "record-123",
        { id: 1 },
        { id: 1, comment: "Updated" },
        { source: "api" },
        actor,
      );

      const savedLog = savedLogs[0];
      expect(savedLog.actor).toBe(actor);
    });

    it("should include IP address and user agent when provided", async () => {
      const ipAddress = "192.168.1.1";
      const userAgent = "Mozilla/5.0";

      await auditService.logUpdate(
        "Record",
        "record-123",
        { id: 1 },
        { id: 1, comment: "Updated" },
        { source: "api", ipAddress, userAgent },
      );

      const savedLog = savedLogs[0];
      expect(savedLog.metadata.ipAddress).toBe(ipAddress);
      expect(savedLog.metadata.userAgent).toBe(userAgent);
    });
  });

  describe("logDelete", () => {
    it("should create an audit log for delete operation", async () => {
      const entityType = "Record";
      const entityId = "record-123";
      const before = { id: 1, student: "John Doe", date: "2026-03-30" };
      const metadata = { source: "api" };

      await auditService.logDelete(entityType, entityId, before, metadata);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      const savedLog = savedLogs[0];
      expect(savedLog.entityType).toBe(entityType);
      expect(savedLog.entityId).toBe(entityId);
      expect(savedLog.operation).toBe("delete");
      expect(savedLog.changes.before).toEqual(before);
      expect(savedLog.changes.after).toBeNull();
      expect(savedLog.metadata).toEqual(metadata);
    });

    it("should use custom actor when provided", async () => {
      const actor = "admin-user";

      await auditService.logDelete(
        "Record",
        "record-123",
        { id: 1 },
        { source: "admin" },
        actor,
      );

      const savedLog = savedLogs[0];
      expect(savedLog.actor).toBe(actor);
    });
  });

  describe("logOperation", () => {
    it("should handle create operation", async () => {
      await auditService.logOperation(
        "create" as AuditOperation,
        "Record",
        "record-123",
        null,
        { id: 1, student: "John" },
        { source: "test" },
      );

      const savedLog = savedLogs[0];
      expect(savedLog.operation).toBe("create");
      expect(savedLog.changes.before).toBeNull();
      expect(savedLog.changes.after).toEqual({ id: 1, student: "John" });
    });

    it("should handle update operation", async () => {
      await auditService.logOperation(
        "update" as AuditOperation,
        "Record",
        "record-123",
        { id: 1, comment: "Old" },
        { id: 1, comment: "New" },
        { source: "test" },
      );

      const savedLog = savedLogs[0];
      expect(savedLog.operation).toBe("update");
      expect(savedLog.changes.before).toEqual({ id: 1, comment: "Old" });
      expect(savedLog.changes.after).toEqual({ id: 1, comment: "New" });
    });

    it("should handle delete operation", async () => {
      await auditService.logOperation(
        "delete" as AuditOperation,
        "Record",
        "record-123",
        { id: 1, student: "John" },
        null,
        { source: "test" },
      );

      const savedLog = savedLogs[0];
      expect(savedLog.operation).toBe("delete");
      expect(savedLog.changes.before).toEqual({ id: 1, student: "John" });
      expect(savedLog.changes.after).toBeNull();
    });

    it("should use custom actor when provided", async () => {
      const actor = "custom-actor";

      await auditService.logOperation(
        "create" as AuditOperation,
        "Record",
        "record-123",
        null,
        { id: 1 },
        { source: "test" },
        actor,
      );

      const savedLog = savedLogs[0];
      expect(savedLog.actor).toBe(actor);
    });
  });

  describe("error handling", () => {
    it("should propagate repository save errors", async () => {
      const error = new Error("Database connection failed");
      mockRepository.save = jest.fn(async () => {
        throw error;
      });

      await expect(
        auditService.logCreate("Record", "record-123", { id: 1 }, { source: "api" }),
      ).rejects.toThrow("Database connection failed");
    });

    it("should not save log if repository throws error", async () => {
      mockRepository.save = jest.fn(async () => {
        throw new Error("Save failed");
      });

      await expect(
        auditService.logCreate("Record", "record-123", { id: 1 }, { source: "api" }),
      ).rejects.toThrow();

      expect(savedLogs.length).toBe(0);
    });
  });

  describe("metadata handling", () => {
    it("should preserve custom metadata fields", async () => {
      const customMetadata = {
        source: "api",
        customField1: "value1",
        customField2: 42,
        customField3: true,
      };

      await auditService.logCreate(
        "Record",
        "record-123",
        { id: 1 },
        customMetadata,
      );

      const savedLog = savedLogs[0];
      expect(savedLog.metadata).toEqual(customMetadata);
    });

    it("should handle empty metadata", async () => {
      await auditService.logCreate("Record", "record-123", { id: 1 }, {
        source: "test",
      });

      const savedLog = savedLogs[0];
      expect(savedLog.metadata.source).toBe("test");
    });
  });

  describe("ID generation", () => {
    it("should generate IDs with audit prefix", async () => {
      await auditService.logCreate("Record", "record-123", { id: 1 }, {
        source: "api",
      });

      const savedLog = savedLogs[0];
      expect(savedLog.id).toMatch(/^audit-\d+-[a-z0-9]+$/);
    });

    it("should generate unique IDs even for same entity", async () => {
      for (let i = 0; i < 10; i++) {
        await auditService.logCreate("Record", "record-123", { id: 1 }, {
          source: "api",
        });
      }

      const uniqueIds = new Set(savedLogs.map((log) => log.id));
      expect(uniqueIds.size).toBe(10);
    });
  });
});
