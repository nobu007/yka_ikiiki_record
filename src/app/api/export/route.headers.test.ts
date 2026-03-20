import "./route.test.setup";
import { GET } from "./route";
import {
  createMockRequest,
  mockRecords,
  mockRepository,
} from "./route.test.setup";

describe("GET /api/export - HTTP response headers", () => {
  test("sets correct Content-Type header", async () => {
    mockRepository.findAll.mockResolvedValue(mockRecords);

    const request = createMockRequest("http://localhost:3000/api/export");
    const response = await GET(request as never) as Response;

    expect(response.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
  });

  test("sets Content-Disposition header with attachment filename", async () => {
    mockRepository.findAll.mockResolvedValue(mockRecords);

    const request = createMockRequest("http://localhost:3000/api/export");
    const response = await GET(request as never) as Response;
    const contentDisposition = response.headers.get("Content-Disposition");

    expect(contentDisposition).toMatch(/^attachment; filename="records-\d+\.csv"$/);
  });

  test("generates unique filename with timestamp", async () => {
    mockRepository.findAll.mockResolvedValue(mockRecords);

    const request1 = createMockRequest("http://localhost:3000/api/export");
    const response1 = await GET(request1 as never) as Response;
    const filename1 = response1.headers.get("Content-Disposition");

    await new Promise((resolve) => setTimeout(resolve, 10));

    const request2 = createMockRequest("http://localhost:3000/api/export");
    const response2 = await GET(request2 as never) as Response;
    const filename2 = response2.headers.get("Content-Disposition");

    expect(filename1).not.toBe(filename2);
  });
});
