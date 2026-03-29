import type {
  Backup,
} from "../../domain/entities/Backup";
import type {
  BackupQuery,
  BackupQueryResult,
  BackupRepository,
  RestoreResult,
} from "../../domain/repositories/BackupRepository";

/**
 * In-memory implementation of BackupRepository for development and testing.
 *
 * Stores backups in a JavaScript array, providing fast query operations
 * without requiring a database. Perfect for development environments and
 * automated testing scenarios.
 *
 * Thread-safety: Not thread-safe. Do not share across workers or threads.
 *
 * @example
 * ```ts
 * const repository = new InMemoryBackupRepository();
 * await repository.save(backup);
 * const latest = await repository.findLatestCompleted();
 * ```
 */
export class InMemoryBackupRepository implements BackupRepository {
  private backups: Backup[] = [];

  async save(backup: Backup): Promise<void> {
    const existingIndex = this.backups.findIndex((b) => b.id === backup.id);
    if (existingIndex >= 0) {
      this.backups[existingIndex] = backup;
    } else {
      this.backups.push(backup);
    }
  }

  async findById(id: string): Promise<Backup | null> {
    return this.backups.find((b) => b.id === id) ?? null;
  }

  async query(query: BackupQuery): Promise<BackupQueryResult> {
    let results = [...this.backups];

    if (query.status !== undefined) {
      results = results.filter((b) => b.status === query.status);
    }

    if (query.source !== undefined) {
      results = results.filter((b) => b.metadata.source === query.source);
    }

    if (query.triggeredBy !== undefined) {
      results = results.filter((b) => b.metadata.triggeredBy === query.triggeredBy);
    }

    if (query.startTime !== undefined) {
      results = results.filter((b) => b.timestamp >= query.startTime!);
    }

    if (query.endTime !== undefined) {
      results = results.filter((b) => b.timestamp <= query.endTime!);
    }

    const totalCount = results.length;

    results.sort((a, b) => b.timestamp - a.timestamp);

    if (query.offset !== undefined && query.offset > 0) {
      results = results.slice(query.offset);
    }

    if (query.limit !== undefined && query.limit > 0) {
      results = results.slice(0, query.limit);
    }

    return {
      backups: results,
      totalCount,
    };
  }

  async deleteOlderThan(beforeTimestamp: number): Promise<number> {
    const beforeCount = this.backups.length;
    this.backups = this.backups.filter((b) => b.timestamp >= beforeTimestamp);
    return beforeCount - this.backups.length;
  }

  async delete(id: string): Promise<void> {
    const index = this.backups.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error(`Backup with id '${id}' not found`);
    }
    this.backups.splice(index, 1);
  }

  async restore(id: string): Promise<RestoreResult> {
    const backup = await this.findById(id);
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
  }

  async findLatestCompleted(): Promise<Backup | null> {
    const completed = this.backups.filter((b) => b.status === "completed");
    if (completed.length === 0) {
      return null;
    }

    completed.sort((a, b) => b.timestamp - a.timestamp);
    return completed[0];
  }

  async count(
    query: Omit<BackupQuery, "limit" | "offset">,
  ): Promise<number> {
    const result = await this.query(query);
    return result.totalCount;
  }

  async getTotalSize(): Promise<number> {
    return this.backups.reduce((total, b) => total + b.size, 0);
  }

  /**
   * Clears all backups from the repository.
   * Useful for testing scenarios.
   */
  clear(): void {
    this.backups = [];
  }

  /**
   * Returns the current number of backups stored.
   */
  size(): number {
    return this.backups.length;
  }
}
