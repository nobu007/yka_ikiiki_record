import { renderHook, act } from "@testing-library/react";
import { useNotification } from "./useNotification";

describe("useNotification", () => {
  it("should initialize with default notification state", () => {
    const { result } = renderHook(() => useNotification());

    expect(result.current.notification).toEqual({
      show: false,
      message: "",
      type: "success",
    });
  });

  it("should show success notification", () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showSuccess("Success message");
    });

    expect(result.current.notification).toEqual({
      show: true,
      message: "Success message",
      type: "success",
    });
  });

  it("should show error notification", () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showError("Error message");
    });

    expect(result.current.notification).toEqual({
      show: true,
      message: "Error message",
      type: "error",
    });
  });

  it("should show warning notification", () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showWarning("Warning message");
    });

    expect(result.current.notification).toEqual({
      show: true,
      message: "Warning message",
      type: "warning",
    });
  });

  it("should show info notification", () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showInfo("Info message");
    });

    expect(result.current.notification).toEqual({
      show: true,
      message: "Info message",
      type: "info",
    });
  });

  it("should clear notification", () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showSuccess("Test message");
    });

    expect(result.current.notification.show).toBe(true);

    act(() => {
      result.current.clearNotification();
    });

    expect(result.current.notification.show).toBe(false);
    expect(result.current.notification.message).toBe("Test message");
    expect(result.current.notification.type).toBe("success");
  });

  it("should override existing notification", () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showInfo("First message");
    });

    act(() => {
      result.current.showError("Second message");
    });

    expect(result.current.notification).toEqual({
      show: true,
      message: "Second message",
      type: "error",
    });
  });
});
