import { renderHook, act } from "@testing-library/react";
import { useDashboard } from "./useApp";
import { validateDataSafe } from "@/lib/api/validation";

global.fetch = jest.fn();

jest.mock("@/lib/api/validation", () => ({
  validateDataSafe: jest.fn(),
}));

const mockValidateDataSafe = validateDataSafe as jest.MockedFunction<
  typeof validateDataSafe
>;

describe("useDashboard - Validation Error Branches (lines 39, 72)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateDataSafe.mockImplementation((data: unknown) => [data, null]);
  });

  it("should handle validation error with null validated and null validationError (line 72 default message)", async () => {
    mockValidateDataSafe.mockReturnValue([null, null]);

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: "Data generated" }),
    });

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.type).toBe("error");
    expect(result.current.notification.message).toContain(
      "API response validation failed",
    );
  });

  it("should handle validation error with custom validationError message (line 72)", async () => {
    mockValidateDataSafe.mockReturnValue([null, "Custom validation failure"]);

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: "Data generated" }),
    });

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.type).toBe("error");
    expect(result.current.notification.message).toContain(
      "Custom validation failure",
    );
  });

  it("should handle API response with success=false and custom error (line 72)", async () => {
    mockValidateDataSafe.mockReturnValue([
      { success: false, error: "Custom API error message" },
      null,
    ]);

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, error: "Custom API error message" }),
    });

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.type).toBe("error");
    expect(result.current.notification.message).toContain(
      "データ生成に失敗しました",
    );
  });

  it("should handle API response with success=false and no error field (line 72 default)", async () => {
    mockValidateDataSafe.mockReturnValue([{ success: false }, null]);

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false }),
    });

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.type).toBe("error");
    expect(result.current.notification.message).toContain(
      "データ生成に失敗しました",
    );
  });

  it("should call showNotification with default type (line 39)", async () => {
    mockValidateDataSafe.mockImplementation((data: unknown) => [data, null]);

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: "Data generated" }),
    });

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.type).toBe("success");
    expect(result.current.notification.message).toContain(
      "テストデータの生成が完了しました",
    );
  });
});
