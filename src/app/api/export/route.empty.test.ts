import "./route.test.setup";
import { GET } from "./route";
import {
  createMockRequest,
  mockRepository,
} from "./route.test.setup";

describe("GET /api/export - empty result handling", () => {
  test("returns CSV with headers when no records found", async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const request = createMockRequest("http://localhost:3000/api/export");
    const response = await GET(request as never) as Response;
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe("ID,Emotion,Date,Student,Comment,CreatedAt,UpdatedAt\n");
  });
});
