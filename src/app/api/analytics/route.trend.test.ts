import "./route.test.setup";
import { GET } from "./route";
import {
  createMockRequest,
  mockRecords,
  mockRepository,
} from "./route.test.setup";

describe("GET /api/analytics - Trend analysis", () => {
  test("detects upward trend", async () => {
    const increasingRecords = [
      {
        id: 1,
        emotion: 2,
        date: new Date("2026-01-01"),
        student: "Alice",
        comment: "Low",
        createdAt: new Date("2026-01-01T10:00:00Z"),
        updatedAt: new Date("2026-01-01T10:00:00Z"),
      },
      {
        id: 2,
        emotion: 3,
        date: new Date("2026-02-01"),
        student: "Alice",
        comment: "Medium",
        createdAt: new Date("2026-02-01T10:00:00Z"),
        updatedAt: new Date("2026-02-01T10:00:00Z"),
      },
      {
        id: 3,
        emotion: 5,
        date: new Date("2026-03-01"),
        student: "Alice",
        comment: "High",
        createdAt: new Date("2026-03-01T10:00:00Z"),
        updatedAt: new Date("2026-03-01T10:00:00Z"),
      },
    ];
    mockRepository.findAll.mockResolvedValue(increasingRecords);

    const request = createMockRequest(
      "http://localhost:3000/api/analytics?granularity=month",
    );
    const response = (await GET(request as never)) as Response;
    const data = await response.json();

    expect(data.summary.trendDirection).toBe("up");
  });

  test("detects downward trend", async () => {
    const decreasingRecords = [
      {
        id: 1,
        emotion: 5,
        date: new Date("2026-01-01"),
        student: "Bob",
        comment: "High",
        createdAt: new Date("2026-01-01T10:00:00Z"),
        updatedAt: new Date("2026-01-01T10:00:00Z"),
      },
      {
        id: 2,
        emotion: 3,
        date: new Date("2026-02-01"),
        student: "Bob",
        comment: "Medium",
        createdAt: new Date("2026-02-01T10:00:00Z"),
        updatedAt: new Date("2026-02-01T10:00:00Z"),
      },
      {
        id: 3,
        emotion: 2,
        date: new Date("2026-03-01"),
        student: "Bob",
        comment: "Low",
        createdAt: new Date("2026-03-01T10:00:00Z"),
        updatedAt: new Date("2026-03-01T10:00:00Z"),
      },
    ];
    mockRepository.findAll.mockResolvedValue(decreasingRecords);

    const request = createMockRequest(
      "http://localhost:3000/api/analytics?granularity=month",
    );
    const response = (await GET(request as never)) as Response;
    const data = await response.json();

    expect(data.summary.trendDirection).toBe("down");
  });

  test("detects stable trend", async () => {
    const stableRecords = [
      {
        id: 1,
        emotion: 4,
        date: new Date("2026-01-01"),
        student: "Charlie",
        comment: "Stable1",
        createdAt: new Date("2026-01-01T10:00:00Z"),
        updatedAt: new Date("2026-01-01T10:00:00Z"),
      },
      {
        id: 2,
        emotion: 4,
        date: new Date("2026-02-01"),
        student: "Charlie",
        comment: "Stable2",
        createdAt: new Date("2026-02-01T10:00:00Z"),
        updatedAt: new Date("2026-02-01T10:00:00Z"),
      },
      {
        id: 3,
        emotion: 4,
        date: new Date("2026-03-01"),
        student: "Charlie",
        comment: "Stable3",
        createdAt: new Date("2026-03-01T10:00:00Z"),
        updatedAt: new Date("2026-03-01T10:00:00Z"),
      },
    ];
    mockRepository.findAll.mockResolvedValue(stableRecords);

    const request = createMockRequest(
      "http://localhost:3000/api/analytics?granularity=month",
    );
    const response = (await GET(request as never)) as Response;
    const data = await response.json();

    expect(data.summary.trendDirection).toBe("stable");
  });

  test("returns stable for insufficient data", async () => {
    mockRepository.findAll.mockResolvedValue([mockRecords[0]]);

    const request = createMockRequest("http://localhost:3000/api/analytics");
    const response = (await GET(request as never)) as Response;
    const data = await response.json();

    expect(data.summary.trendDirection).toBe("stable");
  });

  test("sorts trend data chronologically", async () => {
    mockRepository.findAll.mockResolvedValue(mockRecords);

    const request = createMockRequest(
      "http://localhost:3000/api/analytics?granularity=day",
    );
    const response = (await GET(request as never)) as Response;
    const data = await response.json();

    if (data.trend.length > 1) {
      const periods = data.trend.map((t: { period: string }) => t.period);
      const sortedPeriods = [...periods].sort();
      expect(periods).toEqual(sortedPeriods);
    }
  });
});
