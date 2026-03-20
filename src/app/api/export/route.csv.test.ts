import "./route.test.setup";
import { GET } from "./route";
import {
  createMockRequest,
  mockRecords,
  mockRepository,
} from "./route.test.setup";
import type { Record } from "@/schemas/api";

describe("GET /api/export - CSV formatting", () => {
  test("includes correct CSV headers", async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const request = createMockRequest("http://localhost:3000/api/export");
    const response = (await GET(request as never)) as Response;
    const text = await response.text();

    const lines = text.split("\n");
    expect(lines[0]).toBe(
      "ID,Emotion,Date,Student,Comment,CreatedAt,UpdatedAt",
    );
  });

  test("properly formats dates in ISO format", async () => {
    mockRepository.findAll.mockResolvedValue(mockRecords);

    const request = createMockRequest("http://localhost:3000/api/export");
    const response = (await GET(request as never)) as Response;
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
    const response = (await GET(request as never)) as Response;
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
    const response = (await GET(request as never)) as Response;
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
    const response = (await GET(request as never)) as Response;
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
    const response = (await GET(request as never)) as Response;
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
    const response = (await GET(request as never)) as Response;
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
    const response = (await GET(request as never)) as Response;
    const text = await response.text();

    expect(text).toMatch(/,4,2026-03-20,Alice,Test(,|)/);
  });
});
