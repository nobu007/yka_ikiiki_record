import { validateRequestBody } from "./validation";
import { z } from "zod";

describe("validation - Request Body", () => {
  const testSchema = z.object({
    name: z.string().min(1),
    age: z.number().min(0),
    email: z.string().email().optional(),
  });

  describe("validateRequestBody", () => {
    it("should validate valid JSON request body", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          name: "Test User",
          age: 30,
        }),
      } as unknown as Request;

      const [result, error] = await validateRequestBody(
        mockRequest,
        testSchema,
      );

      expect(result).toEqual({ name: "Test User", age: 30 });
      expect(error).toBeNull();
    });

    it("should return error for invalid request body", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          name: "",
          age: -1,
        }),
      } as unknown as Request;

      const [result, error] = await validateRequestBody(
        mockRequest,
        testSchema,
      );

      expect(result).toBeNull();
      expect(error).toBeDefined();
    });

    it("should handle malformed JSON", async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValueOnce(new Error("Invalid JSON")),
      } as unknown as Request;

      const [result, error] = await validateRequestBody(
        mockRequest,
        testSchema,
      );

      expect(result).toBeNull();
      expect(error).toBe("リクエストボディの解析に失敗しました");
    });

    it("should handle empty request body", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce(null),
      } as unknown as Request;

      const [result, error] = await validateRequestBody(
        mockRequest,
        testSchema,
      );

      expect(result).toBeNull();
      expect(error).toBeDefined();
    });

    it("should handle request body with extra fields", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          name: "Test User",
          age: 30,
          extraField: "should be ignored",
        }),
      } as unknown as Request;

      const [result, error] = await validateRequestBody(
        mockRequest,
        testSchema,
      );

      expect(error).toBeNull();
      expect(result?.name).toBe("Test User");
    });
  });
});
