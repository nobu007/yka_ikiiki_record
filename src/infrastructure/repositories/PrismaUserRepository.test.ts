import { PrismaUserRepository } from "@/infrastructure/repositories/PrismaUserRepository";
import { User } from "@/schemas/api";

jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
    $connect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

describe("PrismaUserRepository", () => {
  let repository: PrismaUserRepository;
  let prismaMock: any;

  beforeEach(() => {
    const { PrismaClient } = require("@prisma/client");
    prismaMock = new PrismaClient();
    repository = new PrismaUserRepository(prismaMock);
    jest.clearAllMocks();
  });

  describe("findByEmail", () => {
    it("should find user by email (case-insensitive)", async () => {
      const mockUser = {
        id: 1,
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const found = await repository.findByEmail("TEACHER@EXAMPLE.COM");

      expect(found).not.toBeNull();
      expect(found?.email).toBe("teacher@example.com");
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: "teacher@example.com" },
      });
    });

    it("should return null for non-existent email", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const found = await repository.findByEmail("nonexistent@example.com");

      expect(found).toBeNull();
    });
  });

  describe("findById", () => {
    it("should find user by ID", async () => {
      const mockUser = {
        id: 1,
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const found = await repository.findById(1);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(1);
      expect(found?.email).toBe("teacher@example.com");
    });

    it("should return null for non-existent ID", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const found = await repository.findById(999999);

      expect(found).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      const mockUsers = [
        {
          id: 1,
          email: "teacher1@example.com",
          passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
          name: "田中先生",
          role: "TEACHER",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          email: "admin@example.com",
          passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
          name: "システム管理者",
          role: "ADMIN",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.user.findMany.mockResolvedValue(mockUsers);

      const all = await repository.findAll();

      expect(all).toHaveLength(2);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
    });

    it("should return empty array when no users exist", async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      const all = await repository.findAll();

      expect(all).toHaveLength(0);
    });
  });

  describe("findByRole", () => {
    it("should find users by TEACHER role", async () => {
      const mockUsers = [
        {
          id: 1,
          email: "teacher1@example.com",
          passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
          name: "田中先生",
          role: "TEACHER",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.user.findMany.mockResolvedValue(mockUsers);

      const teachers = await repository.findByRole("TEACHER");

      expect(teachers).toHaveLength(1);
      expect(teachers[0]?.role).toBe("TEACHER");
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: { role: "TEACHER" },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should find users by ADMIN role", async () => {
      const mockUsers = [
        {
          id: 1,
          email: "admin@example.com",
          passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
          name: "システム管理者",
          role: "ADMIN",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.user.findMany.mockResolvedValue(mockUsers);

      const admins = await repository.findByRole("ADMIN");

      expect(admins).toHaveLength(1);
      expect(admins[0]?.role).toBe("ADMIN");
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

      const mockCreatedUser = {
        id: 1,
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.create.mockResolvedValue(mockCreatedUser);

      const saved = await repository.save(user);

      expect(saved.id).toBeDefined();
      expect(saved.id).toBe(1);
      expect(saved.email).toBe("teacher@example.com");
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: "teacher@example.com",
          passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
          name: "田中先生",
          role: "TEACHER",
        },
      });
    });

    it("should update existing user with ID", async () => {
      const user: User = {
        id: 1,
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生（更新）",
        role: "TEACHER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedUser = {
        id: 1,
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生（更新）",
        role: "TEACHER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.update.mockResolvedValue(mockUpdatedUser);

      const saved = await repository.save(user);

      expect(saved.id).toBe(1);
      expect(saved.name).toBe("田中先生（更新）");
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          email: "teacher@example.com",
          passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
          name: "田中先生（更新）",
          role: "TEACHER",
          updatedAt: expect.any(Date),
        },
      });
    });

    it("should lowercase email before saving", async () => {
      const user: User = {
        email: "Teacher@Example.COM",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
      };

      const mockCreatedUser = {
        id: 1,
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.create.mockResolvedValue(mockCreatedUser);

      const saved = await repository.save(user);

      expect(saved.email).toBe("teacher@example.com");
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: "teacher@example.com",
        }),
      });
    });
  });

  describe("delete", () => {
    it("should delete user by ID", async () => {
      const mockDeletedUser = {
        id: 1,
        email: "teacher@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
        name: "田中先生",
        role: "TEACHER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.delete.mockResolvedValue(mockDeletedUser);

      await repository.delete(1);

      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe("count", () => {
    it("should return user count", async () => {
      prismaMock.user.count.mockResolvedValue(5);

      const count = await repository.count();

      expect(count).toBe(5);
      expect(prismaMock.user.count).toHaveBeenCalled();
    });

    it("should return 0 for empty repository", async () => {
      prismaMock.user.count.mockResolvedValue(0);

      const count = await repository.count();

      expect(count).toBe(0);
    });
  });

  describe("emailExists", () => {
    it("should return true for existing email", async () => {
      prismaMock.user.count.mockResolvedValue(1);

      const exists = await repository.emailExists("teacher@example.com");

      expect(exists).toBe(true);
      expect(prismaMock.user.count).toHaveBeenCalledWith({
        where: { email: "teacher@example.com" },
      });
    });

    it("should return false for non-existent email", async () => {
      prismaMock.user.count.mockResolvedValue(0);

      const exists = await repository.emailExists("nonexistent@example.com");

      expect(exists).toBe(false);
    });

    it("should lowercase email before checking", async () => {
      prismaMock.user.count.mockResolvedValue(1);

      await repository.emailExists("Teacher@Example.COM");

      expect(prismaMock.user.count).toHaveBeenCalledWith({
        where: { email: "teacher@example.com" },
      });
    });
  });

  describe("disconnect", () => {
    it("should disconnect from prisma when created without external client", async () => {
      const internalRepository = new PrismaUserRepository();
      await internalRepository.disconnect();

      const { PrismaClient } = require("@prisma/client");
      const internalPrisma = new PrismaClient();
      expect(internalPrisma.$disconnect).toHaveBeenCalled();
    });

    it("should not disconnect when external prisma client provided", async () => {
      await repository.disconnect();

      expect(prismaMock.$disconnect).not.toHaveBeenCalled();
    });
  });
});
