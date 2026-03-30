import { NextRequest } from "next/server";
import { isPrismaProvider } from "@/lib/config/env";
import type { Record } from "@/schemas/api";
import { GET } from "./route";
import { globalCircuitBreaker } from "@/lib/resilience";

jest.mock("@/lib/config/env", () => ({
  isPrismaProvider: jest.fn(),
}));

jest.mock("@/infrastructure/factories/repositoryFactory", () => ({
  createRecordRepository: jest.fn(),
  createTrendAnalysisRepository: jest.fn(),
}));

import { createRecordRepository } from "@/infrastructure/factories/repositoryFactory";
import { createTrendAnalysisRepository } from "@/infrastructure/factories/repositoryFactory";
import { InMemoryTrendAnalysisRepository } from "@/infrastructure/storage/InMemoryTrendAnalysisRepository";

export const mockIsPrismaProvider = isPrismaProvider as jest.Mock;
export const mockCreateRecordRepository = createRecordRepository as jest.Mock;
export const mockCreateTrendAnalysisRepository = createTrendAnalysisRepository as jest.Mock;

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

describe("GET /api/trends", () => {
  let mockRecordRepository: {
    findAll: jest.Mock;
  };
  let mockTrendRepository: InMemoryTrendAnalysisRepository;

  const testRecords: Record[] = [
    {
      id: 1,
      emotion: 3,
      date: new Date("2026-03-20"),
      student: "Alice",
      comment: "Good day",
      createdAt: new Date("2026-03-20T10:00:00Z"),
      updatedAt: new Date("2026-03-20T10:00:00Z"),
    },
    {
      id: 2,
      emotion: 4,
      date: new Date("2026-03-21"),
      student: "Alice",
      comment: "Great day",
      createdAt: new Date("2026-03-21T10:00:00Z"),
      updatedAt: new Date("2026-03-21T10:00:00Z"),
    },
    {
      id: 3,
      emotion: 5,
      date: new Date("2026-03-22"),
      student: "Alice",
      comment: "Excellent",
      createdAt: new Date("2026-03-22T10:00:00Z"),
      updatedAt: new Date("2026-03-22T10:00:00Z"),
    },
    {
      id: 4,
      emotion: 4,
      date: new Date("2026-03-20"),
      student: "Bob",
      comment: "Good",
      createdAt: new Date("2026-03-20T10:00:00Z"),
      updatedAt: new Date("2026-03-20T10:00:00Z"),
    },
    {
      id: 5,
      emotion: 3,
      date: new Date("2026-03-21"),
      student: "Bob",
      comment: "Average",
      createdAt: new Date("2026-03-21T10:00:00Z"),
      updatedAt: new Date("2026-03-21T10:00:00Z"),
    },
    {
      id: 6,
      emotion: 2,
      date: new Date("2026-03-22"),
      student: "Bob",
      comment: "Below average",
      createdAt: new Date("2026-03-22T10:00:00Z"),
      updatedAt: new Date("2026-03-22T10:00:00Z"),
    },
    {
      id: 7,
      emotion: 3,
      date: new Date("2026-03-20"),
      student: "Charlie",
      comment: "Average",
      createdAt: new Date("2026-03-20T10:00:00Z"),
      updatedAt: new Date("2026-03-20T10:00:00Z"),
    },
    {
      id: 8,
      emotion: 3,
      date: new Date("2026-03-21"),
      student: "Charlie",
      comment: "Average",
      createdAt: new Date("2026-03-21T10:00:00Z"),
      updatedAt: new Date("2026-03-21T10:00:00Z"),
    },
    {
      id: 9,
      emotion: 3,
      date: new Date("2026-03-22"),
      student: "Charlie",
      comment: "Average",
      createdAt: new Date("2026-03-22T10:00:00Z"),
      updatedAt: new Date("2026-03-22T10:00:00Z"),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPrismaProvider.mockReturnValue(true);
    globalCircuitBreaker.reset();

    mockRecordRepository = {
      findAll: jest.fn().mockResolvedValue(testRecords),
    };

    mockTrendRepository = new InMemoryTrendAnalysisRepository();
    mockCreateRecordRepository.mockReturnValue(mockRecordRepository as never);
    mockCreateTrendAnalysisRepository.mockReturnValue(mockTrendRepository);

    mockTrendRepository.clear();
  });

  describe("basic functionality", () => {
    test("returns 200 status code", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends");
      const response = await GET(request as never);
      expect(response.status).toBe(200);
    });

    test("returns JSON content type", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends");
      const response = await GET(request as never);
      expect(response.headers.get("Content-Type")).toBe("application/json");
    });

    test("defaults to student trends type", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends");
      const response = await GET(request as never);
      const data = await response.json();
      expect(data.type).toBe("student");
    });

    test("calls recordRepository.findAll", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends");
      await GET(request as never);
      expect(mockRecordRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("student trends", () => {
    test("returns student trends for all students", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=student");
      const response = await GET(request as never);
      const data = await response.json();

      expect(data.type).toBe("student");
      expect(data.trends).toBeDefined();
      expect(Array.isArray(data.trends)).toBe(true);
      expect(data.trends.length).toBeGreaterThan(0);
    });

    test("filters trends by student name", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=student&student=Alice");
      const response = await GET(request as never);
      const data = await response.json();

      expect(data.trends.length).toBe(1);
      expect(data.trends[0].student).toBe("Alice");
    });

    test("filters trends by direction (up)", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=student&direction=up");
      const response = await GET(request as never);
      const data = await response.json();

      data.trends.forEach((trend: { metrics: { trendDirection: string } }) => {
        expect(trend.metrics.trendDirection).toBe("up");
      });
    });

    test("filters trends by direction (down)", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=student&direction=down");
      const response = await GET(request as never);
      const data = await response.json();

      data.trends.forEach((trend: { metrics: { trendDirection: string } }) => {
        expect(trend.metrics.trendDirection).toBe("down");
      });
    });

    test("filters trends by direction (stable)", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=student&direction=stable");
      const response = await GET(request as never);
      const data = await response.json();

      data.trends.forEach((trend: { metrics: { trendDirection: string } }) => {
        expect(trend.metrics.trendDirection).toBe("stable");
      });
    });

    test("returns trend data points", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=student&student=Alice");
      const response = await GET(request as never);
      const data = await response.json();

      expect(data.trends[0].dataPoints).toBeDefined();
      expect(Array.isArray(data.trends[0].dataPoints)).toBe(true);
      expect(data.trends[0].dataPoints.length).toBeGreaterThan(0);
    });

    test("returns trend metrics", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=student&student=Alice");
      const response = await GET(request as never);
      const data = await response.json();

      expect(data.trends[0].metrics).toBeDefined();
      expect(data.trends[0].metrics.trendDirection).toBeDefined();
      expect(data.trends[0].metrics.averageEmotion).toBeDefined();
      expect(data.trends[0].metrics.volatility).toBeDefined();
      expect(data.trends[0].metrics.totalRecords).toBeDefined();
    });
  });

  describe("class trends", () => {
    test("returns class trends for all classes", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=class");
      const response = await GET(request as never);
      const data = await response.json();

      expect(data.type).toBe("class");
      expect(data.trends).toBeDefined();
      expect(Array.isArray(data.trends)).toBe(true);
      expect(data.trends.length).toBeGreaterThan(0);
    });

    test("filters trends by class name", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=class&class=ClassA");
      const response = await GET(request as never);
      const data = await response.json();

      expect(data.trends.length).toBe(1);
      expect(data.trends[0].className).toBe("ClassA");
    });

    test("returns student analyses for class trends", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=class&class=ClassA");
      const response = await GET(request as never);
      const data = await response.json();

      expect(data.trends[0].studentAnalyses).toBeDefined();
      expect(Array.isArray(data.trends[0].studentAnalyses)).toBe(true);
      expect(data.trends[0].studentAnalyses.length).toBeGreaterThan(0);
    });

    test("returns class metrics with top performers and needs support", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=class&class=ClassA");
      const response = await GET(request as never);
      const data = await response.json();

      expect(data.trends[0].metrics).toBeDefined();
      expect(data.trends[0].metrics.topPerformers).toBeDefined();
      expect(Array.isArray(data.trends[0].metrics.topPerformers)).toBe(true);
      expect(data.trends[0].metrics.needsSupport).toBeDefined();
      expect(Array.isArray(data.trends[0].metrics.needsSupport)).toBe(true);
      expect(data.trends[0].metrics.totalStudents).toBeDefined();
    });
  });

  describe("pagination", () => {
    test("respects limit parameter", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=student&limit=1");
      const response = await GET(request as never);
      const data = await response.json();

      expect(data.trends.length).toBeLessThanOrEqual(1);
    });

    test("respects offset parameter", async () => {
      const request1 = createMockRequest("http://localhost:3000/api/trends?type=student&limit=1&offset=0");
      const response1 = await GET(request1 as never);
      const data1 = await response1.json();

      const request2 = createMockRequest("http://localhost:3000/api/trends?type=student&limit=1&offset=1");
      const response2 = await GET(request2 as never);
      const data2 = await response2.json();

      if (data1.trends[0] && data2.trends[0]) {
        expect(data1.trends[0].student).not.toBe(data2.trends[0].student);
      }
    });

    test("returns pagination metadata", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=student&limit=1");
      const response = await GET(request as never);
      const data = await response.json();

      expect(data.pagination).toBeDefined();
      expect(data.pagination.total).toBeDefined();
      expect(data.pagination.limit).toBe(1);
      expect(data.pagination.offset).toBe(0);
      expect(data.pagination.hasMore).toBeDefined();
    });

    test("indicates hasMore correctly", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=student&limit=1");
      const response = await GET(request as never);
      const data = await response.json();

      if (data.pagination.total > 1) {
        expect(data.pagination.hasMore).toBe(true);
      } else {
        expect(data.pagination.hasMore).toBe(false);
      }
    });
  });

  describe("date filtering", () => {
    test("filters trends by start date", async () => {
      const request = createMockRequest(
        "http://localhost:3000/api/trends?type=student&startDate=2026-03-21",
      );
      const response = await GET(request as never);
      const data = await response.json();

      data.trends.forEach((trend: { dataPoints: Array<{ date: string }> }) => {
        const hasDataPointsAfterStartDate = trend.dataPoints.some(
          (dp) => new Date(dp.date) >= new Date("2026-03-21"),
        );
        expect(hasDataPointsAfterStartDate).toBe(true);
      });
    });

    test("filters trends by end date", async () => {
      const request = createMockRequest(
        "http://localhost:3000/api/trends?type=student&endDate=2026-03-21",
      );
      const response = await GET(request as never);
      const data = await response.json();

      data.trends.forEach((trend: { dataPoints: Array<{ date: string }> }) => {
        const hasDataPointsBeforeEndDate = trend.dataPoints.some(
          (dp) => new Date(dp.date) <= new Date("2026-03-21"),
        );
        expect(hasDataPointsBeforeEndDate).toBe(true);
      });
    });

    test("filters trends by date range", async () => {
      const request = createMockRequest(
        "http://localhost:3000/api/trends?type=student&startDate=2026-03-20&endDate=2026-03-21",
      );
      const response = await GET(request as never);
      const data = await response.json();

      data.trends.forEach((trend: { dataPoints: Array<{ date: string }> }) => {
        const hasDataPointsInRange = trend.dataPoints.some(
          (dp) =>
            new Date(dp.date) >= new Date("2026-03-20") &&
            new Date(dp.date) <= new Date("2026-03-21"),
        );
        expect(hasDataPointsInRange).toBe(true);
      });
    });
  });

  describe("validation", () => {
    test("handles invalid type parameter", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=invalid");
      const response = await GET(request as never);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test("handles invalid direction parameter", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=student&direction=invalid");
      const response = await GET(request as never);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test("handles invalid limit parameter", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=student&limit=invalid");
      const response = await GET(request as never);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test("handles limit greater than maximum", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=student&limit=101");
      const response = await GET(request as never);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test("handles negative offset", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=student&offset=-1");
      const response = await GET(request as never);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("empty results", () => {
    test("returns empty array when no records exist", async () => {
      mockRecordRepository.findAll.mockResolvedValue([]);

      const request = createMockRequest("http://localhost:3000/api/trends?type=student");
      const response = await GET(request as never);

      expect(response.status).toBe(200);

      const data = await response.json();

      expect(data.trends).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });

    test("returns empty array when filter matches no results", async () => {
      const request = createMockRequest("http://localhost:3000/api/trends?type=student&student=NonExistent");
      const response = await GET(request as never);

      expect(response.status).toBe(200);

      const data = await response.json();

      expect(data.trends).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });
  });

  describe("caching", () => {
    test("returns cached trend on subsequent request", async () => {
      const request1 = createMockRequest("http://localhost:3000/api/trends?type=student&student=Alice");
      const response1 = await GET(request1 as never);
      const data1 = await response1.json();

      const request2 = createMockRequest("http://localhost:3000/api/trends?type=student&student=Alice");
      const response2 = await GET(request2 as never);
      const data2 = await response2.json();

      expect(data1.trends[0].student).toBe(data2.trends[0].student);
      expect(data1.trends[0].metrics.trendDirection).toBe(data2.trends[0].metrics.trendDirection);
    });
  });
});
