import type { AuditLogRepository } from "@/domain/repositories/AuditLogRepository";
import type { AuditLog, AuditLogMetadata } from "@/domain/entities/AuditLog";
import {
  createAuditLogForCreate,
  createAuditLogForUpdate,
  createAuditLogForDelete,
} from "@/domain/entities/AuditLog";
import type { AuditOperation } from "@/domain/entities/AuditLog";

/**
 * Application service for automatic audit logging.
 *
 * Provides a high-level interface for logging audit events,
 * wrapping the domain entity factory functions and repository operations.
 * This service acts as middleware, automatically capturing all data mutations
 * with full context for compliance, debugging, and data integrity verification.
 *
 * Design principles:
 * - Single Responsibility: Only handles audit log creation and persistence
 * - Dependency Inversion: Depends on AuditLogRepository interface, not concrete implementations
 * - Open/Closed: Open for extension (custom metadata), closed for modification
 *
 * @example
 * ```ts
 * const auditService = new AuditService(auditLogRepository);
 *
 * // Log a create operation
 * await auditService.logCreate("Record", "record-123", recordData, {
 *   source: "api",
 *   ipAddress: req.ip,
 *   userAgent: req.headers["user-agent"],
 * }, "user-456");
 *
 * // Log an update operation
 * await auditService.logUpdate("Record", "record-123", oldData, newData, {
 *   source: "api",
 *   correlationId: "corr-abc-123",
 * });
 *
 * // Log a delete operation
 * await auditService.logDelete("Record", "record-123", deletedData, {
 *   source: "admin",
 * }, "admin-user");
 * ```
 */
export class AuditService {
  /**
   * Creates a new AuditService instance.
   *
   * @param repository - AuditLogRepository implementation for persisting audit logs
   */
  constructor(private readonly repository: AuditLogRepository) {}

  /**
   * Logs a create operation.
   *
   * Use this method when a new entity is created in the system.
   * The `before` state will be null, and the `after` state will contain
   * the created entity data.
   *
   * @param entityType - Type of entity being created (e.g., "Record", "Stats")
   * @param entityId - Unique identifier of the created entity
   * @param after - Entity state after creation
   * @param metadata - Additional context about the operation
   * @param actor - Identifier of the actor performing the operation (default: "system")
   *
   * @throws Error if repository save operation fails
   *
   * @example
   * ```ts
   * await auditService.logCreate("Record", "record-123", {
   *   id: 1,
   *   student: "John Doe",
   *   date: "2026-03-30",
   * }, { source: "api" });
   * ```
   */
  async logCreate(
    entityType: string,
    entityId: string,
    after: Record<string, unknown>,
    metadata: AuditLogMetadata,
    actor: string = "system",
  ): Promise<void> {
    const auditLog = createAuditLogForCreate(
      entityType,
      entityId,
      after,
      metadata,
      actor,
    );
    await this.repository.save(auditLog);
  }

  /**
   * Logs an update operation.
   *
   * Use this method when an existing entity is modified in the system.
   * Both `before` and `after` states will be captured to show what changed.
   *
   * @param entityType - Type of entity being updated (e.g., "Record", "Stats")
   * @param entityId - Unique identifier of the updated entity
   * @param before - Entity state before update
   * @param after - Entity state after update
   * @param metadata - Additional context about the operation
   * @param actor - Identifier of the actor performing the operation (default: "system")
   *
   * @throws Error if repository save operation fails
   *
   * @example
   * ```ts
   * await auditService.logUpdate("Record", "record-123",
   *   { id: 1, comment: "Old comment" },
   *   { id: 1, comment: "New comment" },
   *   { source: "api", correlationId: "corr-abc-123" }
   * );
   * ```
   */
  async logUpdate(
    entityType: string,
    entityId: string,
    before: Record<string, unknown>,
    after: Record<string, unknown>,
    metadata: AuditLogMetadata,
    actor: string = "system",
  ): Promise<void> {
    const auditLog = createAuditLogForUpdate(
      entityType,
      entityId,
      before,
      after,
      metadata,
      actor,
    );
    await this.repository.save(auditLog);
  }

  /**
   * Logs a delete operation.
   *
   * Use this method when an entity is deleted from the system.
   * The `after` state will be null, and the `before` state will contain
   * the deleted entity data for audit trail purposes.
   *
   * @param entityType - Type of entity being deleted (e.g., "Record", "Stats")
   * @param entityId - Unique identifier of the deleted entity
   * @param before - Entity state before deletion
   * @param metadata - Additional context about the operation
   * @param actor - Identifier of the actor performing the operation (default: "system")
   *
   * @throws Error if repository save operation fails
   *
   * @example
   * ```ts
   * await auditService.logDelete("Record", "record-123",
   *   { id: 1, student: "John Doe", date: "2026-03-30" },
   *   { source: "admin" },
   *   "admin-user"
   * );
   * ```
   */
  async logDelete(
    entityType: string,
    entityId: string,
    before: Record<string, unknown>,
    metadata: AuditLogMetadata,
    actor: string = "system",
  ): Promise<void> {
    const auditLog = createAuditLogForDelete(
      entityType,
      entityId,
      before,
      metadata,
      actor,
    );
    await this.repository.save(auditLog);
  }

  /**
   * Logs a generic operation with explicit operation type.
   *
   * This is a low-level method that allows explicit control over the operation type.
   * In most cases, you should use the typed methods (logCreate, logUpdate, logDelete)
   * instead for better type safety and code clarity.
   *
   * @param operation - Type of operation (create, update, delete)
   * @param entityType - Type of entity being operated on
   * @param entityId - Unique identifier of the entity
   * @param before - Entity state before operation (null for create)
   * @param after - Entity state after operation (null for delete)
   * @param metadata - Additional context about the operation
   * @param actor - Identifier of the actor performing the operation (default: "system")
   *
   * @throws Error if repository save operation fails or operation type is invalid
   *
   * @example
   * ```ts
   * // Generic usage (not recommended - use typed methods instead)
   * await auditService.logOperation("create", "Record", "record-123",
   *   null,
   *   { id: 1, student: "John" },
   *   { source: "api" }
   * );
   * ```
   */
  async logOperation(
    operation: AuditOperation,
    entityType: string,
    entityId: string,
    before: Record<string, unknown> | null,
    after: Record<string, unknown> | null,
    metadata: AuditLogMetadata,
    actor: string = "system",
  ): Promise<void> {
    const auditLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      entityType,
      entityId,
      operation,
      actor,
      changes: {
        before,
        after,
      },
      metadata,
    };
    await this.repository.save(auditLog);
  }
}
