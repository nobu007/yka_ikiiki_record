import { NextResponse } from "next/server";

// Mock createStatsService
const mockGetStats = jest.fn();
const mockStatsService = {
  getStats: mockGetStats,
};

jest.mock("@/infrastructure/factories/repositoryFactory", () => ({
  createStatsService: jest.fn(() => mockStatsService),
}));

// Mock createSuccessResponse
const mockCreateSuccessResponse = jest.fn().mockImplementation((body) => {
  return NextResponse.json(body);
});
jest.mock("@/lib/api/response", () => ({
  createSuccessResponse: (...args: unknown[]) =>
    mockCreateSuccessResponse(...args),
}));

// Mock withResilientHandler to execute the handler, and createError
const mockNotFound = jest.fn().mockImplementation((msg: string) => {
  const err = new Error(msg);
  (err as Error & { statusCode: number }).statusCode = 404;
  return err;
});

jest.mock("@/lib/api/error-handler", () => {
  const withResilientHandler = jest
    .fn()
    .mockImplementation((handler: () => Promise<NextResponse>) => handler());
  return {
    withResilientHandler,
    createError: {
      notFound: (...args: unknown[]) => mockNotFound(...args),
    },
  };
});

// Mock StatsResponseSchema
jest.mock("@/schemas/api", () => ({
  StatsResponseSchema: { parse: jest.fn((v: unknown) => v) },
}));

import { GET } from "./route";
import { API_CONFIG } from "@/lib/constants";

function createMockRequest(): Request {
  return new Request(`${API_CONFIG.LOCAL_BASE_URL}/stats`, { method: "GET" });
}

describe("GET /api/stats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns stats data when available", async () => {
    const mockStats = {
      overview: { count: 100, avgEmotion: 3.5 },
      monthlyStats: [{ month: "2024-01", count: 10, avgEmotion: 3.2 }],
      studentStats: [],
      dayOfWeekStats: [],
      emotionDistribution: [0.1, 0.2, 0.3, 0.25, 0.15],
      timeOfDayStats: { morning: 3.0, afternoon: 3.5, evening: 3.2 },
    };
    mockGetStats.mockResolvedValue(mockStats);

    const req = createMockRequest();
    const res = await GET(req as never);
    const body = await res.json();

    expect(body).toEqual(
      expect.objectContaining({ success: true, data: mockStats }),
    );
  });

  it("calls statsService.getStats exactly once", async () => {
    mockGetStats.mockResolvedValue({ overview: { count: 1, avgEmotion: 3 } });

    const req = createMockRequest();
    await GET(req as never);

    expect(mockGetStats).toHaveBeenCalledTimes(1);
  });

  it("calls createSuccessResponse with correct body and schema", async () => {
    const mockStats = { overview: { count: 5, avgEmotion: 4.0 } };
    mockGetStats.mockResolvedValue(mockStats);

    const req = createMockRequest();
    await GET(req as never);

    expect(mockCreateSuccessResponse).toHaveBeenCalledWith(
      { success: true, data: mockStats },
      expect.anything(), // StatsResponseSchema
    );
  });

  it("throws notFound error when stats is null", async () => {
    mockGetStats.mockResolvedValue(null);

    const req = createMockRequest();
    await expect(GET(req as never)).rejects.toThrow();
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("throws notFound error when stats is undefined", async () => {
    mockGetStats.mockResolvedValue(undefined);

    const req = createMockRequest();
    await expect(GET(req as never)).rejects.toThrow();
    expect(mockNotFound).toHaveBeenCalledWith("統計データが見つかりません");
  });

  it("propagates errors from statsService.getStats", async () => {
    mockGetStats.mockRejectedValue(new Error("DB connection failed"));

    const req = createMockRequest();
    await expect(GET(req as never)).rejects.toThrow("DB connection failed");
  });

  it("wraps handler with withResilientHandler", async () => {
    const { withResilientHandler: mockWithResilientHandler } = jest.requireMock(
      "@/lib/api/error-handler",
    );
    mockGetStats.mockResolvedValue({ overview: { count: 0, avgEmotion: 0 } });

    const req = createMockRequest();
    await GET(req as never);

    expect(mockWithResilientHandler).toHaveBeenCalledTimes(1);
    expect(mockWithResilientHandler).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        operationName: "GET /api/stats",
        timeoutMs: 10000,
      }),
    );
  });
});
