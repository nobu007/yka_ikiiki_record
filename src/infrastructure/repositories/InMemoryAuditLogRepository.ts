import type {
  AuditLog,
  AuditLogQuery,
  AuditLogQueryResult,
} from "../../domain/entities/AuditLog";
import type { AuditLogRepository } from "../../domain/repositories/AuditLogRepository";

/**
 * In-memory implementation of AuditLogRepository for development and testing.
 *
 * Stores audit logs in a JavaScript array, providing fast query operations
 * without requiring a database. Perfect for development environments and
 * automated testing scenarios.
 *
 * Thread-safety: Not thread-safe. Do not share across workers or threads.
 *
 * @example
 * ```ts
 * const repository = new InMemoryAuditLogRepository();
 * await repository.save(auditLog);
 * const results = await repository.query({ entityType: "Record" });
 * ```
 */
export class InMemoryAuditLogRepository implements AuditLogRepository {
  private logs: AuditLog[] = [];
  private idCounter = 0;

  async save(log: AuditLog): Promise<void> {
    this.logs.push(log);
  }

  async create(log: Omit<AuditLog, "id">): Promise<AuditLog> {
    const newLog: AuditLog = {
      ...log,
      id: `audit-${++this.idCounter}`,
    };
    this.logs.push(newLog);
    return newLog;
  }

  async findById(id: string): Promise<AuditLog | null> {
    return this.logs.find((log) => log.id === id) ?? null;
  }

  async query(query: AuditLogQuery): Promise<AuditLogQueryResult> {
    let results = [...this.logs];

    if (query.entityType !== undefined) {
      results = results.filter((log) => log.entityType === query.entityType);
    }

    if (query.entityId !== undefined) {
      results = results.filter((log) => log.entityId === query.entityId);
    }

    if (query.operation !== undefined) {
      results = results.filter((log) => log.operation === query.operation);
    }

    if (query.actor !== undefined) {
      results = results.filter((log) => log.actor === query.actor);
    }

    if (query.startTime !== undefined) {
      results = results.filter((log) => log.timestamp >= query.startTime!);
    }

    if (query.endTime !== undefined) {
      results = results.filter((log) => log.timestamp <= query.endTime!);
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
      logs: results,
      totalCount,
    };
  }

  async deleteOlderThan(beforeTimestamp: number): Promise<number> {
    const beforeCount = this.logs.length;
    this.logs = this.logs.filter((log) => log.timestamp >= beforeTimestamp);
    return beforeCount - this.logs.length;
  }

  async count(
    query: Omit<AuditLogQuery, "limit" | "offset">,
  ): Promise<number> {
    const result = await this.query(query);
    return result.totalCount;
  }

  /**
   * Clears all audit logs from the repository.
   * Useful for testing scenarios.
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Returns all audit logs.
   * This method is used by BackupService to backup audit logs.
   */
  async findAll(): Promise<AuditLog[]> {
    return [...this.logs];
  }

  /**
   * Returns the current number of audit logs stored.
   */
  size(): number {
    return this.logs.length;
  }
}
