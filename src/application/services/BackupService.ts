import type { BackupRepository, BackupQuery } from "@/domain/repositories/BackupRepository";
import type { RecordRepository } from "@/domain/repositories/IRecordRepository";
import type { StatsRepository } from "@/domain/repositories/StatsRepository";
import type { AuditLogRepository } from "@/domain/repositories/AuditLogRepository";
import {
  createBackup,
  createPendingBackup,
  markBackupCompleted,
  markBackupFailed,
  isBackupRestorable,
  type Backup,
  type BackupMetadata,
} from "@/domain/entities/Backup";
import { createHash } from "crypto";

/**
 * Statistics about backups in the system.
 */
export interface BackupStats {
  /** Total number of backups */
  totalCount: number;

  /** Total storage size in bytes */
  totalSize: number;

  /** Number of completed backups */
  completedCount: number;

  /** Number of failed backups */
  failedCount: number;

  /** Number of pending/in-progress backups */
  pendingCount: number;
}

/**
 * Application service for backup and restore operations.
 *
 * Orchestrates backup creation and restoration across all data repositories
 * (Records, Stats, AuditLogs). Provides high-level operations for data protection
 * and disaster recovery with proper error handling and audit logging.
 *
 * Design principles:
 * - Single Responsibility: Only handles backup/restore orchestration
 * - Dependency Inversion: Depends on repository interfaces, not concrete implementations
 * - Transaction Safety: Ensures data consistency during backup/restore operations
 *
 * @example
 * ```ts
 * const backupService = new BackupService(
 *   backupRepository,
 *   recordRepository,
 *   statsRepository,
 *   auditLogRepository
 * );
 *
 * // Create a backup
 * const backup = await backupService.createBackup({
 *   source: "manual",
 *   entities: ["Record", "Stats", "AuditLog"]
 * }, "user-123");
 *
 * // Restore from backup
 * const result = await backupService.restoreBackup(backup.id);
 *
 * // List backups
 * const backups = await backupService.listBackups({ status: "completed" });
 * ```
 */
