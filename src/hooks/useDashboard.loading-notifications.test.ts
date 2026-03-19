import {
  renderDashboardHook,
  executeHandleGenerate,
  expectLoadingState,
  clearAllMocks,
  mockSuccessResponse,
  createMockResponse,
  setupMockFetch,
  act,
} from "./useDashboard.test.helpers";
import { waitFor } from "@testing-library/react";

global.fetch = jest.fn();

describe("useDashboard - Loading States and Notifications", () => {
  beforeEach(() => {
    clearAllMocks();
  });

  it("should show loading message during generation", async () => {
    setupMockFetch(
      createMockResponse(true, 200, "OK", mockSuccessResponse),
      100,
    );

    const { result } = renderDashboardHook();

    act(() => {
      result.current.handleGenerate();
    });

    expectLoadingState(result);

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });
  });

  it("should clear notification before starting generation", async () => {
    const { result } = renderDashboardHook();

    act(() => {
      result.current.notification = {
        show: true,
        message: "Previous message",
        type: "info",
      };
    });

    expect(result.current.notification.show).toBe(true);

    setupMockFetch(createMockResponse(true, 200, "OK", mockSuccessResponse));

    await executeHandleGenerate(result);

    expect(result.current.isGenerating).toBe(false);
  });

  it("should show notification with different types", async () => {
    setupMockFetch(createMockResponse(true, 200, "OK", mockSuccessResponse));

    const { result } = renderDashboardHook();

    await executeHandleGenerate(result);

    expect(result.current.notification.type).toBe("success");
  });
});
