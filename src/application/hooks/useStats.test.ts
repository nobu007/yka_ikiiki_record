import { renderHook } from '@testing-library/react';
import { useStats } from './useStats';
import { withApiTimeout } from '@/lib/resilience/timeout';

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
const mockUseSWR = require('swr').default as jest.MockedFunction<any>;

describe('useStats', () => {
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

  describe('initial state', () => {
    it('should initialize with loading state true when data is being fetched', () => {
      const { result } = renderHook(() => useStats());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.stats).toBeUndefined();
      expect(result.current.error).toBeUndefined();
    });

    it('should have no initial error state', () => {
      const { result } = renderHook(() => useStats());

      expect(result.current.error).toBeUndefined();
    });
  });

  describe('successful data fetching', () => {
    it('should return stats data when fetch is successful', () => {
      mockUseSWR.mockReturnValue({
        data: mockStatsData,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useStats());

      expect(result.current.stats).toEqual(mockStatsData.data);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    it('should extract data field from StatsResponse', () => {
      mockUseSWR.mockReturnValue({
        data: mockStatsData,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useStats());

      expect(result.current.stats).toEqual(mockStatsData.data);
      expect(result.current.stats?.overview.count).toBe(100);
      expect(result.current.stats?.overview.avgEmotion).toBe(3.5);
    });

    it('should set loading to false after successful fetch', () => {
      mockUseSWR.mockReturnValue({
        data: mockStatsData,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useStats());

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle SWR error and return it', () => {
      const swrError = new Error('SWR fetch failed');
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: swrError,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useStats());

      expect(result.current.error).toEqual(swrError);
      expect(result.current.stats).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle non-Error swrError objects', () => {
      const nonErrorError = 'String error message';
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: nonErrorError as unknown as Error,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useStats());

      // When swrError is not an Error instance, it's returned as-is
      expect(result.current.error).toEqual(nonErrorError);
      expect(result.current.stats).toBeUndefined();
    });
  });

  describe('refetch functionality', () => {
    it('should call mutate when refetch is invoked', () => {
      mockUseSWR.mockReturnValue({
        data: mockStatsData,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useStats());

      result.current.refetch();

      expect(mockMutate).toHaveBeenCalled();
    });

    it('should return mutate function from SWR', () => {
      mockUseSWR.mockReturnValue({
        data: mockStatsData,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useStats());

      expect(typeof result.current.refetch).toBe('function');
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

      const fetcher = mockUseSWR.mock.calls[0][1];
      expect(typeof fetcher).toBe('function');
    });

    it('should handle onError callback from SWR', () => {
      renderHook(() => useStats());

      const onErrorCallback = mockUseSWR.mock.calls[0]?.[2]?.onError;
      expect(typeof onErrorCallback).toBe('function');

      const testError = new Error('Test error');
      expect(() => onErrorCallback(testError)).not.toThrow();
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

      const fetcher = mockUseSWR.mock.calls[0][1] as (url: string) => Promise<unknown>;

      await fetcher('/api/stats');

      expect(mockWithApiTimeout).toHaveBeenCalled();
    });

    it('should throw error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response;

      mockWithApiTimeout.mockResolvedValue(mockResponse);

      renderHook(() => useStats());

      const fetcher = mockUseSWR.mock.calls[0][1] as (url: string) => Promise<unknown>;

      await expect(fetcher('/api/stats')).rejects.toThrow('APIリクエストに失敗しました');
    });

    it('should validate response data with StatsResponseSchema', async () => {
      const mockResponse = {
        ok: true,
        json: async () => mockStatsData,
      } as Response;

      mockWithApiTimeout.mockResolvedValue(mockResponse);

      renderHook(() => useStats());

      const fetcher = mockUseSWR.mock.calls[0][1] as (url: string) => Promise<unknown>;

      const result = await fetcher('/api/stats');

      expect(result).toEqual(mockStatsData);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete happy path: loading -> success', () => {
      mockUseSWR.mockReturnValue({
        data: mockStatsData,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useStats());

      expect(result.current.stats).toEqual(mockStatsData.data);
      expect(result.current.error).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('should maintain stats data across re-renders when no new fetch', () => {
      mockUseSWR.mockReturnValue({
        data: mockStatsData,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result, rerender } = renderHook(() => useStats());

      const firstStats = result.current.stats;

      rerender();

      expect(result.current.stats).toBe(firstStats);
    });
  });

  describe('data structure validation', () => {
    it('should return stats with all expected fields', () => {
      mockUseSWR.mockReturnValue({
        data: mockStatsData,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useStats());

      expect(result.current.stats).toHaveProperty('overview');
      expect(result.current.stats).toHaveProperty('monthlyStats');
      expect(result.current.stats).toHaveProperty('dayOfWeekStats');
      expect(result.current.stats).toHaveProperty('timeOfDayStats');
      expect(result.current.stats).toHaveProperty('studentStats');
      expect(result.current.stats).toHaveProperty('emotionDistribution');
    });

    it('should handle undefined stats gracefully', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useStats());

      expect(result.current.stats).toBeUndefined();
    });
  });
});
