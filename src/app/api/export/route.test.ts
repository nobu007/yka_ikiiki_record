import { NextRequest } from "next/server";
import { GET } from "./route";
import { isPrismaProvider } from "@/lib/config/env";
import type { Record } from "@/schemas/api";

jest.mock("@/lib/config/env", () => ({
  isPrismaProvider: jest.fn(),
}));

jest.mock("@/infrastructure/factories/repositoryFactory", () => ({
  createRecordRepository: jest.fn(),
}));

import { createRecordRepository } from "@/infrastructure/factories/repositoryFactory";

const mockIsPrismaProvider = isPrismaProvider as jest.Mock;
const mockCreateRecordRepository = createRecordRepository as jest.Mock;

function createMockRequest(urlString: string): NextRequest {
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

describe("GET /api/export", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPrismaProvider.mockReturnValue(true);
  });

  const mockRecords: Record[] = [
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

  const mockRepository = {
    findAll: jest.fn(),
    findByDateRange: jest.fn(),
    findByStudent: jest.fn(),
  };

  beforeEach(() => {
    mockCreateRecordRepository.mockReturnValue(mockRepository);
  });

  describe("query parameter handling", () => {
    test("returns all records when no query parameters provided", async () => {
      mockRepository.findAll.mockResolvedValue(mockRecords);

      const request = createMockRequest("http://localhost:3000/api/export");
      const response = await GET(request as never) as Response;
      const text = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
      expect(response.headers.get("Content-Disposition")).toMatch(
        /attachment; filename="records-\d+\.csv"/
      );
      expect(text).toContain("ID,Emotion,Date,Student,Comment,CreatedAt,UpdatedAt");
      expect(text).toContain("1,4,2026-03-20,Alice,Good work,2026-03-20,2026-03-20");
      expect(text).toContain("2,3,2026-03-19,Bob,Needs improvement,2026-03-19,2026-03-19");
    });

    test("returns filtered records by date range when startDate and endDate provided", async () => {
      const filteredRecords = [mockRecords[0]];
      mockRepository.findByDateRange.mockResolvedValue(filteredRecords);

      const startDate = "2026-03-20";
      const endDate = "2026-03-20";
      const request = createMockRequest(
        `http://localhost:3000/api/export?startDate=${startDate}&endDate=${endDate}`
      );
      const response = await GET(request as never) as Response;
      const text = await response.text();

      expect(mockRepository.findByDateRange).toHaveBeenCalledWith(
        new Date(startDate),
        new Date(endDate)
      );
      expect(mockRepository.findAll).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(text).toContain("1,4,2026-03-20,Alice");
      expect(text).not.toContain("Bob");
    });

    test("returns filtered records by student when student parameter provided", async () => {
      const filteredRecords = [mockRecords[1]];
      mockRepository.findByStudent.mockResolvedValue(filteredRecords);

      const student = "Bob";
      const request = createMockRequest(
        `http://localhost:3000/api/export?student=${encodeURIComponent(student)}`
      );
      const response = await GET(request as never) as Response;
      const text = await response.text();

      expect(mockRepository.findByStudent).toHaveBeenCalledWith(student);
      expect(mockRepository.findAll).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(text).toContain("2,3,2026-03-19,Bob");
      expect(text).not.toContain("Alice");
    });

    test("prioritizes date range filter over student filter when both provided", async () => {
      mockRepository.findByDateRange.mockResolvedValue([mockRecords[0]]);

      const request = createMockRequest(
        "http://localhost:3000/api/export?startDate=2026-03-20&endDate=2026-03-20&student=Bob"
      );
      const response = await GET(request as never) as Response;

      expect(mockRepository.findByDateRange).toHaveBeenCalled();
      expect(mockRepository.findByStudent).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe("CSV formatting", () => {
    test("includes correct CSV headers", async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const request = createMockRequest("http://localhost:3000/api/export");
      const response = await GET(request as never) as Response;
      const text = await response.text();

      const lines = text.split("\n");
      expect(lines[0]).toBe("ID,Emotion,Date,Student,Comment,CreatedAt,UpdatedAt");
    });

    test("properly formats dates in ISO format", async () => {
      mockRepository.findAll.mockResolvedValue(mockRecords);

      const request = createMockRequest("http://localhost:3000/api/export");
      const response = await GET(request as never) as Response;
      const text = await response.text();

      expect(text).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    test("escapes commas in values by wrapping in quotes", async () => {
      const recordsWithCommas: Record[] = [
        {
          id: 1,
          emotion: 4,
          date: new Date("2026-03-20"),
          student: "Doe, John",
          comment: "Good, work",
          createdAt: new Date("2026-03-20T10:00:00Z"),
          updatedAt: new Date("2026-03-20T10:00:00Z"),
        },
      ];
      mockRepository.findAll.mockResolvedValue(recordsWithCommas);

      const request = createMockRequest("http://localhost:3000/api/export");
      const response = await GET(request as never) as Response;
      const text = await response.text();

      expect(text).toContain('"Doe, John"');
      expect(text).toContain('"Good, work"');
    });

    test("escapes quotes in values by doubling them", async () => {
      const recordsWithQuotes: Record[] = [
        {
          id: 1,
          emotion: 4,
          date: new Date("2026-03-20"),
          student: 'Alice "The Great"',
          comment: 'Said "Hello"',
          createdAt: new Date("2026-03-20T10:00:00Z"),
          updatedAt: new Date("2026-03-20T10:00:00Z"),
        },
      ];
      mockRepository.findAll.mockResolvedValue(recordsWithQuotes);

      const request = createMockRequest("http://localhost:3000/api/export");
      const response = await GET(request as never) as Response;
      const text = await response.text();

      expect(text).toContain('"Alice ""The Great"""');
      expect(text).toContain('"Said ""Hello"""');
    });

    test("escapes newlines in values by wrapping in quotes", async () => {
      const recordsWithNewlines: Record[] = [
        {
          id: 1,
          emotion: 4,
          date: new Date("2026-03-20"),
          student: "Alice",
          comment: "Line 1\nLine 2",
          createdAt: new Date("2026-03-20T10:00:00Z"),
          updatedAt: new Date("2026-03-20T10:00:00Z"),
        },
      ];
      mockRepository.findAll.mockResolvedValue(recordsWithNewlines);

      const request = createMockRequest("http://localhost:3000/api/export");
      const response = await GET(request as never) as Response;
      const text = await response.text();

      expect(text).toContain('"Line 1\nLine 2"');
    });

    test("handles empty comment field", async () => {
      const recordsWithEmptyComment: Record[] = [
        {
          id: 1,
          emotion: 4,
          date: new Date("2026-03-20"),
          student: "Alice",
          comment: undefined,
          createdAt: new Date("2026-03-20T10:00:00Z"),
          updatedAt: new Date("2026-03-20T10:00:00Z"),
        },
      ];
      mockRepository.findAll.mockResolvedValue(recordsWithEmptyComment);

      const request = createMockRequest("http://localhost:3000/api/export");
      const response = await GET(request as never) as Response;
      const text = await response.text();

      expect(text).toContain("1,4,2026-03-20,Alice,,2026-03-20,2026-03-20");
    });

    test("handles missing optional id field", async () => {
      const recordsWithoutId: Record[] = [
        {
          id: undefined,
          emotion: 4,
          date: new Date("2026-03-20"),
          student: "Alice",
          comment: "Test",
          createdAt: new Date("2026-03-20T10:00:00Z"),
          updatedAt: new Date("2026-03-20T10:00:00Z"),
        },
      ];
      mockRepository.findAll.mockResolvedValue(recordsWithoutId);

      const request = createMockRequest("http://localhost:3000/api/export");
      const response = await GET(request as never) as Response;
      const text = await response.text();

      expect(text).toContain(",4,2026-03-20,Alice");
    });

    test("handles missing optional timestamp fields", async () => {
      const recordsWithoutTimestamps: Record[] = [
        {
          id: 1,
          emotion: 4,
          date: new Date("2026-03-20"),
          student: "Alice",
          comment: "Test",
          createdAt: undefined,
          updatedAt: undefined,
        },
      ];
      mockRepository.findAll.mockResolvedValue(recordsWithoutTimestamps);

      const request = createMockRequest("http://localhost:3000/api/export");
      const response = await GET(request as never) as Response;
      const text = await response.text();

      expect(text).toMatch(/,4,2026-03-20,Alice,Test(,|)/);
    });
  });

  describe("empty result handling", () => {
    test("returns CSV with headers when no records found", async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const request = createMockRequest("http://localhost:3000/api/export");
      const response = await GET(request as never) as Response;
      const text = await response.text();

      expect(response.status).toBe(200);
      expect(text).toBe("ID,Emotion,Date,Student,Comment,CreatedAt,UpdatedAt\n");
    });
  });

  describe("HTTP response headers", () => {
    test("sets correct Content-Type header", async () => {
      mockRepository.findAll.mockResolvedValue(mockRecords);

      const request = createMockRequest("http://localhost:3000/api/export");
      const response = await GET(request as never) as Response;

      expect(response.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
    });

    test("sets Content-Disposition header with attachment filename", async () => {
      mockRepository.findAll.mockResolvedValue(mockRecords);

      const request = createMockRequest("http://localhost:3000/api/export");
      const response = await GET(request as never) as Response;
      const contentDisposition = response.headers.get("Content-Disposition");

      expect(contentDisposition).toMatch(/^attachment; filename="records-\d+\.csv"$/);
    });

    test("generates unique filename with timestamp", async () => {
      mockRepository.findAll.mockResolvedValue(mockRecords);

      const request1 = createMockRequest("http://localhost:3000/api/export");
      const response1 = await GET(request1 as never) as Response;
      const filename1 = response1.headers.get("Content-Disposition");

      await new Promise((resolve) => setTimeout(resolve, 10));

      const request2 = createMockRequest("http://localhost:3000/api/export");
      const response2 = await GET(request2 as never) as Response;
      const filename2 = response2.headers.get("Content-Disposition");

      expect(filename1).not.toBe(filename2);
    });
  });

  describe("error handling", () => {
    test("returns 500 error when repository throws error", async () => {
      mockRepository.findAll.mockRejectedValue(new Error("Database error"));

      const request = createMockRequest("http://localhost:3000/api/export");
      const response = await GET(request as never) as Response;

      expect(response.status).toBe(500);
    });

    test("returns 500 error when findByDateRange throws error", async () => {
      mockRepository.findByDateRange.mockRejectedValue(new Error("Invalid date range"));

      const request = createMockRequest(
        "http://localhost:3000/api/export?startDate=2026-03-20&endDate=2026-03-20"
      );
      const response = await GET(request as never) as Response;

      expect(response.status).toBe(500);
    });

    test("returns 500 error when findByStudent throws error", async () => {
      mockRepository.findByStudent.mockRejectedValue(new Error("Invalid student"));

      const request = createMockRequest(
        "http://localhost:3000/api/export?student=Alice"
      );
      const response = await GET(request as never) as Response;

      expect(response.status).toBe(500);
    });
  });

  describe("data integrity", () => {
    test("preserves emotion values within valid range", async () => {
      const recordsWithEdgeEmotions: Record[] = [
        {
          id: 1,
          emotion: 1,
          date: new Date("2026-03-20"),
          student: "Alice",
          comment: "Lowest",
          createdAt: new Date("2026-03-20T10:00:00Z"),
          updatedAt: new Date("2026-03-20T10:00:00Z"),
        },
        {
          id: 2,
          emotion: 5,
          date: new Date("2026-03-19"),
          student: "Bob",
          comment: "Highest",
          createdAt: new Date("2026-03-19T10:00:00Z"),
          updatedAt: new Date("2026-03-19T10:00:00Z"),
        },
      ];
      mockRepository.findAll.mockResolvedValue(recordsWithEdgeEmotions);

      const request = createMockRequest("http://localhost:3000/api/export");
      const response = await GET(request as never) as Response;
      const text = await response.text();

      expect(text).toContain("1,1,2026-03-20,Alice,Lowest");
      expect(text).toContain("2,5,2026-03-19,Bob,Highest");
    });

    test("handles special characters in student names and comments", async () => {
      const recordsWithSpecialChars: Record[] = [
        {
          id: 1,
          emotion: 4,
          date: new Date("2026-03-20"),
          student: "José García",
          comment: "日本語テスト • Test • Тест",
          createdAt: new Date("2026-03-20T10:00:00Z"),
          updatedAt: new Date("2026-03-20T10:00:00Z"),
        },
      ];
      mockRepository.findAll.mockResolvedValue(recordsWithSpecialChars);

      const request = createMockRequest("http://localhost:3000/api/export");
      const response = await GET(request as never) as Response;
      const text = await response.text();

      expect(text).toContain("José García");
      expect(text).toContain("日本語テスト");
    });
  });

  describe("large dataset handling", () => {
    test("handles large number of records efficiently", async () => {
      const largeDataset: Record[] = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        emotion: Math.floor(Math.random() * 5) + 1,
        date: new Date(`2026-03-${String((i % 28) + 1).padStart(2, "0")}`),
        student: `Student${i % 50}`,
        comment: `Comment ${i}`,
        createdAt: new Date(`2026-03-20T10:00:00Z`),
        updatedAt: new Date(`2026-03-20T10:00:00Z`),
      }));
      mockRepository.findAll.mockResolvedValue(largeDataset);

      const request = createMockRequest("http://localhost:3000/api/export");
      const response = await GET(request as never) as Response;
      const text = await response.text();

      expect(response.status).toBe(200);
      const lines = text.split("\n");
      expect(lines.length).toBeGreaterThanOrEqual(1001);
      expect(lines[0]).toContain("ID,Emotion,Date");
    });
  });
});
