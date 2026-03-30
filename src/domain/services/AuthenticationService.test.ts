import { AuthenticationService, AuthenticationError } from "./AuthenticationService";
import type { UserRepository } from "@/domain/repositories/UserRepository";
import type { User, UserRole } from "@/schemas/api";

describe("AuthenticationService", () => {
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPasswordHasher: jest.Mocked<
    AuthenticationService & {
      hash: (password: string) => Promise<string>;
      verify: (password: string, hash: string) => Promise<boolean>;
    }
  >;
  let mockTokenGenerator: jest.Mocked<
    AuthenticationService & {
      generateToken: (user: User) => Promise<string>;
    }
  >;
  let authService: AuthenticationService;

  const mockUser: User = {
    id: 1,
    email: "teacher@example.com",
    passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
    name: "John Doe",
    role: "TEACHER",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByRole: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      emailExists: jest.fn(),
      disconnect: jest.fn(),
    };

    mockPasswordHasher = {
      hash: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<
      AuthenticationService & {
        hash: (password: string) => Promise<string>;
        verify: (password: string, hash: string) => Promise<boolean>;
      }
    >;

    mockTokenGenerator = {
      generateToken: jest.fn(),
    } as unknown as jest.Mocked<
      AuthenticationService & {
        generateToken: (user: User) => Promise<string>;
      }
    >;

    authService = new AuthenticationService(
      mockUserRepository,
      mockPasswordHasher,
      mockTokenGenerator,
    );
  });

  describe("login", () => {
    it("should authenticate user with valid credentials", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.verify.mockResolvedValue(true);
      mockTokenGenerator.generateToken.mockResolvedValue("session-1-1234567890-abc123");

      const result = await authService.login("teacher@example.com", "password123");

      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe("session-1-1234567890-abc123");
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("teacher@example.com");
      expect(mockPasswordHasher.verify).toHaveBeenCalledWith(
        "password123",
        mockUser.passwordHash,
      );
      expect(mockTokenGenerator.generateToken).toHaveBeenCalledWith(mockUser);
    });

    it("should normalize email to lowercase", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.verify.mockResolvedValue(true);
      mockTokenGenerator.generateToken.mockResolvedValue("session-1-1234567890-abc123");

      await authService.login("TEACHER@EXAMPLE.COM", "password123");

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("teacher@example.com");
    });

    it("should trim whitespace from email", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.verify.mockResolvedValue(true);
      mockTokenGenerator.generateToken.mockResolvedValue("session-1-1234567890-abc123");

      await authService.login("  teacher@example.com  ", "password123");

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("teacher@example.com");
    });

    it("should throw AuthenticationError if email not found", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login("nonexistent@example.com", "password123"),
      ).rejects.toThrow(AuthenticationError);
      await expect(
        authService.login("nonexistent@example.com", "password123"),
      ).rejects.toThrow("Invalid email or password");

      expect(mockPasswordHasher.verify).not.toHaveBeenCalled();
      expect(mockTokenGenerator.generateToken).not.toHaveBeenCalled();
    });

    it("should throw AuthenticationError if password is incorrect", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.verify.mockResolvedValue(false);

      await expect(authService.login("teacher@example.com", "wrongpassword")).rejects.toThrow(
        AuthenticationError,
      );
      await expect(authService.login("teacher@example.com", "wrongpassword")).rejects.toThrow(
        "Invalid email or password",
      );

      expect(mockTokenGenerator.generateToken).not.toHaveBeenCalled();
    });

    it("should throw AuthenticationError with same message for invalid email and password", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const emailError = await authService
        .login("nonexistent@example.com", "password123")
        .catch((e) => e.message);

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.verify.mockResolvedValue(false);

      const passwordError = await authService
        .login("teacher@example.com", "wrongpassword")
        .catch((e) => e.message);

      expect(emailError).toBe(passwordError);
      expect(emailError).toBe("Invalid email or password");
    });
  });

  describe("register", () => {
    const validRegistrationData = {
      email: "newteacher@example.com",
      password: "securePassword123",
      name: "Jane Smith",
      role: "TEACHER" as UserRole,
    };

    it("should register a new user successfully", async () => {
      const hashedPassword = "$2a$10$hashedpassword";
      const newUser: User = {
        id: 2,
        email: "newteacher@example.com",
        passwordHash: hashedPassword,
        name: "Jane Smith",
        role: "TEACHER",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockUserRepository.save.mockResolvedValue(newUser);

      const result = await authService.register(
        validRegistrationData.email,
        validRegistrationData.password,
        validRegistrationData.name,
        validRegistrationData.role,
      );

      expect(result).toEqual(newUser);
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith("newteacher@example.com");
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith("securePassword123");
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        email: "newteacher@example.com",
        passwordHash: hashedPassword,
        name: "Jane Smith",
        role: "TEACHER",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("should normalize email to lowercase", async () => {
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue("$2a$10$hashed");
      mockUserRepository.save.mockResolvedValue({ ...mockUser, id: 2 });

      await authService.register("NEWTEACHER@EXAMPLE.COM", "password123", "Jane", "TEACHER");

      expect(mockUserRepository.emailExists).toHaveBeenCalledWith("newteacher@example.com");
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "newteacher@example.com",
        }),
      );
    });

    it("should trim name whitespace", async () => {
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue("$2a$10$hashed");
      mockUserRepository.save.mockResolvedValue({ ...mockUser, id: 2 });

      await authService.register(
        "newteacher@example.com",
        "password123",
        "  Jane Smith  ",
        "TEACHER",
      );

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Jane Smith",
        }),
      );
    });

    it("should throw AuthenticationError if email already exists", async () => {
      mockUserRepository.emailExists.mockResolvedValue(true);

      await expect(
        authService.register(
          validRegistrationData.email,
          validRegistrationData.password,
          validRegistrationData.name,
          validRegistrationData.role,
        ),
      ).rejects.toThrow(AuthenticationError);
      await expect(
        authService.register(
          validRegistrationData.email,
          validRegistrationData.password,
          validRegistrationData.name,
          validRegistrationData.role,
        ),
      ).rejects.toThrow("Email already registered");

      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it("should throw AuthenticationError if password is too short", async () => {
      mockUserRepository.emailExists.mockResolvedValue(false);

      await expect(
        authService.register("new@example.com", "short", "Jane", "TEACHER"),
      ).rejects.toThrow(AuthenticationError);
      await expect(
        authService.register("new@example.com", "short", "Jane", "TEACHER"),
      ).rejects.toThrow("Password must be at least 8 characters");

      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it("should throw AuthenticationError if name is empty", async () => {
      mockUserRepository.emailExists.mockResolvedValue(false);

      await expect(
        authService.register("new@example.com", "password123", "   ", "TEACHER"),
      ).rejects.toThrow(AuthenticationError);
      await expect(
        authService.register("new@example.com", "password123", "   ", "TEACHER"),
      ).rejects.toThrow("Name cannot be empty");

      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it("should accept 8 character password", async () => {
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue("$2a$10$hashed");
      mockUserRepository.save.mockResolvedValue({ ...mockUser, id: 2 });

      await expect(
        authService.register("new@example.com", "12345678", "Jane", "TEACHER"),
      ).resolves.toBeDefined();

      expect(mockPasswordHasher.hash).toHaveBeenCalledWith("12345678");
    });

    it("should register admin users", async () => {
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue("$2a$10$hashed");
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        id: 2,
        role: "ADMIN",
      });

      const result = await authService.register(
        "admin@example.com",
        "adminPassword123",
        "Admin User",
        "ADMIN",
      );

      expect(result.role).toBe("ADMIN");
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "ADMIN",
        }),
      );
    });
  });

  describe("verifyToken", () => {
    it("should verify valid token and return user", async () => {
      const token = "session-1-1234567890-abc123";
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await authService.verifyToken(token);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });

    it("should throw AuthenticationError for empty token", async () => {
      await expect(authService.verifyToken("")).rejects.toThrow(AuthenticationError);
      await expect(authService.verifyToken("")).rejects.toThrow("Invalid token");

      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw AuthenticationError for invalid token format", async () => {
      await expect(authService.verifyToken("invalid-token")).rejects.toThrow(
        AuthenticationError,
      );
      await expect(authService.verifyToken("invalid-token")).rejects.toThrow("Invalid token");

      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw AuthenticationError if user not found", async () => {
      const token = "session-999-1234567890-abc123";
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(authService.verifyToken(token)).rejects.toThrow(AuthenticationError);
      await expect(authService.verifyToken(token)).rejects.toThrow("User not found");

      expect(mockUserRepository.findById).toHaveBeenCalledWith(999);
    });

    it("should reject token without session prefix", async () => {
      await expect(authService.verifyToken("1-1234567890-abc123")).rejects.toThrow(
        AuthenticationError,
      );
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it("should reject token with non-numeric user ID", async () => {
      await expect(authService.verifyToken("session-abc-1234567890-def")).rejects.toThrow(
        AuthenticationError,
      );
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it("should reject token with negative user ID", async () => {
      await expect(authService.verifyToken("session--1-1234567890-abc123")).rejects.toThrow(
        AuthenticationError,
      );
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it("should reject token with zero user ID", async () => {
      await expect(authService.verifyToken("session-0-1234567890-abc123")).rejects.toThrow(
        AuthenticationError,
      );
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      const currentPassword = "oldPassword123";
      const newPassword = "newPassword456";
      const newHashedPassword = "$2a$10$newhashedpassword";

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockPasswordHasher.verify.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      mockPasswordHasher.hash.mockResolvedValue(newHashedPassword);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        passwordHash: newHashedPassword,
        updatedAt: new Date(),
      });

      await authService.changePassword(mockUser.id!, currentPassword, newPassword);

      expect(mockPasswordHasher.verify).toHaveBeenCalledWith(
        currentPassword,
        mockUser.passwordHash,
      );
      expect(mockPasswordHasher.verify).toHaveBeenCalledWith(newPassword, mockUser.passwordHash);
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(newPassword);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          passwordHash: newHashedPassword,
          updatedAt: expect.any(Date),
        }),
      );
    });

    it("should throw AuthenticationError if user not found", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        authService.changePassword(999, "oldPassword", "newPassword"),
      ).rejects.toThrow(AuthenticationError);
      await expect(
        authService.changePassword(999, "oldPassword", "newPassword"),
      ).rejects.toThrow("User not found");

      expect(mockPasswordHasher.verify).not.toHaveBeenCalled();
      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it("should throw AuthenticationError if current password is incorrect", async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockPasswordHasher.verify.mockResolvedValue(false);

      await expect(
        authService.changePassword(mockUser.id!, "wrongPassword", "newPassword"),
      ).rejects.toThrow(AuthenticationError);
      await expect(
        authService.changePassword(mockUser.id!, "wrongPassword", "newPassword"),
      ).rejects.toThrow("Current password is incorrect");

      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it("should throw AuthenticationError if new password is too short", async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockPasswordHasher.verify.mockResolvedValue(true);

      await expect(
        authService.changePassword(mockUser.id!, "oldPassword123", "short"),
      ).rejects.toThrow(AuthenticationError);
      await expect(
        authService.changePassword(mockUser.id!, "oldPassword123", "short"),
      ).rejects.toThrow("New password must be at least 8 characters");

      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it("should throw AuthenticationError if new password is same as current", async () => {
      const currentPassword = "samePassword123";

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockPasswordHasher.verify.mockResolvedValue(true);

      await expect(
        authService.changePassword(mockUser.id!, currentPassword, currentPassword),
      ).rejects.toThrow(AuthenticationError);
      await expect(
        authService.changePassword(mockUser.id!, currentPassword, currentPassword),
      ).rejects.toThrow("New password must be different from current password");

      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it("should update timestamp when password is changed", async () => {
      const originalUpdatedAt = new Date("2024-01-01");
      const userWithTimestamp: User = {
        ...mockUser,
        updatedAt: originalUpdatedAt,
      };

      mockUserRepository.findById.mockResolvedValue(userWithTimestamp);
      mockPasswordHasher.verify.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      mockPasswordHasher.hash.mockResolvedValue("$2a$10$newhash");
      mockUserRepository.save.mockImplementation(async (user: User) => user);

      await authService.changePassword(mockUser.id!, "oldPassword", "newPassword");

      const savedUser = mockUserRepository.save.mock.calls[0][0];
      expect(savedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it("should preserve user properties when changing password", async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockPasswordHasher.verify.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      mockPasswordHasher.hash.mockResolvedValue("$2a$10$newhash");
      mockUserRepository.save.mockImplementation(async (user: User) => user);

      await authService.changePassword(mockUser.id!, "oldPassword", "newPassword");

      const savedUser = mockUserRepository.save.mock.calls[0][0];
      expect(savedUser.id).toBe(mockUser.id);
      expect(savedUser.email).toBe(mockUser.email);
      expect(savedUser.name).toBe(mockUser.name);
      expect(savedUser.role).toBe(mockUser.role);
      expect(savedUser.createdAt).toEqual(mockUser.createdAt);
      expect(savedUser.passwordHash).not.toBe(mockUser.passwordHash);
    });
  });

  describe("PasswordHasher interface", () => {
    it("should be injectable", () => {
      const customHasher = {
        hash: async () => "custom-hash",
        verify: async () => true,
      };

      const customAuthService = new AuthenticationService(
        mockUserRepository,
        customHasher,
        mockTokenGenerator,
      );

      expect(customAuthService).toBeInstanceOf(AuthenticationService);
    });
  });

  describe("TokenGenerator interface", () => {
    it("should be injectable", () => {
      const customTokenGen = {
        generateToken: async () => "custom-token",
      };

      const customAuthService = new AuthenticationService(
        mockUserRepository,
        mockPasswordHasher,
        customTokenGen,
      );

      expect(customAuthService).toBeInstanceOf(AuthenticationService);
    });
  });

  describe("AuthenticationError", () => {
    it("should create error with message", () => {
      const error = new AuthenticationError("Test error");

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Test error");
      expect(error.name).toBe("AuthenticationError");
    });

    it("should be throwable and catchable", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login("test@example.com", "password"),
      ).rejects.toThrow(AuthenticationError);
    });
  });
});
