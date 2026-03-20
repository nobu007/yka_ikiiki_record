import "./route.test.setup";
import { GET } from "./route";
import {
  createMockRequest,
  mockRepository,
} from "./route.test.setup";
import type { Record } from "@/schemas/api";

describe("GET /api/export - data integrity", () => {
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
