import { describe, it, expect, beforeEach } from "@jest/globals";
import { InMemoryAuditLogRepository } from "./InMemoryAuditLogRepository";
import {
  createAuditLogForCreate,
  createAuditLogForUpdate,
  createAuditLogForDelete,
  type AuditLog,
} from "../../domain/entities/AuditLog";

describe("InMemoryAuditLogRepository", () => {
  let repository: InMemoryAuditLogRepository;

  beforeEach(() => {
    repository = new InMemoryAuditLogRepository();
  });

  const createMockAuditLog = (overrides?: Partial<AuditLog>): AuditLog => ({
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    entityType: "Record",
    entityId: "record-123",
    operation: "create",
    actor: "system",
    changes: {
      before: null,
      after: { name: "Test Record" },
    },
    metadata: {
      source: "test",
    },
    ...overrides,
  });

  describe("save", () => {
    it("should save an audit log", async () => {
      const log = createMockAuditLog();
      await repository.save(log);

      expect(repository.size()).toBe(1);
    });

    it("should save multiple audit logs", async () => {
      const log1 = createMockAuditLog({ id: "audit-1" });
      const log2 = createMockAuditLog({ id: "audit-2" });

      await repository.save(log1);
      await repository.save(log2);

      expect(repository.size()).toBe(2);
    });
  });

  describe("findById", () => {
    it("should return null when log does not exist", async () => {
      const result = await repository.findById("non-existent");
      expect(result).toBeNull();
    });

    it("should return the audit log when it exists", async () => {
      const log = createMockAuditLog({ id: "audit-123" });
      await repository.save(log);

      const result = await repository.findById("audit-123");
      expect(result).toEqual(log);
    });

    it("should return null for empty repository", async () => {
      const result = await repository.findById("any-id");
      expect(result).toBeNull();
    });

    it("should find the correct log among multiple logs", async () => {
      const log1 = createMockAuditLog({ id: "audit-1", entityId: "entity-1" });
      const log2 = createMockAuditLog({ id: "audit-2", entityId: "entity-2" });
      const log3 = createMockAuditLog({ id: "audit-3", entityId: "entity-3" });

      await repository.save(log1);
      await repository.save(log2);
      await repository.save(log3);

      const result = await repository.findById("audit-2");
      expect(result).toEqual(log2);
      expect(result?.entityId).toBe("entity-2");
    });
  });

  describe("query", () => {
    beforeEach(async () => {
      const baseTime = Date.now();
      const logs: AuditLog[] = [
        createMockAuditLog({
          id: "audit-1",
          entityType: "Record",
          entityId: "record-1",
          operation: "create",
          actor: "user-1",
          timestamp: baseTime,
          metadata: { source: "api" },
        }),
        createMockAuditLog({
          id: "audit-2",
          entityType: "Record",
          entityId: "record-2",
          operation: "update",
          actor: "user-1",
          timestamp: baseTime + 1000,
          metadata: { source: "api" },
        }),
        createMockAuditLog({
          id: "audit-3",
          entityType: "Stats",
          entityId: "stats-1",
          operation: "create",
          actor: "system",
          timestamp: baseTime + 2000,
          metadata: { source: "seed" },
        }),
        createMockAuditLog({
          id: "audit-4",
          entityType: "Record",
          entityId: "record-1",
          operation: "delete",
          actor: "user-2",
          timestamp: baseTime + 3000,
          metadata: { source: "api" },
        }),
        createMockAuditLog({
          id: "audit-5",
          entityType: "Record",
          entityId: "record-3",
          operation: "create",
          actor: "system",
          timestamp: baseTime + 4000,
          metadata: { source: "migration" },
        }),
      ];

      for (const log of logs) {
        await repository.save(log);
      }
    });

    it("should return all logs when no filters provided", async () => {
      const result = await repository.query({});
      expect(result.logs).toHaveLength(5);
      expect(result.totalCount).toBe(5);
    });

    it("should filter by entityType", async () => {
      const result = await repository.query({ entityType: "Record" });
      expect(result.logs).toHaveLength(4);
      expect(result.totalCount).toBe(4);
      expect(result.logs.every((log) => log.entityType === "Record")).toBe(true);
    });

    it("should filter by entityId", async () => {
      const result = await repository.query({ entityId: "record-1" });
      expect(result.logs).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.logs.every((log) => log.entityId === "record-1")).toBe(
        true,
      );
    });

    it("should filter by operation", async () => {
      const result = await repository.query({ operation: "create" });
      expect(result.logs).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.logs.every((log) => log.operation === "create")).toBe(true);
    });

    it("should filter by actor", async () => {
      const result = await repository.query({ actor: "user-1" });
      expect(result.logs).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.logs.every((log) => log.actor === "user-1")).toBe(true);
    });

    it("should filter by time range (startTime)", async () => {
      const baseTime = Date.now();
      const result = await repository.query({
        startTime: baseTime + 1500,
      });
      expect(result.logs).toHaveLength(3);
      expect(result.totalCount).toBe(3);
    });

    it("should filter by time range (endTime)", async () => {
      const baseTime = Date.now();
      const result = await repository.query({
        endTime: baseTime + 1500,
      });
      expect(result.logs).toHaveLength(2);
      expect(result.totalCount).toBe(2);
    });

    it("should filter by time range (both startTime and endTime)", async () => {
      const baseTime = Date.now();
      const result = await repository.query({
        startTime: baseTime + 500,
        endTime: baseTime + 2500,
      });
      expect(result.logs).toHaveLength(2);
      expect(result.totalCount).toBe(2);
    });

    it("should combine multiple filters", async () => {
      const result = await repository.query({
        entityType: "Record",
        operation: "create",
        actor: "system",
      });
      expect(result.logs).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.logs[0].id).toBe("audit-5");
    });

    it("should return empty array when no logs match filters", async () => {
      const result = await repository.query({
        entityType: "NonExistent",
      });
      expect(result.logs).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it("should apply limit", async () => {
      const result = await repository.query({ limit: 2 });
      expect(result.logs).toHaveLength(2);
      expect(result.totalCount).toBe(5);
    });

    it("should apply offset", async () => {
      const result = await repository.query({ offset: 2 });
      expect(result.logs).toHaveLength(3);
      expect(result.totalCount).toBe(5);
    });

    it("should apply both limit and offset", async () => {
      const result = await repository.query({ offset: 1, limit: 2 });
      expect(result.logs).toHaveLength(2);
      expect(result.totalCount).toBe(5);
    });

    it("should sort results by timestamp descending", async () => {
      const result = await repository.query({});
      const timestamps = result.logs.map((log) => log.timestamp);
      const sortedTimestamps = [...timestamps].sort((a, b) => b - a);
      expect(timestamps).toEqual(sortedTimestamps);
    });

    it("should maintain correct totalCount with limit and offset", async () => {
      const result = await repository.query({
        entityType: "Record",
        limit: 1,
        offset: 1,
      });
      expect(result.logs).toHaveLength(1);
      expect(result.totalCount).toBe(4);
    });

    it("should handle limit larger than result set", async () => {
      const result = await repository.query({ limit: 100 });
      expect(result.logs).toHaveLength(5);
      expect(result.totalCount).toBe(5);
    });

    it("should handle offset larger than result set", async () => {
      const result = await repository.query({ offset: 100 });
      expect(result.logs).toHaveLength(0);
      expect(result.totalCount).toBe(5);
    });
  });

  describe("deleteOlderThan", () => {
    let baseTime: number;

    beforeEach(async () => {
      baseTime = Date.now();
      const logs: AuditLog[] = [
        createMockAuditLog({
          id: "audit-old-1",
          timestamp: baseTime - 5000,
        }),
        createMockAuditLog({
          id: "audit-old-2",
          timestamp: baseTime - 3000,
        }),
        createMockAuditLog({
          id: "audit-recent-1",
          timestamp: baseTime - 1000,
        }),
        createMockAuditLog({
          id: "audit-recent-2",
          timestamp: baseTime,
        }),
      ];

      for (const log of logs) {
        await repository.save(log);
      }
    });

    it("should delete logs older than the specified timestamp", async () => {
      const deletedCount = await repository.deleteOlderThan(baseTime - 2000);

      expect(deletedCount).toBe(2);
      expect(repository.size()).toBe(2);
    });

    it("should delete all logs when threshold is far in the future", async () => {
      const deletedCount = await repository.deleteOlderThan(baseTime + 10000);

      expect(deletedCount).toBe(4);
      expect(repository.size()).toBe(0);
    });

    it("should not delete any logs when threshold is far in the past", async () => {
      const deletedCount = await repository.deleteOlderThan(baseTime - 10000);

      expect(deletedCount).toBe(0);
      expect(repository.size()).toBe(4);
    });

    it("should handle empty repository", async () => {
      const emptyRepo = new InMemoryAuditLogRepository();
      const deletedCount = await emptyRepo.deleteOlderThan(Date.now());

      expect(deletedCount).toBe(0);
      expect(emptyRepo.size()).toBe(0);
    });

    it("should preserve logs that exactly match the threshold timestamp", async () => {
      await repository.save(
        createMockAuditLog({
          id: "audit-exact",
          timestamp: baseTime - 2000,
        }),
      );

      const deletedCount = await repository.deleteOlderThan(baseTime - 2000);

      expect(deletedCount).toBe(2);
      expect(repository.size()).toBe(3);
    });
  });

  describe("count", () => {
    beforeEach(async () => {
      const baseTime = Date.now();
      const logs: AuditLog[] = [
        createMockAuditLog({
          id: "audit-1",
          entityType: "Record",
          operation: "create",
          actor: "user-1",
          timestamp: baseTime,
        }),
        createMockAuditLog({
          id: "audit-2",
          entityType: "Record",
          operation: "update",
          actor: "user-1",
          timestamp: baseTime + 1000,
        }),
        createMockAuditLog({
          id: "audit-3",
          entityType: "Stats",
          operation: "create",
          actor: "system",
          timestamp: baseTime + 2000,
        }),
      ];

      for (const log of logs) {
        await repository.save(log);
      }
    });

    it("should count all logs when no filters provided", async () => {
      const count = await repository.count({});
      expect(count).toBe(3);
    });

    it("should count logs matching entityType filter", async () => {
      const count = await repository.count({ entityType: "Record" });
      expect(count).toBe(2);
    });

    it("should count logs matching operation filter", async () => {
      const count = await repository.count({ operation: "create" });
      expect(count).toBe(2);
    });

    it("should count logs matching actor filter", async () => {
      const count = await repository.count({ actor: "user-1" });
      expect(count).toBe(2);
    });

    it("should count logs matching multiple filters", async () => {
      const count = await repository.count({
        entityType: "Record",
        operation: "create",
      });
      expect(count).toBe(1);
    });

    it("should return zero when no logs match", async () => {
      const count = await repository.count({ entityType: "NonExistent" });
      expect(count).toBe(0);
    });

    it("should ignore limit and offset parameters", async () => {
      const count = await repository.count(
        {
          entityType: "Record",
        },
        1,
        1,
      );
      expect(count).toBe(2);
    });
  });

  describe("clear", () => {
    it("should clear all logs from the repository", async () => {
      const log = createMockAuditLog();
      await repository.save(log);

      expect(repository.size()).toBe(1);

      repository.clear();

      expect(repository.size()).toBe(0);
    });

    it("should handle clearing an empty repository", async () => {
      repository.clear();
      expect(repository.size()).toBe(0);
    });
  });

  describe("size", () => {
    it("should return zero for empty repository", () => {
      expect(repository.size()).toBe(0);
    });

    it("should return the number of logs in the repository", async () => {
      await repository.save(createMockAuditLog({ id: "audit-1" }));
      expect(repository.size()).toBe(1);

      await repository.save(createMockAuditLog({ id: "audit-2" }));
      expect(repository.size()).toBe(2);

      await repository.save(createMockAuditLog({ id: "audit-3" }));
      expect(repository.size()).toBe(3);
    });
  });

  describe("integration with factory functions", () => {
    it("should work with createAuditLogForCreate", async () => {
      const log = createAuditLogForCreate(
        "Record",
        "record-123",
        { name: "Test" },
        { source: "api" },
      );

      await repository.save(log);
      const found = await repository.findById(log.id);

      expect(found).toEqual(log);
      expect(found?.operation).toBe("create");
      expect(found?.changes.before).toBeNull();
    });

    it("should work with createAuditLogForUpdate", async () => {
      const log = createAuditLogForUpdate(
        "Record",
        "record-123",
        { name: "Old" },
        { name: "New" },
        { source: "api" },
      );

      await repository.save(log);
      const found = await repository.findById(log.id);

      expect(found).toEqual(log);
      expect(found?.operation).toBe("update");
      expect(found?.changes.before).toEqual({ name: "Old" });
      expect(found?.changes.after).toEqual({ name: "New" });
    });

    it("should work with createAuditLogForDelete", async () => {
      const log = createAuditLogForDelete(
        "Record",
        "record-123",
        { name: "Deleted" },
        { source: "api" },
      );

      await repository.save(log);
      const found = await repository.findById(log.id);

      expect(found).toEqual(log);
      expect(found?.operation).toBe("delete");
      expect(found?.changes.after).toBeNull();
    });

    it("should query logs created by different factory functions", async () => {
      const createLog = createAuditLogForCreate(
        "Record",
        "record-1",
        { name: "Test" },
        { source: "api" },
      );
      const updateLog = createAuditLogForUpdate(
        "Record",
        "record-1",
        { name: "Old" },
        { name: "New" },
        { source: "api" },
      );
      const deleteLog = createAuditLogForDelete(
        "Record",
        "record-1",
        { name: "Delete" },
        { source: "api" },
      );

      await repository.save(createLog);
      await repository.save(updateLog);
      await repository.save(deleteLog);

      const createResults = await repository.query({
        operation: "create",
      });
      const updateResults = await repository.query({
        operation: "update",
      });
      const deleteResults = await repository.query({
        operation: "delete",
      });

      expect(createResults.logs).toHaveLength(1);
      expect(updateResults.logs).toHaveLength(1);
      expect(deleteResults.logs).toHaveLength(1);
    });
  });
});
