/**
 * Domain entity representing a data backup for disaster recovery.
 *
 * Captures complete system state at a point in time for restoration
 * in case of data corruption, accidental deletion, or system failure.
 *
 * @example
 * ```ts
 * const backup: Backup = {
 *   id: "backup-20260330-120000",
 *   timestamp: Date.now(),
 *   size: 1024000,
 *   recordCount: 150,
 *   checksum: "sha256:abc123...",
 *   status: "completed",
 *   metadata: { source: "scheduled", triggeredBy: "system" }
 * };
 * ```
 */

export type BackupStatus = "pending" | "in_progress" | "completed" | "failed";

export interface Backup {
  /** Unique identifier for this backup (timestamp-based for sorting) */
  id: string;

  /** Unix timestamp in milliseconds when the backup was created */
  timestamp: number;

  /** Size of the backup data in bytes */
  size: number;

  /** Number of records included in this backup */
  recordCount: number;

  /** SHA-256 checksum of the backup data for integrity verification */
  checksum: string;

  /** Current status of the backup operation */
  status: BackupStatus;

  /** Error message if backup failed */
  error?: string;

  /** Additional metadata about the backup */
  metadata: {
    /** Source of the backup trigger (e.g., "scheduled", "manual", "pre-deployment") */
    source: string;

    /** Actor who triggered the backup (user ID or "system") */
    triggeredBy: string;

    /** Backup format version for compatibility tracking */
    formatVersion: string;

    /** List of entity types included in this backup */
    entities: string[];

    /** Correlation ID for tracking related operations */
    correlationId?: string;

    /** Additional custom metadata */
    [key: string]: unknown;
  };
}

/**
 * Factory function to create a Backup entity.
 */
export function createBackup(
  size: number,
  recordCount: number,
  checksum: string,
  metadata: Backup["metadata"],
  triggeredBy: string = "system",
): Backup {
  const timestamp = Date.now();
  return {
    id: `backup-${timestamp}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp,
    size,
    recordCount,
    checksum,
    status: "completed",
    metadata: {
      ...metadata,
      triggeredBy,
      formatVersion: "1.0",
    },
  };
}

/**
 * Factory function to create a pending Backup entity (for tracking in-progress backups).
 */
export function createPendingBackup(
  metadata: Backup["metadata"],
  triggeredBy: string = "system",
): Backup {
  const timestamp = Date.now();
  return {
    id: `backup-${timestamp}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp,
    size: 0,
    recordCount: 0,
    checksum: "",
    status: "pending",
    metadata: {
      ...metadata,
      triggeredBy,
      formatVersion: "1.0",
    },
  };
}

/**
 * Updates a backup entity with completion data.
 */
export function markBackupCompleted(
  backup: Backup,
  size: number,
  recordCount: number,
  checksum: string,
): Backup {
  return {
    ...backup,
    size,
    recordCount,
    checksum,
    status: "completed" as const,
  };
}

/**
 * Marks a backup as failed with an error message.
 */
export function markBackupFailed(backup: Backup, error: string): Backup {
  return {
    ...backup,
    status: "failed" as const,
    error,
  };
}

/**
 * Checks if a backup is in a terminal state (completed or failed).
 */
export function isBackupTerminal(backup: Backup): boolean {
  return backup.status === "completed" || backup.status === "failed";
}

/**
 * Checks if a backup can be restored (must be completed).
 */
export function isBackupRestorable(backup: Backup): boolean {
  return backup.status === "completed";
}
