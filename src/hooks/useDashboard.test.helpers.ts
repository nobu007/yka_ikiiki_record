import { renderHook, act, waitFor } from "@testing-library/react";
import { useDashboard } from "./useApp";
import { SUCCESS_MESSAGES, LOADING_MESSAGES } from "@/lib/constants/messages";

export const mockSuccessResponse = {
  success: true,
  data: {
    overview: { count: 100, avgEmotion: 75.5 },
    monthlyStats: [],
    dayOfWeekStats: [],
    emotionDistribution: [],
    timeOfDayStats: [],
    studentStats: [],
  },
};

export const mockErrorResponse = {
  success: false,
  error: "Generation failed",
};

export const mockValidationResponse = {
  invalid: "data",
};

export const setupMockFetch = (response: unknown, delay?: number) => {
  if (delay) {
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(response);
          }, delay);
        }),
    );
  } else {
    (global.fetch as jest.Mock).mockResolvedValueOnce(response);
  }
};

export const setupMockFetchError = (error: Error) => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(error);
};

export const createMockResponse = (
  ok: boolean,
  status: number,
  statusText: string,
  data?: unknown,
) => ({
  ok,
  status,
  statusText,
  ...(data !== undefined && { json: async () => data }),
});

export const renderDashboardHook = () => renderHook(() => useDashboard());

export const executeHandleGenerate = async (
  result: ReturnType<typeof renderDashboardHook>["result"],
) => {
  await act(async () => {
    await result.current.handleGenerate();
  });
};

export const _waitForGenerationComplete = async (
  result: ReturnType<typeof renderDashboardHook>["result"],
) => {
  await waitFor(() => {
    expect(result.current.isGenerating).toBe(false);
  });
};

export const expectDefaultState = (
  result: ReturnType<typeof renderDashboardHook>["result"],
) => {
  expect(result.current.isGenerating).toBe(false);
  expect(result.current.notification).toEqual({
    show: false,
    message: "",
    type: "success",
  });
  expect(result.current.isLoadingMessage).toBeNull();
};

export const expectSuccessState = (
  result: ReturnType<typeof renderDashboardHook>["result"],
) => {
  expect(result.current.isGenerating).toBe(false);
  expect(result.current.notification).toEqual({
    show: true,
    message: SUCCESS_MESSAGES.DATA_GENERATION_COMPLETE,
    type: "success",
  });
  expect(result.current.isLoadingMessage).toBeNull();
};

export const expectErrorState = (
  result: ReturnType<typeof renderDashboardHook>["result"],
) => {
  expect(result.current.isGenerating).toBe(false);
  expect(result.current.notification.show).toBe(true);
  expect(result.current.notification.type).toBe("error");
  expect(result.current.isLoadingMessage).toBeNull();
};

export const expectLoadingState = (
  result: ReturnType<typeof renderDashboardHook>["result"],
) => {
  expect(result.current.isGenerating).toBe(true);
  expect(result.current.isLoadingMessage).toBe(
    LOADING_MESSAGES.GENERATING_DATA,
  );
};

export const clearAllMocks = () => {
  jest.clearAllMocks();
};

export { renderHook, act, waitFor, useDashboard };
