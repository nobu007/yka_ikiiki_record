import { PrismaRecordRepository } from './PrismaRecordRepository';
import { Record } from '@/domain/entities/Record';

jest.mock('@prisma/client', () => {
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
  prisma: any;
}

export function setupTest(): TestSetup {
  const PrismaClient = require('@prisma/client').PrismaClient;
  const prisma = new PrismaClient();
  const repository = new PrismaRecordRepository(prisma);

  return { repository, prisma };
}

export function createMockRecord(overrides: Partial<Record> = {}): Record {
  return {
    emotion: 85.5,
    date: new Date('2024-01-15T10:30:00'),
    student: '学生1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockPrismaRecord(overrides: any = {}): any {
  return {
    id: 1,
    emotion: 85.5,
    date: new Date('2024-01-15T10:30:00'),
    student: '学生1',
    comment: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
