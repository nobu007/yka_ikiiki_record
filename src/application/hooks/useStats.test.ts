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

import { StatsResponse } from '@/schemas/api';

type UseSWRResponse<T> = {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => Promise<void>;
};

const mockUseSWR = require('swr').default as jest.MockedFunction<
  (key: string, fetcher: () => Promise<StatsResponse>, config?: unknown) => UseSWRResponse<StatsResponse>
>;

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
