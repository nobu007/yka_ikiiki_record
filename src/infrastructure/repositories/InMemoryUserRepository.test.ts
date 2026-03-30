import { describe, it, expect, beforeEach } from "@jest/globals";
import { InMemoryUserRepository } from "@/infrastructure/repositories/InMemoryUserRepository";
import { ValidationError } from "@/lib/error-handler";
import type { User } from "@/schemas/api";

describe("InMemoryUserRepository", () => {
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  describe("findByEmail", () => {
    it("should find user by email (case-insensitive)", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      await repository.save(user);

      const found = await repository.findByEmail("TEACHER@EXAMPLE.COM");
      expect(found).not.toBeNull();
      expect(found?.email).toBe("teacher@example.com");
    });

    it("should return null for non-existent email", async () => {
      const found = await repository.findByEmail("nonexistent@example.com");
      expect(found).toBeNull();
    });

    it("should return null for empty email", async () => {
      const found = await repository.findByEmail("");
      expect(found).toBeNull();
    });
  });

  describe("findById", () => {
    it("should find user by ID", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      const saved = await repository.save(user);
      expect(saved.id).toBeDefined();

      const found = await repository.findById(saved.id!);
      expect(found).not.toBeNull();
      expect(found?.email).toBe("teacher@example.com");
    });

    it("should return null for non-existent ID", async () => {
      const found = await repository.findById(999999);
      expect(found).toBeNull();
    });

    it("should return null for ID 0", async () => {
      const found = await repository.findById(0);
      expect(found).toBeNull();
    });

    it("should return null for negative ID", async () => {
      const found = await repository.findById(-1);
      expect(found).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      const user1: User = {
        email: "teacher1@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      const user2: User = {
        email: "admin@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "システム管理者",
        role: "ADMIN",
      };

      await repository.save(user1);
      await repository.save(user2);

      const all = await repository.findAll();
      expect(all).toHaveLength(2);
    });

    it("should return empty array when no users exist", async () => {
      const all = await repository.findAll();
      expect(all).toHaveLength(0);
    });
  });

  describe("findByRole", () => {
    beforeEach(async () => {
      const teacher1: User = {
        email: "teacher1@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      const teacher2: User = {
        email: "teacher2@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "鈴木先生",
        role: "TEACHER",
      };

      const admin: User = {
        email: "admin@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "システム管理者",
        role: "ADMIN",
      };

      await repository.save(teacher1);
      await repository.save(teacher2);
      await repository.save(admin);
    });

    it("should find users by TEACHER role", async () => {
      const teachers = await repository.findByRole("TEACHER");
      expect(teachers).toHaveLength(2);
      expect(teachers.every((u) => u.role === "TEACHER")).toBe(true);
    });

    it("should find users by ADMIN role", async () => {
      const admins = await repository.findByRole("ADMIN");
      expect(admins).toHaveLength(1);
      expect(admins[0]?.role).toBe("ADMIN");
    });

    it("should return empty array for role with no users", async () => {
      await repository.disconnect();
      const users = await repository.findByRole("TEACHER");
      expect(users).toHaveLength(0);
    });
  });

  describe("save", () => {
    it("should create new user without ID", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      const saved = await repository.save(user);

      expect(saved.id).toBeDefined();
      expect(saved.id).toBeGreaterThan(0);
      expect(saved.createdAt).toBeDefined();
      expect(saved.updatedAt).toBeDefined();
      expect(saved.email).toBe("teacher@example.com");
    });

    it("should assign sequential IDs", async () => {
      const user1: User = {
        email: "teacher1@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      const user2: User = {
        email: "teacher2@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "鈴木先生",
        role: "TEACHER",
      };

      const saved1 = await repository.save(user1);
      const saved2 = await repository.save(user2);

      expect(saved2.id).toBe(saved1.id! + 1);
    });

    it("should update existing user with ID", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      const saved = await repository.save(user);

      // Add small delay to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 2));

      const updated: User = {
        ...saved,
        name: "田中先生（更新）",
      };

      const result = await repository.save(updated);

      expect(result.id).toBe(saved.id);
      expect(result.name).toBe("田中先生（更新）");
      expect(result.createdAt).toEqual(saved.createdAt);
      expect(result.updatedAt).not.toEqual(saved.updatedAt);
      expect(result.updatedAt.getTime()).toBeGreaterThan(saved.updatedAt.getTime());
    });

    it("should reject invalid email", async () => {
      const user: User = {
        email: "",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      await expect(repository.save(user)).rejects.toThrow(ValidationError);
    });

    it("should reject password hash less than 60 characters", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "a".repeat(59),
        name: "田中先生",
        role: "TEACHER",
      };

      await expect(repository.save(user)).rejects.toThrow(ValidationError);
    });

    it("should reject password hash greater than 255 characters", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "a".repeat(256),
        name: "田中先生",
        role: "TEACHER",
      };

      await expect(repository.save(user)).rejects.toThrow(ValidationError);
    });

    it("should reject empty name", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "",
        role: "TEACHER",
      };

      await expect(repository.save(user)).rejects.toThrow(ValidationError);
    });

    it("should reject name greater than 100 characters", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "a".repeat(101),
        role: "TEACHER",
      };

      await expect(repository.save(user)).rejects.toThrow(ValidationError);
    });

    it("should reject invalid role", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "INVALID" as "TEACHER" | "ADMIN",
      };

      await expect(repository.save(user)).rejects.toThrow(ValidationError);
    });

    it("should reject email greater than 255 characters", async () => {
      const user: User = {
        email: "a".repeat(250) + "@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      await expect(repository.save(user)).rejects.toThrow(ValidationError);
    });
  });

  describe("delete", () => {
    it("should delete user by ID", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      const saved = await repository.save(user);
      await repository.delete(saved.id!);

      const found = await repository.findById(saved.id!);
      expect(found).toBeNull();
    });

    it("should not throw when deleting non-existent ID", async () => {
      await expect(repository.delete(999999)).resolves.not.toThrow();
    });

    it("should decrement count after deletion", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      const saved = await repository.save(user);
      const countBefore = await repository.count();

      await repository.delete(saved.id!);
      const countAfter = await repository.count();

      expect(countAfter).toBe(countBefore - 1);
    });
  });

  describe("count", () => {
    it("should return 0 for empty repository", async () => {
      const count = await repository.count();
      expect(count).toBe(0);
    });

    it("should return correct count after adding users", async () => {
      const user1: User = {
        email: "teacher1@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      const user2: User = {
        email: "teacher2@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "鈴木先生",
        role: "TEACHER",
      };

      await repository.save(user1);
      await repository.save(user2);

      const count = await repository.count();
      expect(count).toBe(2);
    });

    it("should decrement count after deletion", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      const saved = await repository.save(user);
      await repository.delete(saved.id!);

      const count = await repository.count();
      expect(count).toBe(0);
    });
  });

  describe("emailExists", () => {
    it("should return true for existing email (case-insensitive)", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      await repository.save(user);

      const exists = await repository.emailExists("TEACHER@EXAMPLE.COM");
      expect(exists).toBe(true);
    });

    it("should return false for non-existent email", async () => {
      const exists = await repository.emailExists("nonexistent@example.com");
      expect(exists).toBe(false);
    });
  });

  describe("disconnect", () => {
    it("should clear all users", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      await repository.save(user);
      await repository.disconnect();

      const count = await repository.count();
      expect(count).toBe(0);
    });

    it("should reset ID counter", async () => {
      const user1: User = {
        email: "teacher1@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      await repository.save(user1);
      await repository.disconnect();

      const user2: User = {
        email: "teacher2@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "鈴木先生",
        role: "TEACHER",
      };

      const saved2 = await repository.save(user2);

      expect(saved2.id).toBe(1);
    });
  });

  describe("Repository Interface Compliance", () => {
    it("should implement all UserRepository methods", async () => {
      expect(repository.findByEmail).toBeDefined();
      expect(repository.findById).toBeDefined();
      expect(repository.findAll).toBeDefined();
      expect(repository.findByRole).toBeDefined();
      expect(repository.save).toBeDefined();
      expect(repository.delete).toBeDefined();
      expect(repository.count).toBeDefined();
      expect(repository.emailExists).toBeDefined();
      expect(repository.disconnect).toBeDefined();
    });

    it("should enforce data isolation between operations", async () => {
      const user1: User = {
        email: "teacher1@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      const user2: User = {
        email: "teacher2@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "鈴木先生",
        role: "TEACHER",
      };

      const saved1 = await repository.save(user1);
      const saved2 = await repository.save(user2);

      expect(saved1.id).not.toBe(saved2.id);
      expect(saved1.email).not.toBe(saved2.email);
    });
  });

  describe("Boundary Conditions", () => {
    it("should handle minimum valid name length", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田",
        role: "TEACHER",
      };

      const saved = await repository.save(user);
      expect(saved.name).toBe("田");
    });

    it("should handle maximum valid name length", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "a".repeat(100),
        role: "TEACHER",
      };

      const saved = await repository.save(user);
      expect(saved.name).toHaveLength(100);
    });

    it("should handle minimum valid password hash length", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "a".repeat(60),
        name: "田中先生",
        role: "TEACHER",
      };

      const saved = await repository.save(user);
      expect(saved.passwordHash).toHaveLength(60);
    });

    it("should handle maximum valid password hash length", async () => {
      const user: User = {
        email: "teacher@example.com",
        passwordHash: "a".repeat(255),
        name: "田中先生",
        role: "TEACHER",
      };

      const saved = await repository.save(user);
      expect(saved.passwordHash).toHaveLength(255);
    });

    it("should handle valid short email", async () => {
      const user: User = {
        email: "a@b.co",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      const saved = await repository.save(user);
      expect(saved.email).toBe("a@b.co");
    });
  });
});
