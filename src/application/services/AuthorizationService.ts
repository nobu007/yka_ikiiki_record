import type { UserRepository } from "@/domain/repositories/UserRepository";
import type { User, UserRole } from "@/schemas/api";

/**
 * Error thrown when authorization fails.
 */
export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Permission definition for role-based access control.
 *
 * Maps resource-action pairs to required roles.
 * This centralized permission system makes authorization
 * checks declarative and auditable.
 */
export interface Permission {
  /** Resource being accessed (e.g., "records", "users", "stats") */
  resource: string;

  /** Action being performed (e.g., "read", "write", "delete", "admin") */
  action: string;

  /** Minimum role required to perform this action */
  requiredRole: UserRole;
}

/**
 * Predefined permissions for the application.
 *
 * Permissions follow the principle of least privilege:
 * - TEACHER: Can manage classroom records and view stats
 * - ADMIN: Can do everything TEACHER can, plus manage users and system settings
 */
export const PERMISSIONS: Permission[] = [
  // Record management
  { resource: "records", action: "read", requiredRole: "TEACHER" },
  { resource: "records", action: "write", requiredRole: "TEACHER" },
  { resource: "records", action: "delete", requiredRole: "ADMIN" },

  // Statistics and analytics
  { resource: "stats", action: "read", requiredRole: "TEACHER" },

  // User management (admin only)
  { resource: "users", action: "read", requiredRole: "ADMIN" },
  { resource: "users", action: "write", requiredRole: "ADMIN" },
  { resource: "users", action: "delete", requiredRole: "ADMIN" },

  // System administration (admin only)
  { resource: "system", action: "admin", requiredRole: "ADMIN" },
];

/**
 * Application service for authorization checks.
 *
 * **Design Principles:**
 * - Single Responsibility: Only handles authorization logic
 * - Dependency Inversion: Depends on UserRepository interface
 * - Fail-Safe Defaults: Denies access by default, requires explicit permission
 *
 * **Role Hierarchy:**
 * - ADMIN > TEACHER (admins can do everything teachers can)
 * - No guest or anonymous access (all operations require authentication)
 *
 * @example
 * ```ts
 * const authService = new AuthorizationService(userRepository);
 *
 * // Check if user can delete a record
 * const canDelete = await authService.canDeleteRecord(user.id);
 * if (!canDelete) {
 *   throw new AuthorizationError("Insufficient permissions");
 * }
 *
 * // Verify and throw if not authorized
 * await authService.requireRole(user.id, "ADMIN");
 * ```
 */
