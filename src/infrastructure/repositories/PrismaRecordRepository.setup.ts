import { PrismaRecordRepository } from "./PrismaRecordRepository";
import { Record } from "@/domain/entities/Record";
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

export interface TestSetup {
  repository: PrismaRecordRepository;
  prisma: TestPrismaClient;
}

export function setupTest(): TestSetup {
  const prisma =
    new (require("@prisma/client").PrismaClient)() as unknown as TestPrismaClient;
  const repository = new PrismaRecordRepository(prisma);

  return { repository, prisma };
}

export function createMockRecord(overrides: Partial<Record> = {}): Record {
  return {
    emotion: 85.5,
    date: new Date("2024-01-15T10:30:00"),
    student: "学生1",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export interface MockPrismaRecord {
  id: number;
  emotion: number;
  date: Date;
  student: string;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockPrismaRecord(
  overrides: Partial<MockPrismaRecord> = {},
): MockPrismaRecord {
  return {
    id: 1,
    emotion: 85.5,
    date: new Date("2024-01-15T10:30:00"),
    student: "学生1",
    comment: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
