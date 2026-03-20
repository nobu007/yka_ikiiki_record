import { renderHook, act } from "@testing-library/react";
import { useSeedGeneration } from "./useSeedGeneration";
import { DataGenerationConfig } from "@/domain/entities/DataGeneration";
import { AppError, NetworkError } from "@/lib/error-handler";

// Mock validation module
const mockValidateDataSafe = jest.fn();
jest.mock("@/lib/api/validation", () => ({
  validateDataSafe: (...args: unknown[]) => mockValidateDataSafe(...args),
}));

const createMockConfig = (
  overrides: Partial<DataGenerationConfig> = {},
): DataGenerationConfig => ({
  studentCount: 10,
  periodDays: 30,
  distributionPattern: "normal",
  seasonalEffects: false,
  eventEffects: [],
  classCharacteristics: {
    volatility: 0.5,
    baselineEmotion: 3.0,
    cohesion: 0.7,
  },
  ...overrides,
});

describe("useSeedGeneration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default successful validation
    mockValidateDataSafe.mockImplementation((data: unknown) => [data, null]);
  });

  describe("basic functionality", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(() => useSeedGeneration());

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.generateSeed).toBe("function");
    });

    it("should handle successful data generation", async () => {
      const mockResponse = { success: true, message: "Data generated" };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useSeedGeneration());
      const mockConfig = createMockConfig();

      await act(async () => {
        await result.current.generateSeed(mockConfig);
      });

      expect(fetch).toHaveBeenCalledWith("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: mockConfig }),
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe("error handling", () => {
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

    it("should handle validation error with custom message", async () => {
      // Mock validateDataSafe to return validation error
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
      expect(result.current.error?.message).toContain("Custom validation failed");
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
      (fetch as jest.Mock).mockRejectedValueOnce(new TypeError("Network error"));

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

  describe("loading state", () => {
    it("should set loading state correctly during generation", async () => {
      let resolvePromise: (value: unknown) => void;
      const mockPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (fetch as jest.Mock).mockReturnValueOnce(mockPromise);

      const { result } = renderHook(() => useSeedGeneration());
      const mockConfig = createMockConfig();

      let generationPromise: Promise<void>;

      await act(async () => {
        generationPromise = result.current.generateSeed(mockConfig);
      });

      expect(result.current.isGenerating).toBe(true);
      expect(result.current.error).toBe(null);

      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({ success: true, message: "Data generated" }),
        });
        await generationPromise!;
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe("edge cases", () => {
    it("should handle validation error with null validated and null validationError (line 31 default message)", async () => {
      // Mock validateDataSafe to return [null, null]
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
      // Mock validateDataSafe to return validated object with success=false and custom error
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
      // Mock validateDataSafe to return validated object with success=false and no error
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
      expect(result.current.error?.message).toContain("データ生成に失敗しました");
    });
  });
});
