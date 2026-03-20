import "./route.test.setup";
import { GET } from "./route";
import {
  createMockRequest,
  mockRecords,
  mockRepository,
} from "./route.test.setup";

describe("GET /api/export - query parameter handling", () => {
  test("returns all records when no query parameters provided", async () => {
    mockRepository.findAll.mockResolvedValue(mockRecords);

    const request = createMockRequest("http://localhost:3000/api/export");
    const response = (await GET(request as never)) as Response;
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/csv; charset=utf-8",
    );
    expect(response.headers.get("Content-Disposition")).toMatch(
      /attachment; filename="records-\d+\.csv"/,
    );
    expect(text).toContain(
      "ID,Emotion,Date,Student,Comment,CreatedAt,UpdatedAt",
    );
    expect(text).toContain(
      "1,4,2026-03-20,Alice,Good work,2026-03-20,2026-03-20",
    );
    expect(text).toContain(
      "2,3,2026-03-19,Bob,Needs improvement,2026-03-19,2026-03-19",
    );
  });

  test("returns filtered records by date range when startDate and endDate provided", async () => {
    const filteredRecords = [mockRecords[0]];
    mockRepository.findByDateRange.mockResolvedValue(filteredRecords);

    const startDate = "2026-03-20";
    const endDate = "2026-03-20";
    const request = createMockRequest(
      `http://localhost:3000/api/export?startDate=${startDate}&endDate=${endDate}`,
    );
    const response = (await GET(request as never)) as Response;
    const text = await response.text();

    expect(mockRepository.findByDateRange).toHaveBeenCalledWith(
      new Date(startDate),
      new Date(endDate),
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
      `http://localhost:3000/api/export?student=${encodeURIComponent(student)}`,
    );
    const response = (await GET(request as never)) as Response;
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
      "http://localhost:3000/api/export?startDate=2026-03-20&endDate=2026-03-20&student=Bob",
    );
    const response = (await GET(request as never)) as Response;

    expect(mockRepository.findByDateRange).toHaveBeenCalled();
    expect(mockRepository.findByStudent).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });
});