export class AuthorizationService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Checks if a user has a specific role.
   *
   * @param userId - User ID to check.
   * @param role - Role to verify.
   * @returns Promise resolving to true if user has the role.
   *
   * @example
   * ```ts
   * const isAdmin = await authService.hasRole(userId, "ADMIN");
   * if (isAdmin) {
   *   // Show admin panel
   * }
   * ```
   */
  async hasRole(userId: number, role: UserRole): Promise<boolean> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return false;
    }

    return user.role === role;
  }

  /**
   * Checks if a user has at least the specified role level.
   *
   * Role hierarchy: ADMIN > TEACHER
   *
   * @param userId - User ID to check.
   * @param minRole - Minimum role required.
   * @returns Promise resolving to true if user has at least the minRole.
   *
   * @example
   * ```ts
   * // User is ADMIN, minRole is TEACHER → returns true
   * const canView = await authService.hasAtLeastRole(userId, "TEACHER");
   * ```
   */
  async hasAtLeastRole(userId: number, minRole: UserRole): Promise<boolean> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return false;
    }

    if (user.role === "ADMIN") {
      return true;
    }

    return user.role === minRole;
  }

  /**
   * Throws an error if the user does not have the specified role.
   *
   * Use this method to enforce role-based access control at application layer.
   *
   * @param userId - User ID to check.
   * @param role - Required role.
   * @throws AuthorizationError if user does not have the role.
   *
   * @example
   * ```ts
   * async function deleteUser(userId: number, requesterId: number) {
   *   await authService.requireRole(requesterId, "ADMIN");
   *   // ... proceed with deletion
   * }
   * ```
   */
  async requireRole(userId: number, role: UserRole): Promise<void> {
    const hasRole = await this.hasRole(userId, role);

    if (!hasRole) {
      throw new AuthorizationError(
        `User ${userId} does not have required role: ${role}`,
      );
    }
  }

  /**
   * Throws an error if the user does not have at least the specified role level.
   *
   * @param userId - User ID to check.
   * @param minRole - Minimum required role.
   * @throws AuthorizationError if user does not have at least the minRole.
   *
   * @example
   * ```ts
   * async function viewStats(userId: number) {
   *   await authService.requireAtLeastRole(userId, "TEACHER");
   *   // ... proceed with stats retrieval
   * }
   * ```
   */
  async requireAtLeastRole(userId: number, minRole: UserRole): Promise<void> {
    const hasRole = await this.hasAtLeastRole(userId, minRole);

    if (!hasRole) {
      throw new AuthorizationError(
        `User ${userId} does not have required role level: ${minRole}`,
      );
    }
  }

  /**
   * Checks if a user can perform a specific action on a resource.
   *
   * Uses the predefined PERMISSIONS table to look up required roles.
   *
   * @param userId - User ID to check.
   * @param resource - Resource being accessed.
   * @param action - Action being performed.
   * @returns Promise resolving to true if user is authorized.
   *
   * @example
   * ```ts
   * const canDelete = await authService.can(userId, "records", "delete");
   * if (!canDelete) {
   *   return res.status(403).json({ error: "Forbidden" });
   * }
   * ```
   */
  async can(
    userId: number,
    resource: string,
    action: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return false;
    }

    const permission = PERMISSIONS.find(
      (p) => p.resource === resource && p.action === action,
    );

    if (!permission) {
      // Deny by default for undefined permissions
      return false;
    }

    return this.hasAtLeastRole(userId, permission.requiredRole);
  }

  /**
   * Throws an error if the user cannot perform the specified action.
   *
   * Use this method to enforce permission-based access control.
   *
   * @param userId - User ID to check.
   * @param resource - Resource being accessed.
   * @param action - Action being performed.
   * @throws AuthorizationError if user is not authorized.
   *
   * @example
   * ```ts
   * async function deleteRecord(recordId: number, userId: number) {
   *   await authService.require(userId, "records", "delete");
   *   // ... proceed with deletion
   * }
   * ```
   */
  async require(
    userId: number,
    resource: string,
    action: string,
  ): Promise<void> {
    const authorized = await this.can(userId, resource, action);

    if (!authorized) {
      throw new AuthorizationError(
        `User ${userId} is not authorized to ${action} on ${resource}`,
      );
    }
  }

  /**
   * Checks if a user can read records.
   *
   * @param userId - User ID to check.
   * @returns Promise resolving to true if user can read records.
   */
  async canReadRecords(userId: number): Promise<boolean> {
    return this.can(userId, "records", "read");
  }

  /**
   * Checks if a user can write (create/update) records.
   *
   * @param userId - User ID to check.
   * @returns Promise resolving to true if user can write records.
   */
  async canWriteRecords(userId: number): Promise<boolean> {
    return this.can(userId, "records", "write");
  }

  /**
   * Checks if a user can delete records.
   *
   * @param userId - User ID to check.
   * @returns Promise resolving to true if user can delete records.
   */
  async canDeleteRecords(userId: number): Promise<boolean> {
    return this.can(userId, "records", "delete");
  }

  /**
   * Checks if a user can read stats.
   *
   * @param userId - User ID to check.
   * @returns Promise resolving to true if user can read stats.
   */
  async canReadStats(userId: number): Promise<boolean> {
    return this.can(userId, "stats", "read");
  }

  /**
   * Checks if a user can manage users.
   *
   * @param userId - User ID to check.
   * @returns Promise resolving to true if user can manage users.
   */
  async canManageUsers(userId: number): Promise<boolean> {
    return this.can(userId, "users", "write");
  }

  /**
   * Checks if a user is an administrator.
   *
   * @param userId - User ID to check.
   * @returns Promise resolving to true if user is an admin.
   */
  async isAdmin(userId: number): Promise<boolean> {
    return this.hasRole(userId, "ADMIN");
  }

  /**
   * Checks if a user is a teacher (not admin).
   *
   * @param userId - User ID to check.
   * @returns Promise resolving to true if user is a teacher.
   */
  async isTeacher(userId: number): Promise<boolean> {
    return this.hasRole(userId, "TEACHER");
  }
}
