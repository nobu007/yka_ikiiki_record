import "./route.test.setup";
import { GET } from "./route";
import {
  createMockRequest,
  mockRecords,
  mockRepository,
} from "./route.test.setup";

describe("GET /api/analytics - Granularity options", () => {
  test("groups data by day when granularity=day", async () => {
    mockRepository.findAll.mockResolvedValue(mockRecords);

    const request = createMockRequest(
      "http://localhost:3000/api/analytics?granularity=day",
    );
    const response = (await GET(request as never)) as Response;
    const data = await response.json();

    expect(data.trend.length).toBeGreaterThan(0);
    expect(data.trend[0]).toHaveProperty("period");
    expect(data.trend[0]).toHaveProperty("avgEmotion");
    expect(data.trend[0]).toHaveProperty("count");
  });

  test("groups data by week when granularity=week", async () => {
    mockRepository.findAll.mockResolvedValue(mockRecords);

    const request = createMockRequest(
      "http://localhost:3000/api/analytics?granularity=week",
    );
    const response = (await GET(request as never)) as Response;
    const data = await response.json();

    expect(data.trend.length).toBeGreaterThan(0);
    expect(data.trend[0].period).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("groups data by month when granularity=month", async () => {
    mockRepository.findAll.mockResolvedValue(mockRecords);

    const request = createMockRequest(
      "http://localhost:3000/api/analytics?granularity=month",
    );
    const response = (await GET(request as never)) as Response;
    const data = await response.json();

    expect(data.trend.length).toBeGreaterThan(0);
    expect(data.trend[0].period).toMatch(/^\d{4}-\d{2}$/);
  });

  test("returns different trend lengths for different granularities", async () => {
    const manyRecords = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      emotion: 3 + Math.random() * 2,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      student: `Student${i % 10}`,
      comment: `Comment${i}`,
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    }));
    mockRepository.findAll.mockResolvedValue(manyRecords);

    const dayRequest = createMockRequest(
      "http://localhost:3000/api/analytics?granularity=day",
    );
    const dayResponse = (await GET(dayRequest as never)) as Response;
    const dayData = await dayResponse.json();

    const monthRequest = createMockRequest(
      "http://localhost:3000/api/analytics?granularity=month",
    );
    const monthResponse = (await GET(monthRequest as never)) as Response;
    const monthData = await monthResponse.json();

    expect(monthData.trend.length).toBeLessThan(dayData.trend.length);
  });

  test("calculates correct averages per period", async () => {
    const recordsWithSameDay = [
      {
        id: 1,
        emotion: 4,
        date: new Date("2026-03-20"),
        student: "Alice",
        comment: "Test1",
        createdAt: new Date("2026-03-20T10:00:00Z"),
        updatedAt: new Date("2026-03-20T10:00:00Z"),
      },
      {
        id: 2,
        emotion: 5,
        date: new Date("2026-03-20"),
        student: "Bob",
        comment: "Test2",
        createdAt: new Date("2026-03-20T10:00:00Z"),
        updatedAt: new Date("2026-03-20T10:00:00Z"),
      },
    ];
    mockRepository.findAll.mockResolvedValue(recordsWithSameDay);

    const request = createMockRequest(
      "http://localhost:3000/api/analytics?granularity=day",
    );
    const response = (await GET(request as never)) as Response;
    const data = await response.json();

    const dayEntry = data.trend.find((t: { period: string }) =>
      t.period === "2026-03-20"
    );
    expect(dayEntry).toBeDefined();
    expect(dayEntry.avgEmotion).toBe(4.5);
    expect(dayEntry.count).toBe(2);
  });
});
