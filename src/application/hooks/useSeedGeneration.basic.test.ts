import { renderHook, act } from "@testing-library/react";
import { useSeedGeneration } from "./useSeedGeneration";
import { createMockConfig, clearAllMocks } from "./useSeedGeneration.test.setup";

jest.mock("@/lib/api/validation", () => ({
  validateDataSafe: (...args: unknown[]) =>
    require("./useSeedGeneration.test.setup").mockValidateDataSafe(...args),
}));

describe("useSeedGeneration", () => {
  beforeEach(() => {
    clearAllMocks();
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
});
