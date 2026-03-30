import { describe, it, expect, beforeEach } from "@jest/globals";
import { AuthorizationService, AuthorizationError, PERMISSIONS } from "@/application/services/AuthorizationService";
import type { UserRepository } from "@/domain/repositories/UserRepository";
import type { User } from "@/schemas/api";

/**
 * Mock implementation of UserRepository for testing.
 */
class MockUserRepository implements UserRepository {
  private users: Map<number, User> = new Map();

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  async findById(id: number): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async findByRole(role: "TEACHER" | "ADMIN"): Promise<User[]> {
    return Array.from(this.users.values()).filter((u) => u.role === role);
  }

  async save(user: User): Promise<User> {
    if (user.id !== undefined) {
      this.users.set(user.id, user);
      return user;
    }
    const newId = this.users.size + 1;
    const newUser = { ...user, id: newId };
    this.users.set(newId, newUser);
    return newUser;
  }

  async delete(id: number): Promise<void> {
    this.users.delete(id);
  }

  async count(): Promise<number> {
    return this.users.size;
  }

  async emailExists(email: string): Promise<boolean> {
    return (await this.findByEmail(email)) !== null;
  }

  async disconnect(): Promise<void> {
    this.users.clear();
  }

  // Helper method for test setup
  addUser(user: User): void {
    if (user.id !== undefined) {
      this.users.set(user.id, user);
    }
  }
}

