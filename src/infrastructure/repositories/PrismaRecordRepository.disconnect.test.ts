import { PrismaRecordRepository } from "./PrismaRecordRepository";
import { TestPrismaClient } from "./PrismaRecordRepository.test.types";

jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    record: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
    $connect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

describe("PrismaRecordRepository.disconnect", () => {
  let prisma: TestPrismaClient;

  beforeEach(() => {
    prisma =
      new (require("@prisma/client").PrismaClient)() as unknown as TestPrismaClient;
    jest.clearAllMocks();
  });

  describe("when repository creates its own PrismaClient", () => {
    it("should call $disconnect when disconnect is called", async () => {
      const repository = new PrismaRecordRepository();

      await repository.disconnect();

      expect(prisma.$disconnect).toHaveBeenCalledTimes(1);
    });

    it("should not call $disconnect on externally provided PrismaClient", async () => {
      const externalPrisma = { ...prisma, $disconnect: jest.fn() };
      const repository = new PrismaRecordRepository(
        externalPrisma as unknown as typeof prisma,
      );

      await repository.disconnect();

      expect(externalPrisma.$disconnect).not.toHaveBeenCalled();
    });
  });

  describe("when repository uses externally provided PrismaClient", () => {
    it("should not disconnect the external client", async () => {
      const externalPrisma = { ...prisma, $disconnect: jest.fn() };
      const repository = new PrismaRecordRepository(
        externalPrisma as unknown as typeof prisma,
      );

      await repository.disconnect();

      expect(externalPrisma.$disconnect).not.toHaveBeenCalled();
      expect(prisma.$disconnect).not.toHaveBeenCalled();
    });
  });

  describe("resource cleanup", () => {
    it("should be safe to call disconnect multiple times", async () => {
      const repository = new PrismaRecordRepository();

      await repository.disconnect();
      await repository.disconnect();
      await repository.disconnect();

      expect(prisma.$disconnect).toHaveBeenCalledTimes(3);
    });

    it("should propagate disconnect errors", async () => {
      const repository = new PrismaRecordRepository();
      (prisma.$disconnect as jest.Mock).mockRejectedValueOnce(
        new Error("Connection already closed"),
      );

      await expect(repository.disconnect()).rejects.toThrow(
        "Connection already closed",
      );
    });
  });
});
