import { renderHook } from '@testing-library/react';
import { useStats } from './useStats';

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

const mockUseSWR = require('swr').default as jest.MockedFunction<any>;

describe('useStats error handling', () => {
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

  describe('SWR error handling', () => {
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

      expect(result.current.error).toEqual(nonErrorError);
      expect(result.current.stats).toBeUndefined();
    });
  });

  describe('fetcher error handling', () => {
    it('should throw error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response;

      jest.spyOn(await import('@/lib/resilience/timeout'), 'withApiTimeout').mockResolvedValue(mockResponse);

      mockUseSWR.mockReturnValue({
        data: mockStatsData,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      renderHook(() => useStats());

      const fetcher = mockUseSWR.mock.calls[0][1] as (url: string) => Promise<unknown>;

      await expect(fetcher('/api/stats')).rejects.toThrow('APIリクエストに失敗しました');
    });
  });
});
