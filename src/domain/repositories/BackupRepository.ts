import type { Backup, BackupStatus } from "../entities/Backup";

/**
 * Query options for filtering backups.
 */
export interface BackupQuery {
  /** Filter by backup status */
  status?: BackupStatus;

  /** Filter by trigger source (e.g., "scheduled", "manual") */
  source?: string;

  /** Filter by actor who triggered the backup */
  triggeredBy?: string;

  /** Filter by time range (start timestamp in milliseconds) */
  startTime?: number;

  /** Filter by time range (end timestamp in milliseconds) */
  endTime?: number;

  /** Maximum number of results to return */
  limit?: number;

  /** Offset for pagination */
  offset?: number;
}

/**
 * Query result with pagination metadata.
 */
export interface BackupQueryResult {
  /** Array of backups matching the query */
  backups: Backup[];

  /** Total count of backups matching the query (before limit/offset) */
  totalCount: number;
}

/**
 * Restore result with details about the restore operation.
 */
export interface RestoreResult {
  /** Number of records restored */
  recordCount: number;

  /** Size of restored data in bytes */
  size: number;

  /** Timestamp of the restored backup */
  backupTimestamp: number;

  /** ID of the restored backup */
  backupId: string;
}

/**
 * Repository interface for backup persistence and retrieval.
 *
 * Provides methods for storing backups, querying them by various criteria,
 * and restoring from backups. Implementations can use different storage
 * backends (in-memory, filesystem, database, cloud storage) while
 * maintaining a consistent interface for domain services.
 *
 * @example
 * ```ts
 * class InMemoryBackupRepository implements BackupRepository {
 *   private backups: Backup[] = [];
 *
 *   async save(backup: Backup): Promise<void> {
 *     this.backups.push(backup);
 *   }
 *
 *   async findById(id: string): Promise<Backup | null> {
 *     return this.backups.find(b => b.id === id) ?? null;
 *   }
 *
 *   async restore(id: string): Promise<RestoreResult> {
 *     const backup = await this.findById(id);
 *     if (!backup) throw new Error("Backup not found");
 *     // Restore logic...
 *     return { recordCount: backup.recordCount, size: backup.size, ... };
 *   }
 * }
 * ```
 */
export interface BackupRepository {
  /**
   * Saves a backup entry to the repository.
   *
   * @param backup - Backup entry to store.
   * @returns Promise that resolves when save operation completes.
   */
  save(backup: Backup): Promise<void>;

  /**
   * Retrieves a backup entry by its unique identifier.
   *
   * @param id - Unique identifier of the backup entry.
   * @returns Promise resolving to the Backup if found, null otherwise.
   */
  findById(id: string): Promise<Backup | null>;

  /**
   * Queries backups with optional filtering and pagination.
   *
   * All query parameters are optional and combined with AND logic.
   * Results are ordered by timestamp descending (most recent first).
   *
   * @param query - Query options for filtering and pagination.
   * @returns Promise resolving to query results with backups and total count.
   */
  query(query: BackupQuery): Promise<BackupQueryResult>;

  /**
   * Deletes backups older than the specified timestamp.
   *
   * Useful for implementing retention policies to prevent unlimited storage usage.
   *
   * @param beforeTimestamp - Delete backups with timestamp less than this value.
   * @returns Promise resolving to the number of backups deleted.
   */
  deleteOlderThan(beforeTimestamp: number): Promise<number>;

  /**
   * Deletes a specific backup by ID.
   *
   * @param id - Unique identifier of the backup to delete.
   * @returns Promise that resolves when deletion completes.
   * @throws Error if backup not found.
   */
  delete(id: string): Promise<void>;

  /**
   * Restores data from a backup.
   *
   * This is a critical operation that replaces current data with the backup state.
   * Implementations should ensure atomicity and consistency.
   *
   * @param id - Unique identifier of the backup to restore from.
   * @returns Promise resolving to restore operation details.
   * @throws Error if backup not found or restore fails.
   */
  restore(id: string): Promise<RestoreResult>;

  /**
   * Finds the most recent completed backup.
   *
   * Useful for "restore to latest" functionality.
   *
   * @returns Promise resolving to the most recent completed backup, null if none exist.
   */
  findLatestCompleted(): Promise<Backup | null>;

  /**
   * Counts backups matching the specified query.
   *
   * Useful for dashboards and monitoring.
   *
   * @param query - Query options for filtering (limit/offset ignored).
   * @returns Promise resolving to the count of matching backups.
   */
  count(query: Omit<BackupQuery, "limit" | "offset">): Promise<number>;

  /**
   * Gets the total storage size of all backups.
   *
   * Useful for monitoring storage usage and enforcing retention policies.
   *
   * @returns Promise resolving to total size in bytes.
   */
  getTotalSize(): Promise<number>;
}
