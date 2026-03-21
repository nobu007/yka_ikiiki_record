import "./route.test.setup";
import { GET } from "./route";
import {
  createMockRequest,
  mockRecords,
  mockRepository,
} from "./route.test.setup";

describe("GET /api/analytics - Basic functionality", () => {
  test("returns analytics data with default parameters", async () => {
    mockRepository.findAll.mockResolvedValue(mockRecords);

    const request = createMockRequest("http://localhost:3000/api/analytics");
    const response = (await GET(request as never)) as Response;

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");

    const data = await response.json();
    expect(data).toHaveProperty("trend");
    expect(data).toHaveProperty("summary");
    expect(data).toHaveProperty("distribution");
  });

  test("returns correct summary statistics", async () => {
    mockRepository.findAll.mockResolvedValue(mockRecords);

    const request = createMockRequest("http://localhost:3000/api/analytics");
    const response = (await GET(request as never)) as Response;
    const data = await response.json();

    expect(data.summary.totalRecords).toBe(3);
    expect(data.summary.overallAvg).toBeCloseTo(4, 1);
    expect(data.summary.emotionRange.min).toBe(3);
    expect(data.summary.emotionRange.max).toBe(5);
    expect(data.summary.trendDirection).toMatch(/up|down|stable/);
  });

  test("returns correct distribution counts", async () => {
    mockRepository.findAll.mockResolvedValue(mockRecords);

    const request = createMockRequest("http://localhost:3000/api/analytics");
    const response = (await GET(request as never)) as Response;
    const data = await response.json();

    expect(data.distribution.excellent).toBe(1);
    expect(data.distribution.good).toBe(1);
    expect(data.distribution.poor).toBe(0);
  });

  test("handles empty records gracefully", async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const request = createMockRequest("http://localhost:3000/api/analytics");
    const response = (await GET(request as never)) as Response;
    const data = await response.json();

    expect(data.trend).toEqual([]);
    expect(data.summary.totalRecords).toBe(0);
    expect(data.summary.overallAvg).toBe(0);
  });

  test("filters by student when parameter provided", async () => {
    mockRepository.findAll.mockResolvedValue(mockRecords);

    const request = createMockRequest(
      "http://localhost:3000/api/analytics?student=Alice",
    );
    const response = (await GET(request as never)) as Response;
    const data = await response.json();

    expect(data.summary.totalRecords).toBe(2);
    expect(data.summary.overallAvg).toBeCloseTo(4.5, 1);
  });

  test("respects months parameter for filtering", async () => {
    const oldRecords = [
      {
        id: 1,
        emotion: 2,
        date: new Date("2025-01-01"),
        student: "OldStudent",
        comment: "Old",
        createdAt: new Date("2025-01-01T10:00:00Z"),
        updatedAt: new Date("2025-01-01T10:00:00Z"),
      },
      ...mockRecords,
    ];
    mockRepository.findAll.mockResolvedValue(oldRecords);

    const request = createMockRequest(
      "http://localhost:3000/api/analytics?months=1",
    );
    const response = (await GET(request as never)) as Response;
    const data = await response.json();

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 1);

    for (const record of oldRecords) {
      const recordDate = new Date(record.date);
      if (recordDate >= cutoffDate) {
        expect(data.summary.totalRecords).toBeGreaterThan(0);
      }
    }
  });

  test("validates months parameter bounds", async () => {
    mockRepository.findAll.mockResolvedValue(mockRecords);

    const request = createMockRequest(
      "http://localhost:3000/api/analytics?months=25",
    );
    const response = (await GET(request as never)) as Response;

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test("validates granularity parameter", async () => {
    mockRepository.findAll.mockResolvedValue(mockRecords);

    const request = createMockRequest(
      "http://localhost:3000/api/analytics?granularity=invalid",
    );
    const response = (await GET(request as never)) as Response;

    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
