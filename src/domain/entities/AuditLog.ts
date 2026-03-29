/**
 * Domain entity representing an audit log entry for tracking data mutations.
 *
 * Captures all create/update/delete operations on domain entities with
 * full context for compliance, debugging, and data integrity verification.
 *
 * @example
 * ```ts
 * const auditLog: AuditLog = {
 *   id: "audit-123",
 *   timestamp: Date.now(),
 *   entityType: "Record",
 *   entityId: "record-456",
 *   operation: "create",
 *   actor: "system",
 *   changes: { before: null, after: recordData },
 *   metadata: { source: "api_seed" }
 * };
 * ```
 */

export type AuditOperation = "create" | "update" | "delete";

export interface AuditLog {
  /** Unique identifier for this audit entry */
  id: string;

  /** Unix timestamp in milliseconds when the operation occurred */
  timestamp: number;

  /** Type of entity that was modified (e.g., "Record", "Stats") */
  entityType: string;

  /** Unique identifier of the entity that was modified */
  entityId: string;

  /** Type of operation performed */
  operation: AuditOperation;

  /** Identifier of the actor who performed the operation (user ID or "system") */
  actor: string;

  /** State changes: before and after snapshots */
  changes: {
    /** Entity state before the operation (null for create) */
    before: Record<string, unknown> | null;

    /** Entity state after the operation (null for delete) */
    after: Record<string, unknown> | null;
  };

  /** Additional context about the operation */
  metadata: {
    /** Source of the operation (e.g., "api", "seed", "migration") */
    source: string;

    /** IP address of the requestor (if applicable) */
    ipAddress?: string;

    /** User agent of the requestor (if applicable) */
    userAgent?: string;

    /** Correlation ID for tracking related operations */
    correlationId?: string;

    /** Additional custom metadata */
    [key: string]: unknown;
  };
}

/**
 * Factory function to create an AuditLog entry for a create operation.
 */
export function createAuditLogForCreate(
  entityType: string,
  entityId: string,
  after: Record<string, unknown>,
  metadata: AuditLog["metadata"],
  actor: string = "system",
): AuditLog {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    entityType,
    entityId,
    operation: "create",
    actor,
    changes: {
      before: null,
      after,
    },
    metadata,
  };
}

/**
 * Factory function to create an AuditLog entry for an update operation.
 */
export function createAuditLogForUpdate(
  entityType: string,
  entityId: string,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  metadata: AuditLog["metadata"],
  actor: string = "system",
): AuditLog {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    entityType,
    entityId,
    operation: "update",
    actor,
    changes: {
      before,
      after,
    },
    metadata,
  };
}

/**
 * Factory function to create an AuditLog entry for a delete operation.
 */
export function createAuditLogForDelete(
  entityType: string,
  entityId: string,
  before: Record<string, unknown>,
  metadata: AuditLog["metadata"],
  actor: string = "system",
): AuditLog {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    entityType,
    entityId,
    operation: "delete",
    actor,
    changes: {
      before,
      after: null,
    },
    metadata,
  };
}
