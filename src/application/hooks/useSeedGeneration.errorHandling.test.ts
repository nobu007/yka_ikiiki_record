import { renderHook, act } from "@testing-library/react";
import { useSeedGeneration } from "./useSeedGeneration";
import { AppError, NetworkError } from "@/lib/error-handler";
import {
  createMockConfig,
  clearAllMocks,
  mockValidateDataSafe,
} from "./useSeedGeneration.test.setup";

jest.mock("@/lib/api/validation", () => ({
  validateDataSafe: (...args: unknown[]) =>
    require("./useSeedGeneration.test.setup").mockValidateDataSafe(...args),
}));

describe("useSeedGeneration error handling", () => {
  beforeEach(() => {
    clearAllMocks();
  });

  describe("network and API errors", () => {
    it("should handle network error", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const { result } = renderHook(() => useSeedGeneration());
      const mockConfig = createMockConfig();

      await act(async () => {
        try {
          await result.current.generateSeed(mockConfig);
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeInstanceOf(NetworkError);
    });

    it("should handle API error response", async () => {
      const mockResponse = { success: false, error: "Generation failed" };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useSeedGeneration());
      const mockConfig = createMockConfig();

      await act(async () => {
        try {
          await result.current.generateSeed(mockConfig);
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeInstanceOf(AppError);
      expect(result.current.error?.message).toBe("Generation failed");
    });

    it("should handle fetch rejection", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(
        new TypeError("Network error"),
      );

      const { result } = renderHook(() => useSeedGeneration());
      const mockConfig = createMockConfig();

      await act(async () => {
        try {
          await result.current.generateSeed(mockConfig);
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeInstanceOf(NetworkError);
    });
  });

  describe("validation errors", () => {
    it("should handle validation error with custom message", async () => {
      mockValidateDataSafe.mockReturnValue([
        null,
        new Error("Custom validation failed"),
      ]);

      const mockResponse = { success: true, message: "Data generated" };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useSeedGeneration());
      const mockConfig = createMockConfig();

      await act(async () => {
        try {
          await result.current.generateSeed(mockConfig);
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeInstanceOf(AppError);
      expect(result.current.error?.message).toContain(
        "Custom validation failed",
      );
    });
  });

  describe("edge cases", () => {
    it("should handle validation error with null validated and null validationError (line 31 default message)", async () => {
      mockValidateDataSafe.mockReturnValue([null, null]);

      const mockResponse = { success: true, message: "Data generated" };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useSeedGeneration());
      const mockConfig = createMockConfig();

      await act(async () => {
        try {
          await result.current.generateSeed(mockConfig);
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeInstanceOf(AppError);
      expect(result.current.error?.message).toContain(
        "API response validation failed",
      );
    });

    it("should handle API error response with custom error message (line 35)", async () => {
      mockValidateDataSafe.mockReturnValue([
        { success: false, error: "Custom generation error from API" },
        null,
      ]);

      const mockResponse = {
        success: false,
        error: "Custom generation error from API",
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useSeedGeneration());
      const mockConfig = createMockConfig();

      await act(async () => {
        try {
          await result.current.generateSeed(mockConfig);
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeInstanceOf(AppError);
      expect(result.current.error?.message).toBe(
        "Custom generation error from API",
      );
    });

    it("should handle API error response with missing error field (line 35 default message)", async () => {
      mockValidateDataSafe.mockReturnValue([{ success: false }, null]);

      const mockResponse = { success: false };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useSeedGeneration());
      const mockConfig = createMockConfig();

      await act(async () => {
        try {
          await result.current.generateSeed(mockConfig);
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeInstanceOf(AppError);
      expect(result.current.error?.message).toContain(
        "データ生成に失敗しました",
      );
    });
  });
});
