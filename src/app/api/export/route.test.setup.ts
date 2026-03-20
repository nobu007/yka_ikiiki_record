import { NextRequest } from "next/server";
import { isPrismaProvider } from "@/lib/config/env";
import type { Record } from "@/schemas/api";

jest.mock("@/lib/config/env", () => ({
  isPrismaProvider: jest.fn(),
}));

jest.mock("@/infrastructure/factories/repositoryFactory", () => ({
  createRecordRepository: jest.fn(),
}));

import { createRecordRepository } from "@/infrastructure/factories/repositoryFactory";

export const mockIsPrismaProvider = isPrismaProvider as jest.Mock;
export const mockCreateRecordRepository = createRecordRepository as jest.Mock;

export function createMockRequest(urlString: string): NextRequest {
  const url = new URL(urlString);
  const searchParams = url.searchParams;

  return {
    nextUrl: {
      searchParams,
      hostname: url.hostname,
      pathname: url.pathname,
      protocol: url.protocol,
      port: url.port,
      hash: url.hash,
      href: url.href,
      origin: url.origin,
      search: url.search,
    },
  } as unknown as NextRequest;
}

export const mockRecords: Record[] = [
  {
    id: 1,
    emotion: 4,
    date: new Date("2026-03-20"),
    student: "Alice",
    comment: "Good work",
    createdAt: new Date("2026-03-20T10:00:00Z"),
    updatedAt: new Date("2026-03-20T10:00:00Z"),
  },
  {
    id: 2,
    emotion: 3,
    date: new Date("2026-03-19"),
    student: "Bob",
    comment: "Needs improvement",
    createdAt: new Date("2026-03-19T10:00:00Z"),
    updatedAt: new Date("2026-03-19T10:00:00Z"),
  },
];

export const mockRepository = {
  findAll: jest.fn(),
  findByDateRange: jest.fn(),
  findByStudent: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockIsPrismaProvider.mockReturnValue(true);
  mockCreateRecordRepository.mockReturnValue(mockRepository);
});
