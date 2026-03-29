import {
  type AuditLog,
  createAuditLogForCreate,
  createAuditLogForUpdate,
  createAuditLogForDelete,
} from "./AuditLog";

describe("AuditLog Domain Entity", () => {
  describe("createAuditLogForCreate", () => {
    it("should create an audit log for create operation", () => {
      const entityType = "Record";
      const entityId = "record-123";
      const after = { id: "record-123", studentName: "Test Student" };
      const metadata = { source: "api", ipAddress: "127.0.0.1" };
      const actor = "user-456";

      const auditLog = createAuditLogForCreate(
        entityType,
        entityId,
        after,
        metadata,
        actor,
      );

      expect(auditLog.operation).toBe("create");
      expect(auditLog.entityType).toBe(entityType);
      expect(auditLog.entityId).toBe(entityId);
      expect(auditLog.actor).toBe(actor);
      expect(auditLog.changes.before).toBeNull();
      expect(auditLog.changes.after).toEqual(after);
      expect(auditLog.metadata).toEqual(metadata);
      expect(auditLog.id).toMatch(/^audit-\d+-[a-z0-9]+$/);
      expect(auditLog.timestamp).toBeLessThanOrEqual(Date.now());
      expect(auditLog.timestamp).toBeGreaterThan(Date.now() - 1000);
    });

    it("should default actor to 'system' when not provided", () => {
      const auditLog = createAuditLogForCreate(
        "Record",
        "record-123",
        { id: "record-123" },
        { source: "api" },
      );

      expect(auditLog.actor).toBe("system");
    });

    it("should generate unique IDs for each audit log", () => {
      const log1 = createAuditLogForCreate(
        "Record",
        "record-123",
        { id: "record-123" },
        { source: "api" },
      );
      const log2 = createAuditLogForCreate(
        "Record",
        "record-123",
        { id: "record-123" },
        { source: "api" },
      );

      expect(log1.id).not.toBe(log2.id);
    });
  });

  describe("createAuditLogForUpdate", () => {
    it("should create an audit log for update operation", () => {
      const entityType = "Record";
      const entityId = "record-123";
      const before = { id: "record-123", studentName: "Old Name" };
      const after = { id: "record-123", studentName: "New Name" };
      const metadata = { source: "api", correlationId: "req-456" };
      const actor = "user-789";

      const auditLog = createAuditLogForUpdate(
        entityType,
        entityId,
        before,
        after,
        metadata,
        actor,
      );

      expect(auditLog.operation).toBe("update");
      expect(auditLog.entityType).toBe(entityType);
      expect(auditLog.entityId).toBe(entityId);
      expect(auditLog.actor).toBe(actor);
      expect(auditLog.changes.before).toEqual(before);
      expect(auditLog.changes.after).toEqual(after);
      expect(auditLog.metadata).toEqual(metadata);
      expect(auditLog.id).toMatch(/^audit-\d+-[a-z0-9]+$/);
      expect(auditLog.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it("should default actor to 'system' when not provided", () => {
      const auditLog = createAuditLogForUpdate(
        "Record",
        "record-123",
        { id: "record-123", name: "Old" },
        { id: "record-123", name: "New" },
        { source: "api" },
      );

      expect(auditLog.actor).toBe("system");
    });
  });

  describe("createAuditLogForDelete", () => {
    it("should create an audit log for delete operation", () => {
      const entityType = "Record";
      const entityId = "record-123";
      const before = { id: "record-123", studentName: "Deleted Student" };
      const metadata = { source: "migration", userAgent: "Mozilla/5.0" };
      const actor = "admin-001";

      const auditLog = createAuditLogForDelete(
        entityType,
        entityId,
        before,
        metadata,
        actor,
      );

      expect(auditLog.operation).toBe("delete");
      expect(auditLog.entityType).toBe(entityType);
      expect(auditLog.entityId).toBe(entityId);
      expect(auditLog.actor).toBe(actor);
      expect(auditLog.changes.before).toEqual(before);
      expect(auditLog.changes.after).toBeNull();
      expect(auditLog.metadata).toEqual(metadata);
      expect(auditLog.id).toMatch(/^audit-\d+-[a-z0-9]+$/);
      expect(auditLog.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it("should default actor to 'system' when not provided", () => {
      const auditLog = createAuditLogForDelete(
        "Record",
        "record-123",
        { id: "record-123" },
        { source: "api" },
      );

      expect(auditLog.actor).toBe("system");
    });
  });

  describe("AuditLog type structure", () => {
    it("should accept all valid metadata fields", () => {
      const auditLog: AuditLog = {
        id: "audit-123",
        timestamp: Date.now(),
        entityType: "Record",
        entityId: "record-456",
        operation: "create",
        actor: "user-789",
        changes: {
          before: null,
          after: { id: "record-456", data: "test" },
        },
        metadata: {
          source: "api",
          ipAddress: "192.168.1.1",
          userAgent: "TestAgent/1.0",
          correlationId: "correlation-123",
          customField: "custom value",
          customNumber: 42,
        },
      };

      expect(auditLog.metadata.source).toBe("api");
      expect(auditLog.metadata.ipAddress).toBe("192.168.1.1");
      expect(auditLog.metadata.userAgent).toBe("TestAgent/1.0");
      expect(auditLog.metadata.correlationId).toBe("correlation-123");
      expect(auditLog.metadata.customField).toBe("custom value");
      expect(auditLog.metadata.customNumber).toBe(42);
    });

    it("should accept minimal metadata with only required source field", () => {
      const auditLog: AuditLog = {
        id: "audit-123",
        timestamp: Date.now(),
        entityType: "Record",
        entityId: "record-456",
        operation: "create",
        actor: "system",
        changes: {
          before: null,
          after: { id: "record-456" },
        },
        metadata: {
          source: "seed",
        },
      };

      expect(auditLog.metadata.source).toBe("seed");
      expect(auditLog.metadata.ipAddress).toBeUndefined();
      expect(auditLog.metadata.userAgent).toBeUndefined();
      expect(auditLog.metadata.correlationId).toBeUndefined();
    });
  });

  describe("Audit operation types", () => {
    it("should support create operation type", () => {
      const auditLog = createAuditLogForCreate(
        "Record",
        "record-123",
        { id: "record-123" },
        { source: "api" },
      );

      expect(auditLog.operation).toBe("create");
    });

    it("should support update operation type", () => {
      const auditLog = createAuditLogForUpdate(
        "Record",
        "record-123",
        { id: "record-123", name: "Old" },
        { id: "record-123", name: "New" },
        { source: "api" },
      );

      expect(auditLog.operation).toBe("update");
    });

    it("should support delete operation type", () => {
      const auditLog = createAuditLogForDelete(
        "Record",
        "record-123",
        { id: "record-123" },
        { source: "api" },
      );

      expect(auditLog.operation).toBe("delete");
    });
  });

  describe("Timestamp generation", () => {
    it("should generate timestamps within reasonable time range", () => {
      const before = Date.now();
      const auditLog = createAuditLogForCreate(
        "Record",
        "record-123",
        { id: "record-123" },
        { source: "api" },
      );
      const after = Date.now();

      expect(auditLog.timestamp).toBeGreaterThanOrEqual(before);
      expect(auditLog.timestamp).toBeLessThanOrEqual(after);
    });

    it("should handle rapid successive calls", async () => {
      const logs: AuditLog[] = [];

      // Create logs with a small delay to ensure timestamp progression
      for (let i = 0; i < 10; i++) {
        logs.push(
          createAuditLogForCreate(
            "Record",
            `record-${i}`,
            { id: `record-${i}` },
            { source: "api" },
          ),
        );
        // Small delay to ensure different timestamps (1ms)
        await new Promise((resolve) => setTimeout(resolve, 1));
      }

      const timestamps = logs.map((log) => log.timestamp);
      const uniqueTimestamps = new Set(timestamps);

      expect(timestamps).toHaveLength(10);
      expect(uniqueTimestamps.size).toBeGreaterThan(1);
    });
  });
});
