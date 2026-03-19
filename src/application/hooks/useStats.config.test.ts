import { renderHook } from '@testing-library/react';
import { useStats } from './useStats';
import { withApiTimeout } from '@/lib/resilience/timeout';
import { StatsResponse } from '@/schemas/api';

jest.mock('@/lib/resilience/timeout', () => ({
  withApiTimeout: jest.fn(),
}));

jest.mock('swr', () => {
  const mockMutate = jest.fn();
  return {
    __esModule: true,
    default: jest.fn(() => ({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: mockMutate,
    })),
  };
});

const mockWithApiTimeout = withApiTimeout as jest.MockedFunction<typeof withApiTimeout>;
type UseSWRResponse<T> = {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => Promise<void>;
};

const mockUseSWR = require('swr').default as jest.MockedFunction<
  (key: string, fetcher: () => Promise<StatsResponse>, config?: unknown) => UseSWRResponse<StatsResponse>
>;

describe('useStats SWR configuration', () => {
  const mockStatsData = {
    success: true,
    data: {
      overview: {
        count: 100,
        avgEmotion: 3.5,
      },
      monthlyStats: [
        { month: '1月', avgEmotion: 3.2, count: 10 },
        { month: '2月', avgEmotion: 3.8, count: 15 },
      ],
      dayOfWeekStats: [
        { day: '日', avgEmotion: 3.5, count: 15 },
        { day: '月', avgEmotion: 3.4, count: 14 },
      ],
      timeOfDayStats: {
        morning: 3.6,
        afternoon: 3.4,
        evening: 3.2,
      },
      studentStats: [
        {
          student: 'Test Student',
          avgEmotion: 3.5,
          recordCount: 10,
          trendline: [3.0, 3.2, 3.5, 3.4, 3.6],
        },
      ],
      emotionDistribution: [10, 20, 30, 25, 15],
    },
  };

  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: mockMutate,
    });
  });

  describe('SWR configuration', () => {
    it('should pass correct URL to useSWR', () => {
      mockUseSWR.mockReturnValue({
        data: mockStatsData,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      renderHook(() => useStats());

      expect(mockUseSWR).toHaveBeenCalledWith(
        '/api/stats',
        expect.any(Function),
        expect.objectContaining({
          onError: expect.any(Function),
        })
      );
    });

    it('should use custom fetcher function', () => {
      mockUseSWR.mockReturnValue({
        data: mockStatsData,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      renderHook(() => useStats());

      const fetcher = mockUseSWR.mock.calls[0]?.[1];
      expect(typeof fetcher).toBe('function');
    });

    it('should handle onError callback from SWR', () => {
      renderHook(() => useStats());

      const config = mockUseSWR.mock.calls[0]?.[2] as { onError?: (error: Error) => void } | undefined;
      const onErrorCallback = config?.onError;
      expect(typeof onErrorCallback).toBe('function');

      const testError = new Error('Test error');
      expect(() => onErrorCallback?.(testError)).not.toThrow();
    });
  });

  describe('fetcher function behavior', () => {
    it('should call withApiTimeout with fetch promise', async () => {
      const mockResponse = {
        ok: true,
        json: async () => mockStatsData,
      } as Response;

      mockWithApiTimeout.mockResolvedValue(mockResponse);

      renderHook(() => useStats());

      const fetcher = mockUseSWR.mock.calls[0]?.[1] as (url: string) => Promise<unknown>;

      await fetcher('/api/stats');

      expect(mockWithApiTimeout).toHaveBeenCalled();
    });

    it('should validate response data with StatsResponseSchema', async () => {
      const mockResponse = {
        ok: true,
        json: async () => mockStatsData,
      } as Response;

      mockWithApiTimeout.mockResolvedValue(mockResponse);

      renderHook(() => useStats());

      const fetcher = mockUseSWR.mock.calls[0]?.[1] as (url: string) => Promise<unknown>;

      const result = await fetcher('/api/stats');

      expect(result).toEqual(mockStatsData);
    });
  });
});
