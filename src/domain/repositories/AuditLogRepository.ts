import type { AuditLog, AuditOperation } from "../entities/AuditLog";

/**
 * Query options for filtering audit logs.
 */
export interface AuditLogQuery {
  /** Filter by entity type (e.g., "Record", "Stats") */
  entityType?: string;

  /** Filter by specific entity ID */
  entityId?: string;

  /** Filter by operation type */
  operation?: AuditOperation;

  /** Filter by actor (user ID or "system") */
  actor?: string;

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
export interface AuditLogQueryResult {
  /** Array of audit logs matching the query */
  logs: AuditLog[];

  /** Total count of logs matching the query (before limit/offset) */
  totalCount: number;
}

/**
 * Repository interface for audit log persistence and retrieval.
 *
 * Provides methods for storing audit logs and querying them by various criteria.
 * Implementations can use different storage backends (in-memory, database, etc.)
 * while maintaining a consistent interface for domain services.
 *
 * @example
 * ```ts
 * class InMemoryAuditLogRepository implements AuditLogRepository {
 *   private logs: AuditLog[] = [];
 *
 *   async save(log: AuditLog): Promise<void> {
 *     this.logs.push(log);
 *   }
 *
 *   async findById(id: string): Promise<AuditLog | null> {
 *     return this.logs.find(log => log.id === id) ?? null;
 *   }
 *
 *   async query(query: AuditLogQuery): Promise<AuditLogQueryResult> {
 *     let results = this.logs;
 *     // Apply filters...
 *     return { logs: results, totalCount: results.length };
 *   }
 * }
 * ```
 */
export interface AuditLogRepository {
  /**
   * Saves an audit log entry to the repository.
   *
   * @param log - AuditLog entry to store.
   * @returns Promise that resolves when save operation completes.
   */
  save(log: AuditLog): Promise<void>;

  /**
   * Retrieves an audit log entry by its unique identifier.
   *
   * @param id - Unique identifier of the audit log entry.
   * @returns Promise resolving to the AuditLog if found, null otherwise.
   */
  findById(id: string): Promise<AuditLog | null>;

  /**
   * Queries audit logs with optional filtering and pagination.
   *
   * All query parameters are optional and combined with AND logic.
   * Results are ordered by timestamp descending (most recent first).
   *
   * @param query - Query options for filtering and pagination.
   * @returns Promise resolving to query results with logs and total count.
   */
  query(query: AuditLogQuery): Promise<AuditLogQueryResult>;

  /**
   * Deletes audit logs older than the specified timestamp.
   *
   * Useful for implementing retention policies to prevent unlimited growth.
   *
   * @param beforeTimestamp - Delete logs with timestamp less than this value.
   * @returns Promise resolving to the number of logs deleted.
   */
  deleteOlderThan(beforeTimestamp: number): Promise<number>;

  /**
   * Counts audit logs matching the specified query.
   *
   * Useful for dashboards and monitoring.
   *
   * @param query - Query options for filtering (limit/offset ignored).
   * @returns Promise resolving to the count of matching logs.
   */
  count(query: Omit<AuditLogQuery, "limit" | "offset">): Promise<number>;
}