describe("AuthorizationService", () => {
  let authService: AuthorizationService;
  let mockRepo: MockUserRepository;
  let teacherUser: User;
  let adminUser: User;

  beforeEach(() => {
    mockRepo = new MockUserRepository();
    authService = new AuthorizationService(mockRepo);

    teacherUser = {
      id: 1,
      email: "teacher@example.com",
      passwordHash: "$2b$10$hash",
      name: "田中先生",
      role: "TEACHER",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    adminUser = {
      id: 2,
      email: "admin@example.com",
      passwordHash: "$2b$10$hash",
      name: "システム管理者",
      role: "ADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepo.addUser(teacherUser);
    mockRepo.addUser(adminUser);
  });

  describe("hasRole", () => {
    it("should return true for teacher with TEACHER role", async () => {
      const result = await authService.hasRole(teacherUser.id, "TEACHER");
      expect(result).toBe(true);
    });

    it("should return false for teacher with ADMIN role", async () => {
      const result = await authService.hasRole(teacherUser.id, "ADMIN");
      expect(result).toBe(false);
    });

    it("should return true for admin with ADMIN role", async () => {
      const result = await authService.hasRole(adminUser.id, "ADMIN");
      expect(result).toBe(true);
    });

    it("should return false for admin with TEACHER role", async () => {
      const result = await authService.hasRole(adminUser.id, "TEACHER");
      expect(result).toBe(false);
    });

    it("should return false for non-existent user", async () => {
      const result = await authService.hasRole(999, "TEACHER");
      expect(result).toBe(false);
    });

    it("should return false for user ID 0", async () => {
      const result = await authService.hasRole(0, "TEACHER");
      expect(result).toBe(false);
    });

    it("should return false for negative user ID", async () => {
      const result = await authService.hasRole(-1, "TEACHER");
      expect(result).toBe(false);
    });
  });

  describe("hasAtLeastRole", () => {
    it("should return true for teacher checking TEACHER role", async () => {
      const result = await authService.hasAtLeastRole(teacherUser.id, "TEACHER");
      expect(result).toBe(true);
    });

    it("should return false for teacher checking ADMIN role", async () => {
      const result = await authService.hasAtLeastRole(teacherUser.id, "ADMIN");
      expect(result).toBe(false);
    });

    it("should return true for admin checking ADMIN role", async () => {
      const result = await authService.hasAtLeastRole(adminUser.id, "ADMIN");
      expect(result).toBe(true);
    });

    it("should return true for admin checking TEACHER role (admin > teacher)", async () => {
      const result = await authService.hasAtLeastRole(adminUser.id, "TEACHER");
      expect(result).toBe(true);
    });

    it("should return false for non-existent user", async () => {
      const result = await authService.hasAtLeastRole(999, "TEACHER");
      expect(result).toBe(false);
    });
  });

  describe("requireRole", () => {
    it("should not throw when user has required role", async () => {
      await expect(
        authService.requireRole(teacherUser.id, "TEACHER"),
      ).resolves.not.toThrow();
    });

    it("should throw when user lacks required role", async () => {
      await expect(
        authService.requireRole(teacherUser.id, "ADMIN"),
      ).rejects.toThrow(AuthorizationError);
    });

    it("should throw AuthorizationError with correct message", async () => {
      await expect(authService.requireRole(teacherUser.id, "ADMIN")).rejects.toThrow(
        "User 1 does not have required role: ADMIN",
      );
    });

    it("should throw for non-existent user", async () => {
      await expect(
        authService.requireRole(999, "TEACHER"),
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("requireAtLeastRole", () => {
    it("should not throw when teacher checks TEACHER role", async () => {
      await expect(
        authService.requireAtLeastRole(teacherUser.id, "TEACHER"),
      ).resolves.not.toThrow();
    });

    it("should throw when teacher checks ADMIN role", async () => {
      await expect(
        authService.requireAtLeastRole(teacherUser.id, "ADMIN"),
      ).rejects.toThrow(AuthorizationError);
    });

    it("should not throw when admin checks ADMIN role", async () => {
      await expect(
        authService.requireAtLeastRole(adminUser.id, "ADMIN"),
      ).resolves.not.toThrow();
    });

    it("should not throw when admin checks TEACHER role (admin > teacher)", async () => {
      await expect(
        authService.requireAtLeastRole(adminUser.id, "TEACHER"),
      ).resolves.not.toThrow();
    });

    it("should throw for non-existent user", async () => {
      await expect(
        authService.requireAtLeastRole(999, "TEACHER"),
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("can", () => {
    it("should return true for teacher reading records", async () => {
      const result = await authService.can(teacherUser.id, "records", "read");
      expect(result).toBe(true);
    });

    it("should return true for teacher writing records", async () => {
      const result = await authService.can(teacherUser.id, "records", "write");
      expect(result).toBe(true);
    });

    it("should return false for teacher deleting records (admin only)", async () => {
      const result = await authService.can(teacherUser.id, "records", "delete");
      expect(result).toBe(false);
    });

    it("should return true for admin deleting records", async () => {
      const result = await authService.can(adminUser.id, "records", "delete");
      expect(result).toBe(true);
    });

    it("should return true for teacher reading stats", async () => {
      const result = await authService.can(teacherUser.id, "stats", "read");
      expect(result).toBe(true);
    });

    it("should return false for teacher managing users (admin only)", async () => {
      const result = await authService.can(teacherUser.id, "users", "write");
      expect(result).toBe(false);
    });

    it("should return true for admin managing users", async () => {
      const result = await authService.can(adminUser.id, "users", "write");
      expect(result).toBe(true);
    });

    it("should return false for undefined resource-action (fail closed)", async () => {
      const result = await authService.can(adminUser.id, "undefined_resource", "undefined_action");
      expect(result).toBe(false);
    });

    it("should return false for non-existent user", async () => {
      const result = await authService.can(999, "records", "read");
      expect(result).toBe(false);
    });
  });

  describe("require", () => {
    it("should not throw when user has permission", async () => {
      await expect(
        authService.require(teacherUser.id, "records", "read"),
      ).resolves.not.toThrow();
    });

    it("should throw when user lacks permission", async () => {
      await expect(
        authService.require(teacherUser.id, "records", "delete"),
      ).rejects.toThrow(AuthorizationError);
    });

    it("should throw AuthorizationError with correct message", async () => {
      await expect(
        authService.require(teacherUser.id, "users", "write"),
      ).rejects.toThrow("User 1 is not authorized to write on users");
    });

    it("should throw for undefined permission (fail closed)", async () => {
      await expect(
        authService.require(adminUser.id, "undefined_resource", "undefined_action"),
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("Convenience Methods - Records", () => {
    it("canReadRecords should return true for teacher", async () => {
      const result = await authService.canReadRecords(teacherUser.id);
      expect(result).toBe(true);
    });

    it("canReadRecords should return true for admin", async () => {
      const result = await authService.canReadRecords(adminUser.id);
      expect(result).toBe(true);
    });

    it("canWriteRecords should return true for teacher", async () => {
      const result = await authService.canWriteRecords(teacherUser.id);
      expect(result).toBe(true);
    });

    it("canWriteRecords should return true for admin", async () => {
      const result = await authService.canWriteRecords(adminUser.id);
      expect(result).toBe(true);
    });

    it("canDeleteRecords should return false for teacher", async () => {
      const result = await authService.canDeleteRecords(teacherUser.id);
      expect(result).toBe(false);
    });

    it("canDeleteRecords should return true for admin", async () => {
      const result = await authService.canDeleteRecords(adminUser.id);
      expect(result).toBe(true);
    });
  });

  describe("Convenience Methods - Stats", () => {
    it("canReadStats should return true for teacher", async () => {
      const result = await authService.canReadStats(teacherUser.id);
      expect(result).toBe(true);
    });

    it("canReadStats should return true for admin", async () => {
      const result = await authService.canReadStats(adminUser.id);
      expect(result).toBe(true);
    });
  });

  describe("Convenience Methods - Users", () => {
    it("canManageUsers should return false for teacher", async () => {
      const result = await authService.canManageUsers(teacherUser.id);
      expect(result).toBe(false);
    });

    it("canManageUsers should return true for admin", async () => {
      const result = await authService.canManageUsers(adminUser.id);
      expect(result).toBe(true);
    });
  });

  describe("Convenience Methods - Role Checks", () => {
    it("isAdmin should return false for teacher", async () => {
      const result = await authService.isAdmin(teacherUser.id);
      expect(result).toBe(false);
    });

    it("isAdmin should return true for admin", async () => {
      const result = await authService.isAdmin(adminUser.id);
      expect(result).toBe(true);
    });

    it("isTeacher should return true for teacher", async () => {
      const result = await authService.isTeacher(teacherUser.id);
      expect(result).toBe(true);
    });

    it("isTeacher should return false for admin", async () => {
      const result = await authService.isTeacher(adminUser.id);
      expect(result).toBe(false);
    });

    it("isAdmin should return false for non-existent user", async () => {
      const result = await authService.isAdmin(999);
      expect(result).toBe(false);
    });

    it("isTeacher should return false for non-existent user", async () => {
      const result = await authService.isTeacher(999);
      expect(result).toBe(false);
    });
  });

  describe("AuthorizationError", () => {
    it("should create error with correct name", () => {
      const error = new AuthorizationError("Test error");
      expect(error.name).toBe("AuthorizationError");
      expect(error.message).toBe("Test error");
    });

    it("should be instanceof Error", () => {
      const error = new AuthorizationError("Test error");
      expect(error instanceof Error).toBe(true);
    });

    it("should be instanceof AuthorizationError", () => {
      const error = new AuthorizationError("Test error");
      expect(error instanceof AuthorizationError).toBe(true);
    });
  });

  describe("Permission Constants", () => {
    it("should have records read permission for TEACHER", () => {
      const permission = PERMISSIONS.find(
        (p) => p.resource === "records" && p.action === "read",
      );
      expect(permission?.requiredRole).toBe("TEACHER");
    });

    it("should have records write permission for TEACHER", () => {
      const permission = PERMISSIONS.find(
        (p) => p.resource === "records" && p.action === "write",
      );
      expect(permission?.requiredRole).toBe("TEACHER");
    });

    it("should have records delete permission for ADMIN", () => {
      const permission = PERMISSIONS.find(
        (p) => p.resource === "records" && p.action === "delete",
      );
      expect(permission?.requiredRole).toBe("ADMIN");
    });

    it("should have users write permission for ADMIN", () => {
      const permission = PERMISSIONS.find(
        (p) => p.resource === "users" && p.action === "write",
      );
      expect(permission?.requiredRole).toBe("ADMIN");
    });

    it("should have system admin permission for ADMIN", () => {
      const permission = PERMISSIONS.find(
        (p) => p.resource === "system" && p.action === "admin",
      );
      expect(permission?.requiredRole).toBe("ADMIN");
    });
  });

  describe("Edge Cases and Boundary Conditions", () => {
    it("should handle role hierarchy correctly for all permissions", async () => {
      // Admin should have access to all permissions
      for (const permission of PERMISSIONS) {
        const result = await authService.can(
          adminUser.id,
          permission.resource,
          permission.action,
        );
        expect(result).toBe(true);
      }
    });

    it("should deny teacher access to admin-only permissions", async () => {
      const adminPermissions = PERMISSIONS.filter(
        (p) => p.requiredRole === "ADMIN",
      );

      for (const permission of adminPermissions) {
        const result = await authService.can(
          teacherUser.id,
          permission.resource,
          permission.action,
        );
        expect(result).toBe(false);
      }
    });

    it("should allow teacher access to teacher-level permissions", async () => {
      const teacherPermissions = PERMISSIONS.filter(
        (p) => p.requiredRole === "TEACHER",
      );

      for (const permission of teacherPermissions) {
        const result = await authService.can(
          teacherUser.id,
          permission.resource,
          permission.action,
        );
        expect(result).toBe(true);
      }
    });

    it("should handle case-sensitive resource and action names", async () => {
      const result = await authService.can(teacherUser.id, "Records", "Read");
      expect(result).toBe(false); // Case-sensitive, should fail
    });

    it("should handle empty strings for resource and action", async () => {
      const result = await authService.can(teacherUser.id, "", "");
      expect(result).toBe(false);
    });
  });
});
