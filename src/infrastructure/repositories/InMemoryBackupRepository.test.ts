import {
  createBackup,
  createPendingBackup,
  markBackupFailed,
  type Backup,
} from "../../domain/entities/Backup";
import { InMemoryBackupRepository } from "./InMemoryBackupRepository";

describe("InMemoryBackupRepository", () => {
  let repository: InMemoryBackupRepository;

  beforeEach(() => {
    repository = new InMemoryBackupRepository();
  });

  describe("save", () => {
    it("should save a backup to the repository", async () => {
      const backup = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "manual", entities: ["Record"] },
        "user-123",
      );

      await repository.save(backup);

      expect(repository.size()).toBe(1);
    });

    it("should save multiple backups", async () => {
      const backup1 = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "scheduled", entities: ["Record"] },
      );
      const backup2 = createBackup(
        2048,
        20,
        "sha256:def456",
        { source: "manual", entities: ["Record"] },
      );

      await repository.save(backup1);
      await repository.save(backup2);

      expect(repository.size()).toBe(2);
    });

    it("should save backups with different statuses", async () => {
      const pendingBackup = createPendingBackup(
        { source: "manual", entities: ["Record"] },
      );
      const completedBackup = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "scheduled", entities: ["Record"] },
      );

      await repository.save(pendingBackup);
      await repository.save(completedBackup);

      expect(repository.size()).toBe(2);
    });
  });

  describe("findById", () => {
    it("should find a backup by id", async () => {
      const backup = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "manual", entities: ["Record"] },
        "user-123",
      );

      await repository.save(backup);
      const found = await repository.findById(backup.id);

      expect(found).toEqual(backup);
    });

    it("should return null when backup not found", async () => {
      const found = await repository.findById("non-existent-id");

      expect(found).toBeNull();
    });

    it("should find the correct backup when multiple exist", async () => {
      const backup1 = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "scheduled", entities: ["Record"] },
      );
      const backup2 = createBackup(
        2048,
        20,
        "sha256:def456",
        { source: "manual", entities: ["Record"] },
      );

      await repository.save(backup1);
      await repository.save(backup2);

      const found = await repository.findById(backup2.id);

      expect(found).toEqual(backup2);
      expect(found?.id).toBe(backup2.id);
    });
  });

  describe("query", () => {
    let backups: Backup[];

    beforeEach(async () => {
      backups = [
        createBackup(
          1024,
          10,
          "sha256:abc123",
          { source: "scheduled", entities: ["Record"] },
          "system",
        ),
        createBackup(
          2048,
          20,
          "sha256:def456",
          { source: "manual", entities: ["Record"] },
          "user-123",
        ),
        createPendingBackup(
          { source: "scheduled", entities: ["Record"] },
          "system",
        ),
      ];

      for (const backup of backups) {
        await repository.save(backup);
      }
    });

    it("should return all backups when no filters provided", async () => {
      const result = await repository.query({});

      expect(result.backups).toHaveLength(3);
      expect(result.totalCount).toBe(3);
    });

    it("should filter by status", async () => {
      const result = await repository.query({ status: "completed" });

      expect(result.backups).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.backups.every((b) => b.status === "completed")).toBe(true);
    });

    it("should filter by source", async () => {
      const result = await repository.query({ source: "manual" });

      expect(result.backups).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.backups[0].metadata.source).toBe("manual");
    });

    it("should filter by triggeredBy", async () => {
      const result = await repository.query({ triggeredBy: "system" });

      expect(result.backups).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(
        result.backups.every((b) => b.metadata.triggeredBy === "system"),
      ).toBe(true);
    });

    it("should filter by time range (startTime)", async () => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      const result = await repository.query({ startTime: oneHourAgo });

      expect(result.backups).toHaveLength(3);
      expect(result.totalCount).toBe(3);
    });

    it("should filter by time range (endTime)", async () => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      const result = await repository.query({ endTime: oneHourAgo });

      expect(result.backups).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it("should combine multiple filters", async () => {
      const result = await repository.query({
        status: "completed",
        source: "scheduled",
        triggeredBy: "system",
      });

      expect(result.backups).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.backups[0].metadata.source).toBe("scheduled");
      expect(result.backups[0].metadata.triggeredBy).toBe("system");
      expect(result.backups[0].status).toBe("completed");
    });

    it("should sort results by timestamp descending", async () => {
      const result = await repository.query({});

      expect(result.backups[0].timestamp).toBeGreaterThanOrEqual(
        result.backups[1].timestamp,
      );
      expect(result.backups[1].timestamp).toBeGreaterThanOrEqual(
        result.backups[2].timestamp,
      );
    });

    it("should apply limit", async () => {
      const result = await repository.query({ limit: 2 });

      expect(result.backups).toHaveLength(2);
      expect(result.totalCount).toBe(3);
    });

    it("should apply offset", async () => {
      const result = await repository.query({ offset: 1 });

      expect(result.backups).toHaveLength(2);
      expect(result.totalCount).toBe(3);
    });

    it("should apply both limit and offset", async () => {
      const result = await repository.query({ offset: 1, limit: 1 });

      expect(result.backups).toHaveLength(1);
      expect(result.totalCount).toBe(3);
    });

    it("should return empty array when no backups match", async () => {
      const result = await repository.query({ status: "failed" });

      expect(result.backups).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe("deleteOlderThan", () => {
    it("should delete backups older than the specified timestamp", async () => {
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;

      const oldBackup = createBackup(
        1024,
        10,
        "sha256:old",
        { source: "scheduled", entities: ["Record"] },
      );
      oldBackup.timestamp = twoDaysAgo;

      const newBackup = createBackup(
        2048,
        20,
        "sha256:new",
        { source: "manual", entities: ["Record"] },
      );
      newBackup.timestamp = oneDayAgo + 60 * 60 * 1000;

      await repository.save(oldBackup);
      await repository.save(newBackup);

      const deletedCount = await repository.deleteOlderThan(oneDayAgo);

      expect(deletedCount).toBe(1);
      expect(repository.size()).toBe(1);

      const remaining = await repository.findById(newBackup.id);
      expect(remaining).toEqual(newBackup);
    });

    it("should return 0 when no backups are deleted", async () => {
      const backup = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "scheduled", entities: ["Record"] },
      );

      await repository.save(backup);

      const deletedCount = await repository.deleteOlderThan(
        backup.timestamp - 1000,
      );

      expect(deletedCount).toBe(0);
      expect(repository.size()).toBe(1);
    });

    it("should delete all backups when timestamp is in the future", async () => {
      const backup1 = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "scheduled", entities: ["Record"] },
      );
      const backup2 = createBackup(
        2048,
        20,
        "sha256:def456",
        { source: "manual", entities: ["Record"] },
      );

      await repository.save(backup1);
      await repository.save(backup2);

      const deletedCount = await repository.deleteOlderThan(Date.now() + 10000);

      expect(deletedCount).toBe(2);
      expect(repository.size()).toBe(0);
    });
  });

  describe("delete", () => {
    it("should delete a backup by id", async () => {
      const backup = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "manual", entities: ["Record"] },
      );

      await repository.save(backup);
      expect(repository.size()).toBe(1);

      await repository.delete(backup.id);

      expect(repository.size()).toBe(0);
      const found = await repository.findById(backup.id);
      expect(found).toBeNull();
    });

    it("should throw error when backup not found", async () => {
      await expect(repository.delete("non-existent-id")).rejects.toThrow(
        "Backup with id 'non-existent-id' not found",
      );
    });

    it("should delete correct backup when multiple exist", async () => {
      const backup1 = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "scheduled", entities: ["Record"] },
      );
      const backup2 = createBackup(
        2048,
        20,
        "sha256:def456",
        { source: "manual", entities: ["Record"] },
      );

      await repository.save(backup1);
      await repository.save(backup2);

      await repository.delete(backup1.id);

      expect(repository.size()).toBe(1);
      const found = await repository.findById(backup2.id);
      expect(found).toEqual(backup2);
    });
  });

  describe("restore", () => {
    it("should restore a completed backup", async () => {
      const backup = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "manual", entities: ["Record"] },
        "user-123",
      );

      await repository.save(backup);

      const result = await repository.restore(backup.id);

      expect(result).toEqual({
        recordCount: 10,
        size: 1024,
        backupTimestamp: backup.timestamp,
        backupId: backup.id,
      });
    });

    it("should throw error when backup not found", async () => {
      await expect(repository.restore("non-existent-id")).rejects.toThrow(
        "Backup with id 'non-existent-id' not found",
      );
    });

    it("should throw error when backup is pending", async () => {
      const backup = createPendingBackup(
        { source: "manual", entities: ["Record"] },
        "user-123",
      );

      await repository.save(backup);

      await expect(repository.restore(backup.id)).rejects.toThrow(
        "Cannot restore backup with status 'pending'",
      );
    });

    it("should throw error when backup is failed", async () => {
      const backup = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "manual", entities: ["Record"] },
      );
      const failedBackup = markBackupFailed(backup, "Backup failed");

      await repository.save(failedBackup);

      await expect(repository.restore(backup.id)).rejects.toThrow(
        "Cannot restore backup with status 'failed'",
      );
    });

    it("should only restore completed backups", async () => {
      const completedBackup = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "scheduled", entities: ["Record"] },
      );

      await repository.save(completedBackup);

      const result = await repository.restore(completedBackup.id);

      expect(result.recordCount).toBe(10);
      expect(result.size).toBe(1024);
    });
  });

  describe("findLatestCompleted", () => {
    it("should return the most recent completed backup", async () => {
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;

      const oldBackup = createBackup(
        1024,
        10,
        "sha256:old",
        { source: "scheduled", entities: ["Record"] },
      );
      oldBackup.timestamp = twoDaysAgo;

      const newBackup = createBackup(
        2048,
        20,
        "sha256:new",
        { source: "manual", entities: ["Record"] },
      );
      newBackup.timestamp = oneDayAgo + 60 * 60 * 1000;

      await repository.save(oldBackup);
      await repository.save(newBackup);

      const latest = await repository.findLatestCompleted();

      expect(latest).toEqual(newBackup);
    });

    it("should return null when no completed backups exist", async () => {
      const pendingBackup = createPendingBackup({
        source: "manual",
        entities: ["Record"],
      });

      await repository.save(pendingBackup);

      const latest = await repository.findLatestCompleted();

      expect(latest).toBeNull();
    });

    it("should ignore pending backups", async () => {
      const completedBackup = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "scheduled", entities: ["Record"] },
      );
      const pendingBackup = createPendingBackup({
        source: "manual",
        entities: ["Record"],
      });
      pendingBackup.timestamp = completedBackup.timestamp + 10000;

      await repository.save(completedBackup);
      await repository.save(pendingBackup);

      const latest = await repository.findLatestCompleted();

      expect(latest).toEqual(completedBackup);
    });

    it("should ignore failed backups", async () => {
      const completedBackup = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "scheduled", entities: ["Record"] },
      );
      const failedBackup = createBackup(
        2048,
        20,
        "sha256:def456",
        { source: "manual", entities: ["Record"] },
      );
      const failed = markBackupFailed(failedBackup, "Backup failed");
      failed.timestamp = completedBackup.timestamp + 10000;

      await repository.save(completedBackup);
      await repository.save(failed);

      const latest = await repository.findLatestCompleted();

      expect(latest).toEqual(completedBackup);
    });
  });

  describe("count", () => {
    beforeEach(async () => {
      const backups = [
        createBackup(
          1024,
          10,
          "sha256:abc123",
          { source: "scheduled", entities: ["Record"] },
          "system",
        ),
        createBackup(
          2048,
          20,
          "sha256:def456",
          { source: "manual", entities: ["Record"] },
          "user-123",
        ),
        createPendingBackup(
          { source: "scheduled", entities: ["Record"] },
          "system",
        ),
      ];

      for (const backup of backups) {
        await repository.save(backup);
      }
    });

    it("should count all backups when no filters provided", async () => {
      const count = await repository.count({});

      expect(count).toBe(3);
    });

    it("should count backups by status", async () => {
      const count = await repository.count({ status: "completed" });

      expect(count).toBe(2);
    });

    it("should count backups by source", async () => {
      const count = await repository.count({ source: "scheduled" });

      expect(count).toBe(2);
    });

    it("should count backups by triggeredBy", async () => {
      const count = await repository.count({ triggeredBy: "system" });

      expect(count).toBe(2);
    });

    it("should count backups with combined filters", async () => {
      const count = await repository.count({
        status: "completed",
        source: "manual",
      });

      expect(count).toBe(1);
    });

    it("should return 0 when no backups match", async () => {
      const count = await repository.count({ status: "failed" });

      expect(count).toBe(0);
    });
  });

  describe("getTotalSize", () => {
    it("should return 0 when no backups exist", async () => {
      const totalSize = await repository.getTotalSize();

      expect(totalSize).toBe(0);
    });

    it("should return the total size of all backups", async () => {
      const backup1 = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "scheduled", entities: ["Record"] },
      );
      const backup2 = createBackup(
        2048,
        20,
        "sha256:def456",
        { source: "manual", entities: ["Record"] },
      );
      const backup3 = createBackup(
        512,
        5,
        "sha256:ghi789",
        { source: "scheduled", entities: ["Record"] },
      );

      await repository.save(backup1);
      await repository.save(backup2);
      await repository.save(backup3);

      const totalSize = await repository.getTotalSize();

      expect(totalSize).toBe(1024 + 2048 + 512);
    });

    it("should include size of pending backups", async () => {
      const completedBackup = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "scheduled", entities: ["Record"] },
      );
      const pendingBackup = createPendingBackup({
        source: "manual",
        entities: ["Record"],
      });

      await repository.save(completedBackup);
      await repository.save(pendingBackup);

      const totalSize = await repository.getTotalSize();

      expect(totalSize).toBe(1024 + 0);
    });
  });

  describe("clear", () => {
    it("should clear all backups from the repository", async () => {
      const backup1 = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "scheduled", entities: ["Record"] },
      );
      const backup2 = createBackup(
        2048,
        20,
        "sha256:def456",
        { source: "manual", entities: ["Record"] },
      );

      await repository.save(backup1);
      await repository.save(backup2);

      expect(repository.size()).toBe(2);

      repository.clear();

      expect(repository.size()).toBe(0);
    });
  });

  describe("size", () => {
    it("should return 0 when repository is empty", () => {
      expect(repository.size()).toBe(0);
    });

    it("should return the number of backups in the repository", async () => {
      const backup1 = createBackup(
        1024,
        10,
        "sha256:abc123",
        { source: "scheduled", entities: ["Record"] },
      );
      const backup2 = createBackup(
        2048,
        20,
        "sha256:def456",
        { source: "manual", entities: ["Record"] },
      );

      await repository.save(backup1);
      expect(repository.size()).toBe(1);

      await repository.save(backup2);
      expect(repository.size()).toBe(2);
    });
  });
});
