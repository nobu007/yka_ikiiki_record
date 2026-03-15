import {
  SeedResponseSchema,
  StatsResponseSchema,
} from './api';

describe('Schemas - Responses', () => {
  describe('SeedResponseSchema', () => {
    it('accepts success response with message', () => {
      const result = SeedResponseSchema.parse({ success: true, message: '完了' });
      expect(result.success).toBe(true);
      expect(result.message).toBe('完了');
    });

    it('accepts error response', () => {
      const result = SeedResponseSchema.parse({ success: false, error: 'エラー' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('エラー');
    });

    it('accepts success without optional fields', () => {
      const result = SeedResponseSchema.parse({ success: true });
      expect(result.success).toBe(true);
    });

    it('rejects missing success field', () => {
      expect(() => SeedResponseSchema.parse({})).toThrow();
    });
  });

  describe('StatsResponseSchema', () => {
    const validStatsResponse = {
      success: true,
      data: {
        overview: { count: 100, avgEmotion: 3.5 },
        monthlyStats: [{ month: '2024-04', count: 30, avgEmotion: 3.2 }],
        studentStats: [{ student: '生徒A', recordCount: 10, avgEmotion: 3.0, trendline: [3.0, 3.1, 3.2] }],
        dayOfWeekStats: [{ day: '月曜', avgEmotion: 3.1, count: 15 }],
        emotionDistribution: [10, 20, 40, 20, 10],
        timeOfDayStats: { morning: 3.2, afternoon: 3.5, evening: 3.0 },
      },
    };

    it('accepts valid stats response', () => {
      const result = StatsResponseSchema.parse(validStatsResponse);
      expect(result.data.overview.count).toBe(100);
    });

    it('rejects avgEmotion below 1', () => {
      const invalid = {
        ...validStatsResponse,
        data: { ...validStatsResponse.data, overview: { count: 10, avgEmotion: 0.9 } },
      };
      expect(() => StatsResponseSchema.parse(invalid)).toThrow();
    });

    it('rejects avgEmotion above 5', () => {
      const invalid = {
        ...validStatsResponse,
        data: { ...validStatsResponse.data, overview: { count: 10, avgEmotion: 5.1 } },
      };
      expect(() => StatsResponseSchema.parse(invalid)).toThrow();
    });

    it('rejects negative count', () => {
      const invalid = {
        ...validStatsResponse,
        data: { ...validStatsResponse.data, overview: { count: -1, avgEmotion: 3.0 } },
      };
      expect(() => StatsResponseSchema.parse(invalid)).toThrow();
    });

    it('accepts empty stats arrays', () => {
      const minimal = {
        success: true,
        data: {
          overview: { count: 0, avgEmotion: 1.0 },
          monthlyStats: [],
          studentStats: [],
          dayOfWeekStats: [],
          emotionDistribution: [],
          timeOfDayStats: { morning: 1.0, afternoon: 1.0, evening: 1.0 },
        },
      };
      expect(StatsResponseSchema.parse(minimal).data.monthlyStats).toEqual([]);
    });

    it('rejects missing data field', () => {
      expect(() => StatsResponseSchema.parse({ success: true })).toThrow();
    });

    it('validates timeOfDayStats boundaries', () => {
      const invalid = {
        ...validStatsResponse,
        data: {
          ...validStatsResponse.data,
          timeOfDayStats: { morning: 0.5, afternoon: 3.0, evening: 3.0 },
        },
      };
      expect(() => StatsResponseSchema.parse(invalid)).toThrow();
    });
  });
});
