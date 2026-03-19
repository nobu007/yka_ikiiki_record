import { renderHook } from '@testing-library/react';
import { useStats } from './useStats';
import { StatsResponse } from '@/schemas/api';

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

type UseSWRResponse<T> = {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => Promise<void>;
};

const mockUseSWR = require('swr').default as jest.MockedFunction<
  (key: string, fetcher: () => Promise<StatsResponse>, config?: unknown) => UseSWRResponse<StatsResponse>
>;

describe('useStats integration scenarios', () => {
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

  describe('happy path scenarios', () => {
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
});
