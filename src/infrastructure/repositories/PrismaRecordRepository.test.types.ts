import { PrismaClient } from '@prisma/client';

export interface MockPrismaClient {
  record: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    createMany: jest.Mock;
    upsert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    deleteMany: jest.Mock;
    count: jest.Mock;
  };
  $disconnect: jest.Mock;
  $connect: jest.Mock;
}

export type TestPrismaClient = PrismaClient & MockPrismaClient;
