import "./route.test.setup";
import { GET } from "./route";
import {
  createMockRequest,
  mockRecords,
  mockRepository,
} from "./route.test.setup";
import type { Record } from "@/schemas/api";

describe("GET /api/export - Excel formatting", () => {
  test("returns Excel file when format=xlsx", async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const request = createMockRequest(
      "http://localhost:3000/api/export?format=xlsx",
    );
    const response = (await GET(request as never)) as Response;

    expect(response.headers.get("Content-Type")).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    expect(response.headers.get("Content-Disposition")).toMatch(
      /attachment; filename="records-\d+\.xlsx"/,
    );
  });

  test("returns binary data for Excel export", async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const request = createMockRequest(
      "http://localhost:3000/api/export?format=xlsx",
    );
    const response = (await GET(request as never)) as Response;
    const text = await response.text();

    expect(text.length).toBeGreaterThan(0);
  });

  test("includes correct headers in Excel file", async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const request = createMockRequest(
      "http://localhost:3000/api/export?format=xlsx",
    );
    const response = (await GET(request as never)) as Response;

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  });

  test("includes record data in Excel file", async () => {
    mockRepository.findAll.mockResolvedValue(mockRecords);

    const request = createMockRequest(
      "http://localhost:3000/api/export?format=xlsx",
    );
    const response = (await GET(request as never)) as Response;

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text.length).toBeGreaterThan(1000);
  });

  test("handles empty records for Excel export", async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const request = createMockRequest(
      "http://localhost:3000/api/export?format=xlsx",
    );
    const response = (await GET(request as never)) as Response;

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text.length).toBeGreaterThan(0);
  });

  test("defaults to CSV when format is not specified", async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const request = createMockRequest("http://localhost:3000/api/export");
    const response = (await GET(request as never)) as Response;

    expect(response.headers.get("Content-Type")).toContain("text/csv");
  });

  test("supports date range filtering with Excel format", async () => {
    const dateRecords: Record[] = [
      {
        id: 1,
        emotion: 4,
        date: new Date("2026-03-20"),
        student: "Alice",
        comment: "Test",
        createdAt: new Date("2026-03-20T10:00:00Z"),
        updatedAt: new Date("2026-03-20T10:00:00Z"),
      },
    ];
    mockRepository.findByDateRange.mockResolvedValue(dateRecords);

    const request = createMockRequest(
      "http://localhost:3000/api/export?startDate=2026-03-01&endDate=2026-03-31&format=xlsx",
    );
    const response = (await GET(request as never)) as Response;

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  });

  test("supports student filtering with Excel format", async () => {
    const studentRecords: Record[] = [
      {
        id: 1,
        emotion: 4,
        date: new Date("2026-03-20"),
        student: "Alice",
        comment: "Test",
        createdAt: new Date("2026-03-20T10:00:00Z"),
        updatedAt: new Date("2026-03-20T10:00:00Z"),
      },
    ];
    mockRepository.findByStudent.mockResolvedValue(studentRecords);

    const request = createMockRequest(
      "http://localhost:3000/api/export?student=Alice&format=xlsx",
    );
    const response = (await GET(request as never)) as Response;

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  });

  test("handles records with special characters in Excel format", async () => {
    const specialRecords: Record[] = [
      {
        id: 1,
        emotion: 4,
        date: new Date("2026-03-20"),
        student: "Doe, John",
        comment: 'Said "Hello"',
        createdAt: new Date("2026-03-20T10:00:00Z"),
        updatedAt: new Date("2026-03-20T10:00:00Z"),
      },
    ];
    mockRepository.findAll.mockResolvedValue(specialRecords);

    const request = createMockRequest(
      "http://localhost:3000/api/export?format=xlsx",
    );
    const response = (await GET(request as never)) as Response;

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text.length).toBeGreaterThan(0);
  });

  test("Excel file size increases with more records", async () => {
    const smallRecords: Record[] = [
      {
        id: 1,
        emotion: 4,
        date: new Date("2026-03-20"),
        student: "Alice",
        comment: "Test",
        createdAt: new Date("2026-03-20T10:00:00Z"),
        updatedAt: new Date("2026-03-20T10:00:00Z"),
      },
    ];

    const largeRecords: Record[] = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      emotion: 4,
      date: new Date("2026-03-20"),
      student: `Student${i}`,
      comment: `Comment${i}`,
      createdAt: new Date("2026-03-20T10:00:00Z"),
      updatedAt: new Date("2026-03-20T10:00:00Z"),
    }));

    mockRepository.findAll.mockResolvedValueOnce(smallRecords);
    const smallRequest = createMockRequest(
      "http://localhost:3000/api/export?format=xlsx",
    );
    const smallResponse = (await GET(smallRequest as never)) as Response;
    const smallText = await smallResponse.text();

    mockRepository.findAll.mockResolvedValueOnce(largeRecords);
    const largeRequest = createMockRequest(
      "http://localhost:3000/api/export?format=xlsx",
    );
    const largeResponse = (await GET(largeRequest as never)) as Response;
    const largeText = await largeResponse.text();

    expect(largeText.length).toBeGreaterThan(smallText.length);
  });
});