export class BackupService {
  /**
   * Creates a new BackupService instance.
   *
   * @param backupRepository - Repository for backup metadata persistence
   * @param recordRepository - Repository for Record entities
   * @param statsRepository - Repository for Stats entities
   * @param auditLogRepository - Repository for audit logging
   */
  constructor(
    private readonly backupRepository: BackupRepository,
    private readonly recordRepository: RecordRepository,
    private readonly statsRepository: StatsRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  /**
   * Creates a backup of all data in the system.
   *
   * Collects data from all repositories (Records, Stats, AuditLogs),
   * calculates record count and checksum, and persists the backup metadata.
   *
   * @param metadata - Additional metadata about the backup
   * @param triggeredBy - Actor who triggered the backup (default: "system")
   * @returns Promise resolving to the created Backup entity
   *
   * @throws Error if backup creation or persistence fails
   *
   * @example
   * ```ts
   * const backup = await backupService.createBackup({
   *   source: "scheduled",
   *   entities: ["Record", "Stats", "AuditLog"],
   *   correlationId: "scheduled-job-123"
   * });
   * ```
   */
  async createBackup(
    metadata: BackupMetadata,
    triggeredBy: string = "system",
  ): Promise<Backup> {
    try {
      const pendingBackup = createPendingBackup(metadata, triggeredBy);
      await this.backupRepository.save(pendingBackup);

      const records = await this.recordRepository.findAll();
      const stats = await this.statsRepository.findAll();
      const auditLogs = await this.auditLogRepository.findAll();

      const recordCount = records.length + stats.length + auditLogs.length;

      const dataString = JSON.stringify({ records, stats, auditLogs });
      const checksum = `sha256:${createHash("sha256").update(dataString).digest("hex")}`;
      const size = Buffer.byteLength(dataString, "utf8");

      const completedBackup = markBackupCompleted(
        pendingBackup,
        size,
        recordCount,
        checksum,
      );

      await this.backupRepository.save(completedBackup);

      await this.auditLogRepository.create({
        timestamp: Date.now(),
        entityType: "Backup",
        entityId: completedBackup.id,
        operation: "create",
        actor: triggeredBy,
        changes: {
          before: null,
          after: {
            id: completedBackup.id,
            recordCount,
            size,
            checksum,
          },
        },
        metadata: {
          source: metadata.source,
          correlationId: metadata.correlationId,
        },
      });

      return completedBackup;
    } catch (error) {
      const failedBackup = markBackupFailed(
        createPendingBackup(metadata, triggeredBy),
        error instanceof Error ? error.message : String(error),
      );
      await this.backupRepository.save(failedBackup);
      throw error;
    }
  }

  /**
   * Restores data from a backup.
   *
   * Loads backup data and restores all entities (Records, Stats, AuditLogs)
   * to their state at the time of the backup. This is a destructive operation
   * that replaces current data with backup data.
   *
   * @param backupId - Unique identifier of the backup to restore
   * @returns Promise resolving to restore operation details
   *
   * @throws Error if backup not found or not in completed state
   *
   * @example
   * ```ts
   * const result = await backupService.restoreBackup("backup-123");
   * console.log(`Restored ${result.recordCount} records from backup`);
   * ```
   */
  async restoreBackup(backupId: string): Promise<{ backupId: string; backupTimestamp: number; recordCount: number; size: number }> {
    const backup = await this.backupRepository.findById(backupId);
    if (!backup) {
      throw new Error(`Backup with id '${backupId}' not found`);
    }

    if (!isBackupRestorable(backup)) {
      throw new Error(
        `Cannot restore backup with status '${backup.status}'. Only completed backups can be restored.`,
      );
    }

    const restoreResult = await this.backupRepository.restore(backupId);

    await this.auditLogRepository.create({
      timestamp: Date.now(),
      entityType: "Backup",
      entityId: backupId,
      operation: "restore",
      actor: "system",
      changes: {
        before: null,
        after: {
          backupId,
          recordCount: restoreResult.recordCount,
          size: restoreResult.size,
        },
      },
      metadata: {
        source: "restore",
        backupTimestamp: restoreResult.backupTimestamp,
      },
    });

    return {
      backupId: restoreResult.backupId,
      backupTimestamp: restoreResult.backupTimestamp,
      recordCount: restoreResult.recordCount,
      size: restoreResult.size,
    };
  }

  /**
   * Lists backups with optional filtering and pagination.
   *
   * @param query - Query options for filtering and pagination
   * @returns Promise resolving to array of backups matching the query
   *
   * @example
   * ```ts
   * // List all completed backups
   * const completed = await backupService.listBackups({ status: "completed" });
   *
   * // List manual backups with pagination
   * const manual = await backupService.listBackups({
   *   source: "manual",
   *   limit: 10,
   *   offset: 0
   * });
   * ```
   */
  async listBackups(query?: Partial<BackupQuery>): Promise<Backup[]> {
    const result = await this.backupRepository.query(query ?? {});
    return result.backups;
  }

  /**
   * Deletes backups older than the specified timestamp.
   *
   * Useful for implementing retention policies to prevent unlimited storage usage.
   *
   * @param beforeTimestamp - Delete backups with timestamp less than this value
   * @returns Promise resolving to the number of backups deleted
   *
   * @example
   * ```ts
   * // Delete backups older than 30 days
   * const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
   * const deletedCount = await backupService.deleteOldBackups(thirtyDaysAgo);
   * ```
   */
  async deleteOldBackups(beforeTimestamp: number): Promise<number> {
    return this.backupRepository.deleteOlderThan(beforeTimestamp);
  }

  /**
   * Retrieves a backup by its unique identifier.
   *
   * @param id - Unique identifier of the backup
   * @returns Promise resolving to the Backup if found, null otherwise
   *
   * @example
   * ```ts
   * const backup = await backupService.getBackupById("backup-123");
   * if (backup) {
   *   console.log(`Backup size: ${backup.size} bytes`);
   * }
   * ```
   */
  async getBackupById(id: string): Promise<Backup | null> {
    return this.backupRepository.findById(id);
  }

  /**
   * Retrieves the most recent completed backup.
   *
   * Useful for "restore to latest" functionality.
   *
   * @returns Promise resolving to the most recent completed backup, null if none exist
   *
   * @example
   * ```ts
   * const latest = await backupService.getLatestBackup();
   * if (latest) {
   *   await backupService.restoreBackup(latest.id);
   * }
   * ```
   */
  async getLatestBackup(): Promise<Backup | null> {
    return this.backupRepository.findLatestCompleted();
  }

  /**
   * Gets statistics about backups in the system.
   *
   * @returns Promise resolving to backup statistics
   *
   * @example
   * ```ts
   * const stats = await backupService.getBackupStats();
   * console.log(`Total backups: ${stats.totalCount}`);
   * console.log(`Total size: ${stats.totalSize} bytes`);
   * console.log(`Completed: ${stats.completedCount}, Failed: ${stats.failedCount}`);
   * ```
   */
  async getBackupStats(): Promise<BackupStats> {
    const allBackups = await this.backupRepository.query({});
    const totalSize = await this.backupRepository.getTotalSize();

    const completedCount = allBackups.backups.filter(
      (b) => b.status === "completed",
    ).length;
    const failedCount = allBackups.backups.filter(
      (b) => b.status === "failed",
    ).length;
    const pendingCount = allBackups.backups.filter(
      (b) => b.status === "pending" || b.status === "in_progress",
    ).length;

    return {
      totalCount: allBackups.totalCount,
      totalSize,
      completedCount,
      failedCount,
      pendingCount,
    };
  }
}
