import "./route.test.setup";
import { GET } from "./route";
import {
  createMockRequest,
  mockRepository,
} from "./route.test.setup";

describe("GET /api/export - error handling", () => {
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
