import "./route.test.setup";
import { GET } from "./route";
import { createMockRequest, mockRepository } from "./route.test.setup";
import type { Record } from "@/schemas/api";

describe("GET /api/export - large dataset handling", () => {
  test("handles large number of records efficiently", async () => {
    const largeDataset: Record[] = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      emotion: Math.floor(Math.random() * 5) + 1,
      date: new Date(`2026-03-${String((i % 28) + 1).padStart(2, "0")}`),
      student: `Student${i % 50}`,
      comment: `Comment ${i}`,
      createdAt: new Date(`2026-03-20T10:00:00Z`),
      updatedAt: new Date(`2026-03-20T10:00:00Z`),
    }));
    mockRepository.findAll.mockResolvedValue(largeDataset);

    const request = createMockRequest("http://localhost:3000/api/export");
    const response = (await GET(request as never)) as Response;
    const text = await response.text();

    expect(response.status).toBe(200);
    const lines = text.split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(1001);
    expect(lines[0]).toContain("ID,Emotion,Date");
  });
});
