import { renderHook, act, waitFor } from '@testing-library/react';
import { useDashboard } from './useApp';
import { MESSAGES } from '@/lib/config';

export const mockSuccessResponse = {
  success: true,
  data: {
    overview: { count: 100, avgEmotion: 75.5 },
    monthlyStats: [],
    dayOfWeekStats: [],
    emotionDistribution: [],
    timeOfDayStats: [],
    studentStats: []
  }
};

export const mockErrorResponse = {
  success: false,
  error: 'Generation failed'
};

export const mockValidationResponse = {
  invalid: 'data'
};

export const setupMockFetch = (response: any, delay?: number) => {
  if (delay) {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => {
        setTimeout(() => {
          resolve(response);
        }, delay);
      })
    );
  } else {
    (global.fetch as jest.Mock).mockResolvedValueOnce(response);
  }
};

export const setupMockFetchError = (error: Error) => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(error);
};

export const createMockResponse = (ok: boolean, status: number, statusText: string, data?: any) => ({
  ok,
  status,
  statusText,
  ...(data && { json: async () => data })
});

export const renderDashboardHook = () => renderHook(() => useDashboard());

export const executeHandleGenerate = async (result: any) => {
  await act(async () => {
    await result.current.handleGenerate();
  });
};

export const waitForGenerationComplete = async (result: any) => {
  await waitFor(() => {
    expect(result.current.isGenerating).toBe(false);
  });
};

export const expectDefaultState = (result: any) => {
  expect(result.current.isGenerating).toBe(false);
  expect(result.current.notification).toEqual({
    show: false,
    message: '',
    type: 'info'
  });
  expect(result.current.isLoadingMessage).toBeNull();
};

export const expectSuccessState = (result: any) => {
  expect(result.current.isGenerating).toBe(false);
  expect(result.current.notification).toEqual({
    show: true,
    message: MESSAGES.success.dataGeneration,
    type: 'success'
  });
  expect(result.current.isLoadingMessage).toBeNull();
};

export const expectErrorState = (result: any) => {
  expect(result.current.isGenerating).toBe(false);
  expect(result.current.notification.show).toBe(true);
  expect(result.current.notification.type).toBe('error');
  expect(result.current.isLoadingMessage).toBeNull();
};

export const expectLoadingState = (result: any) => {
  expect(result.current.isGenerating).toBe(true);
  expect(result.current.isLoadingMessage).toBe(MESSAGES.loading.generating);
};

export const clearAllMocks = () => {
  jest.clearAllMocks();
};

export {
  renderHook,
  act,
  waitFor,
  useDashboard,
  MESSAGES
};
