import {
  renderDashboardHook,
  executeHandleGenerate,
  expectErrorState,
  clearAllMocks,
  mockValidationResponse,
  createMockResponse,
  setupMockFetch,
  setupMockFetchError,
} from "./useDashboard.test.helpers";

global.fetch = jest.fn();

describe("useDashboard - Edge Cases and Network Errors", () => {
  beforeEach(() => {
    clearAllMocks();
  });

  it("should handle network error", async () => {
    setupMockFetchError(new Error("Network error"));

    const { result } = renderDashboardHook();

    await executeHandleGenerate(result);

    expectErrorState(result);
  });

  it("should handle validation error", async () => {
    setupMockFetch(createMockResponse(true, 200, "OK", mockValidationResponse));

    const { result } = renderDashboardHook();

    await executeHandleGenerate(result);

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.notification.type).toBe("error");
  });

  it("should handle timeout error", async () => {
    setupMockFetchError(new Error("Request timeout"));

    const { result } = renderDashboardHook();

    await executeHandleGenerate(result);

    expectErrorState(result);
  });
});
