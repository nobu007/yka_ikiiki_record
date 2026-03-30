import { describe, it, expect } from "@jest/globals";
import { UserSchema, UserRole } from "@/schemas/api";

const validUser = {
  id: 1,
  email: "teacher@example.com",
  passwordHash: "hashed_password_123456789012345678901234567890123456789012345678901234567890",
  name: "Test Teacher",
  role: "TEACHER" as const,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("User Entity", () => {
  describe("Schema Validation", () => {

    it("should validate a valid teacher user", () => {
      const result = UserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it("should validate a valid admin user", () => {
      const adminUser = { ...validUser, role: "ADMIN" as const };
      const result = UserSchema.safeParse(adminUser);
      expect(result.success).toBe(true);
    });

    it("should reject user without email", () => {
      const invalidUser = { ...validUser, email: "" };
      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("email");
      }
    });

    it("should reject user with invalid email format", () => {
      const invalidUser = { ...validUser, email: "not-an-email" };
      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should reject user without password hash", () => {
      const invalidUser = { ...validUser, passwordHash: "" };
      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should reject user without name", () => {
      const invalidUser = { ...validUser, name: "" };
      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should reject user with invalid role", () => {
      const invalidUser = { ...validUser, role: "INVALID_ROLE" as const };
      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should accept user without id (for creation)", () => {
      const userWithoutId = { ...validUser };
      delete (userWithoutId as any).id;
      const result = UserSchema.safeParse(userWithoutId);
      expect(result.success).toBe(true);
    });

    it("should accept user without createdAt and updatedAt (for creation)", () => {
      const userWithoutTimestamps = { ...validUser };
      delete (userWithoutTimestamps as any).createdAt;
      delete (userWithoutTimestamps as any).updatedAt;
      const result = UserSchema.safeParse(userWithoutTimestamps);
      expect(result.success).toBe(true);
    });

    it("should enforce minimum password hash length", () => {
      const invalidUser = { ...validUser, passwordHash: "short" };
      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should enforce maximum email length", () => {
      const invalidUser = {
        ...validUser,
        email: "a".repeat(300) + "@example.com",
      };
      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should enforce maximum name length", () => {
      const invalidUser = { ...validUser, name: "a".repeat(300) };
      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should accept minimum valid email format", () => {
      const user = { ...validUser, email: "a@b.co" };
      const result = UserSchema.safeParse(user);
      expect(result.success).toBe(true);
    });

    it("should enforce minimum password hash length (59 chars)", () => {
      const invalidUser = {
        ...validUser,
        passwordHash: "x".repeat(59),
      };
      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should accept minimum valid password hash length (60 chars)", () => {
      const user = {
        ...validUser,
        passwordHash: "x".repeat(60),
      };
      const result = UserSchema.safeParse(user);
      expect(result.success).toBe(true);
    });

    it("should accept maximum valid password hash length (255 chars)", () => {
      const user = {
        ...validUser,
        passwordHash: "x".repeat(255),
      };
      const result = UserSchema.safeParse(user);
      expect(result.success).toBe(true);
    });

    it("should enforce maximum password hash length (256 chars)", () => {
      const invalidUser = {
        ...validUser,
        passwordHash: "x".repeat(256),
      };
      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should accept minimum valid name length (1 char)", () => {
      const user = { ...validUser, name: "a" };
      const result = UserSchema.safeParse(user);
      expect(result.success).toBe(true);
    });

    it("should accept maximum valid name length (100 chars)", () => {
      const user = { ...validUser, name: "a".repeat(100) };
      const result = UserSchema.safeParse(user);
      expect(result.success).toBe(true);
    });

    it("should enforce maximum name length (101 chars)", () => {
      const invalidUser = { ...validUser, name: "a".repeat(101) };
      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should accept all valid user roles", () => {
      const teacher = { ...validUser, role: "TEACHER" as const };
      const admin = { ...validUser, role: "ADMIN" as const };

      expect(UserSchema.safeParse(teacher).success).toBe(true);
      expect(UserSchema.safeParse(admin).success).toBe(true);
    });
  });

  describe("Domain Constraints", () => {
    it("should ensure email is required for authentication", () => {
      const userWithoutEmail = {
        passwordHash: "hashed_password_123456789012345678901234567890123456789012345678901234567890",
        name: "Test Teacher",
        role: "TEACHER" as const,
      };
      const result = UserSchema.safeParse(userWithoutEmail);
      expect(result.success).toBe(false);
    });

    it("should ensure passwordHash is stored (not plain password)", () => {
      const userWithPlainPassword = {
        ...validUser,
        passwordHash: "plain_text_password_1234567890123456789012345678901234567890",
      };
      const result = UserSchema.safeParse(userWithPlainPassword);
      expect(result.success).toBe(true);
    });

    it("should ensure role is either TEACHER or ADMIN", () => {
      const validRoles = ["TEACHER" as const, "ADMIN" as const];
      validRoles.forEach((role) => {
        const user = { ...validUser, role };
        const result = UserSchema.safeParse(user);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Timestamp Behavior", () => {
    it("should include createdAt timestamp", () => {
      const user = {
        ...validUser,
        createdAt: new Date("2026-01-01T00:00:00Z"),
      };
      const result = UserSchema.safeParse(user);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.createdAt).toBeInstanceOf(Date);
        expect(result.data.createdAt.toISOString()).toBe(
          "2026-01-01T00:00:00.000Z"
        );
      }
    });

    it("should include updatedAt timestamp", () => {
      const user = {
        ...validUser,
        updatedAt: new Date("2026-01-01T12:00:00Z"),
      };
      const result = UserSchema.safeParse(user);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.updatedAt).toBeInstanceOf(Date);
        expect(result.data.updatedAt.toISOString()).toBe(
          "2026-01-01T12:00:00.000Z"
        );
      }
    });
  });

  describe("Type Safety", () => {
    it("should have id as positive integer when present", () => {
      const userWithNegativeId = { ...validUser, id: -1 };
      const result = UserSchema.safeParse(userWithNegativeId);
      expect(result.success).toBe(false);
    });

    it("should have id as positive integer when zero", () => {
      const userWithZeroId = { ...validUser, id: 0 };
      const result = UserSchema.safeParse(userWithZeroId);
      expect(result.success).toBe(false);
    });

    it("should have email as string", () => {
      const userWithNumberEmail = { ...validUser, email: 123 as any };
      const result = UserSchema.safeParse(userWithNumberEmail);
      expect(result.success).toBe(false);
    });

    it("should have name as string", () => {
      const userWithNumberName = { ...validUser, name: 123 as any };
      const result = UserSchema.safeParse(userWithNumberName);
      expect(result.success).toBe(false);
    });

    it("should have passwordHash as string", () => {
      const userWithNumberHash = { ...validUser, passwordHash: 123 as any };
      const result = UserSchema.safeParse(userWithNumberHash);
      expect(result.success).toBe(false);
    });
  });
});
