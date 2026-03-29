import {
  createBackup,
  createPendingBackup,
  markBackupCompleted,
  markBackupFailed,
  isBackupTerminal,
  isBackupRestorable,
  type Backup,
} from "./Backup";

describe("Backup Entity", () => {
  const mockMetadata = {
    source: "manual",
    entities: ["Record", "Stats"],
    correlationId: "test-correlation-123",
  };

  describe("createBackup", () => {
    it("should create a completed backup with all required fields", () => {
      const size = 1024000;
      const recordCount = 150;
      const checksum = "sha256:abc123def456";

      const backup = createBackup(size, recordCount, checksum, mockMetadata, "user-123");

      expect(backup.id).toMatch(/^backup-\d+-[a-z0-9]+$/);
      expect(backup.timestamp).toBeGreaterThan(0);
      expect(backup.size).toBe(size);
      expect(backup.recordCount).toBe(recordCount);
      expect(backup.checksum).toBe(checksum);
      expect(backup.status).toBe("completed");
      expect(backup.metadata.source).toBe("manual");
      expect(backup.metadata.triggeredBy).toBe("user-123");
      expect(backup.metadata.formatVersion).toBe("1.0");
      expect(backup.metadata.entities).toEqual(["Record", "Stats"]);
      expect(backup.metadata.correlationId).toBe("test-correlation-123");
      expect(backup.error).toBeUndefined();
    });

    it("should default triggeredBy to 'system' if not provided", () => {
      const backup = createBackup(100, 10, "sha256:checksum", mockMetadata);

      expect(backup.metadata.triggeredBy).toBe("system");
    });

    it("should merge provided metadata with defaults", () => {
      const customMetadata = {
        source: "scheduled" as const,
        entities: ["Record"],
        customField: "custom-value",
      };

      const backup = createBackup(500, 50, "sha256:abc", customMetadata);

      expect(backup.metadata.source).toBe("scheduled");
      expect(backup.metadata.entities).toEqual(["Record"]);
      expect(backup.metadata.customField).toBe("custom-value");
      expect(backup.metadata.formatVersion).toBe("1.0");
      expect(backup.metadata.triggeredBy).toBe("system");
    });

    it("should generate unique IDs for each backup", () => {
      const backup1 = createBackup(100, 10, "sha256:a", mockMetadata);
      const backup2 = createBackup(100, 10, "sha256:b", mockMetadata);

      expect(backup1.id).not.toBe(backup2.id);
    });
  });

  describe("createPendingBackup", () => {
    it("should create a pending backup with zero values", () => {
      const backup = createPendingBackup(mockMetadata, "user-456");

      expect(backup.id).toMatch(/^backup-\d+-[a-z0-9]+$/);
      expect(backup.timestamp).toBeGreaterThan(0);
      expect(backup.size).toBe(0);
      expect(backup.recordCount).toBe(0);
      expect(backup.checksum).toBe("");
      expect(backup.status).toBe("pending");
      expect(backup.metadata.source).toBe("manual");
      expect(backup.metadata.triggeredBy).toBe("user-456");
      expect(backup.metadata.formatVersion).toBe("1.0");
      expect(backup.error).toBeUndefined();
    });

    it("should default triggeredBy to 'system' if not provided", () => {
      const backup = createPendingBackup(mockMetadata);

      expect(backup.metadata.triggeredBy).toBe("system");
    });
  });

  describe("markBackupCompleted", () => {
    it("should update a pending backup with completion data", () => {
      const pending = createPendingBackup(mockMetadata);
      const size = 2048000;
      const recordCount = 300;
      const checksum = "sha256:completed123";

      const completed = markBackupCompleted(pending, size, recordCount, checksum);

      expect(completed.id).toBe(pending.id);
      expect(completed.timestamp).toBe(pending.timestamp);
      expect(completed.size).toBe(size);
      expect(completed.recordCount).toBe(recordCount);
      expect(completed.checksum).toBe(checksum);
      expect(completed.status).toBe("completed");
      expect(completed.metadata).toEqual(pending.metadata);
      expect(completed.error).toBeUndefined();
    });

    it("should preserve metadata from original backup", () => {
      const pending = createPendingBackup({
        ...mockMetadata,
        customField: "preserve-me",
      });

      const completed = markBackupCompleted(pending, 1000, 100, "sha256:xyz");

      expect(completed.metadata.customField).toBe("preserve-me");
      expect(completed.metadata.source).toBe("manual");
    });
  });

  describe("markBackupFailed", () => {
    it("should mark a backup as failed with error message", () => {
      const backup = createBackup(1000, 100, "sha256:abc", mockMetadata);
      const errorMessage = "Database connection lost during backup";

      const failed = markBackupFailed(backup, errorMessage);

      expect(failed.id).toBe(backup.id);
      expect(failed.timestamp).toBe(backup.timestamp);
      expect(failed.size).toBe(backup.size);
      expect(failed.recordCount).toBe(backup.recordCount);
      expect(failed.checksum).toBe(backup.checksum);
      expect(failed.status).toBe("failed");
      expect(failed.error).toBe(errorMessage);
      expect(failed.metadata).toEqual(backup.metadata);
    });

    it("should preserve all original data except status and error", () => {
      const original = createBackup(5000, 500, "sha256:def", mockMetadata, "user-789");

      const failed = markBackupFailed(original, "Insufficient storage");

      expect(failed.id).toBe(original.id);
      expect(failed.timestamp).toBe(original.timestamp);
      expect(failed.size).toBe(5000);
      expect(failed.recordCount).toBe(500);
      expect(failed.checksum).toBe("sha256:def");
      expect(failed.metadata.triggeredBy).toBe("user-789");
      expect(failed.status).toBe("failed");
      expect(failed.error).toBe("Insufficient storage");
    });
  });

  describe("isBackupTerminal", () => {
    it("should return true for completed backups", () => {
      const completed = createBackup(1000, 100, "sha256:abc", mockMetadata);

      expect(isBackupTerminal(completed)).toBe(true);
    });

    it("should return true for failed backups", () => {
      const backup = createBackup(1000, 100, "sha256:abc", mockMetadata);
      const failed = markBackupFailed(backup, "Error");

      expect(isBackupTerminal(failed)).toBe(true);
    });

    it("should return false for pending backups", () => {
      const pending = createPendingBackup(mockMetadata);

      expect(isBackupTerminal(pending)).toBe(false);
    });

    it("should return false for in_progress backups", () => {
      const backup = createBackup(1000, 100, "sha256:abc", mockMetadata);
      const inProgress: Backup = { ...backup, status: "in_progress" };

      expect(isBackupTerminal(inProgress)).toBe(false);
    });
  });

  describe("isBackupRestorable", () => {
    it("should return true for completed backups", () => {
      const completed = createBackup(1000, 100, "sha256:abc", mockMetadata);

      expect(isBackupRestorable(completed)).toBe(true);
    });

    it("should return false for pending backups", () => {
      const pending = createPendingBackup(mockMetadata);

      expect(isBackupRestorable(pending)).toBe(false);
    });

    it("should return false for failed backups", () => {
      const backup = createBackup(1000, 100, "sha256:abc", mockMetadata);
      const failed = markBackupFailed(backup, "Error");

      expect(isBackupRestorable(failed)).toBe(false);
    });

    it("should return false for in_progress backups", () => {
      const backup = createBackup(1000, 100, "sha256:abc", mockMetadata);
      const inProgress: Backup = { ...backup, status: "in_progress" };

      expect(isBackupRestorable(inProgress)).toBe(false);
    });
  });

  describe("Backup type system", () => {
    it("should enforce type safety on status field", () => {
      const completed = createBackup(100, 10, "sha256:abc", mockMetadata);

      expect(completed.status).toBe("completed");

      if (completed.status === "completed") {
        expect(completed.error).toBeUndefined();
      }
    });

    it("should allow custom metadata fields", () => {
      const backup = createBackup(
        100,
        10,
        "sha256:abc",
        {
          source: "manual",
          entities: ["Record"],
          customNumber: 42,
          customBoolean: true,
          customObject: { nested: "value" },
        },
      );

      expect(backup.metadata.customNumber).toBe(42);
      expect(backup.metadata.customBoolean).toBe(true);
      expect(backup.metadata.customObject).toEqual({ nested: "value" });
    });

    it("should handle all valid status values", () => {
      const validStatuses: Array<Backup["status"]> = ["pending", "in_progress", "completed", "failed"];

      validStatuses.forEach((status) => {
        const backup: Backup = {
          id: "backup-test",
          timestamp: Date.now(),
          size: 0,
          recordCount: 0,
          checksum: "",
          status,
          metadata: { source: "test", triggeredBy: "system", entities: [], formatVersion: "1.0" },
        };

        expect(backup.status).toBe(status);
      });
    });
  });

  describe("Backup lifecycle scenarios", () => {
    it("should handle full backup lifecycle: pending -> completed", () => {
      const pending = createPendingBackup({
        source: "scheduled",
        entities: ["Record", "Stats"],
      });

      expect(isBackupTerminal(pending)).toBe(false);
      expect(isBackupRestorable(pending)).toBe(false);

      const completed = markBackupCompleted(pending, 5000, 500, "sha256:lifecycle");

      expect(isBackupTerminal(completed)).toBe(true);
      expect(isBackupRestorable(completed)).toBe(true);
      expect(completed.status).toBe("completed");
    });

    it("should handle failed backup lifecycle: pending -> failed", () => {
      const pending = createPendingBackup({
        source: "manual",
        entities: ["Record"],
      });

      expect(isBackupTerminal(pending)).toBe(false);

      const failed = markBackupFailed(pending, "Network timeout");

      expect(isBackupTerminal(failed)).toBe(true);
      expect(isBackupRestorable(failed)).toBe(false);
      expect(failed.status).toBe("failed");
      expect(failed.error).toBe("Network timeout");
    });

    it("should prevent restoring from failed backup even with completion data", () => {
      const completed = createBackup(1000, 100, "sha256:abc", mockMetadata);
      const failed = markBackupFailed(completed, "Post-completion validation failed");

      expect(isBackupRestorable(failed)).toBe(false);
      expect(failed.size).toBe(1000);
      expect(failed.recordCount).toBe(100);
    });
  });
});
