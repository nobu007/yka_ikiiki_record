import {
  EmotionDistributionPatternSchema,
  EventEffectSchema,
  ClassCharacteristicsSchema,
  DataGenerationConfigSchema,
  SeedRequestSchema,
  SeedResponseSchema,
  StatsResponseSchema,
} from './api';

describe('schemas/api', () => {
  describe('EmotionDistributionPatternSchema', () => {
    it.each(['normal', 'bimodal', 'stress', 'happy'])('accepts "%s"', (pattern) => {
      expect(EmotionDistributionPatternSchema.parse(pattern)).toBe(pattern);
    });

    it('rejects invalid pattern', () => {
      expect(() => EmotionDistributionPatternSchema.parse('invalid')).toThrow();
    });
  });

  describe('EventEffectSchema', () => {
    const validEvent = {
      name: 'テスト',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-04-07'),
      impact: 0.5,
    };

    it('accepts valid event', () => {
      const result = EventEffectSchema.parse(validEvent);
      expect(result.name).toBe('テスト');
      expect(result.impact).toBe(0.5);
    });

    it('rejects empty name', () => {
      expect(() => EventEffectSchema.parse({ ...validEvent, name: '' })).toThrow();
    });

    it('rejects name exceeding 100 chars', () => {
      expect(() => EventEffectSchema.parse({ ...validEvent, name: 'a'.repeat(101) })).toThrow();
    });

    it('rejects impact below -1', () => {
      expect(() => EventEffectSchema.parse({ ...validEvent, impact: -1.1 })).toThrow();
    });

    it('rejects impact above 1', () => {
      expect(() => EventEffectSchema.parse({ ...validEvent, impact: 1.1 })).toThrow();
    });

    it('accepts boundary impact values -1 and 1', () => {
      expect(EventEffectSchema.parse({ ...validEvent, impact: -1 }).impact).toBe(-1);
      expect(EventEffectSchema.parse({ ...validEvent, impact: 1 }).impact).toBe(1);
    });
  });

  describe('ClassCharacteristicsSchema', () => {
    const valid = { baselineEmotion: 3.0, volatility: 0.5, cohesion: 0.5 };

    it('accepts valid characteristics', () => {
      expect(ClassCharacteristicsSchema.parse(valid)).toEqual(valid);
    });

    it('rejects baselineEmotion below 2.5', () => {
      expect(() => ClassCharacteristicsSchema.parse({ ...valid, baselineEmotion: 2.4 })).toThrow();
    });

    it('rejects baselineEmotion above 3.5', () => {
      expect(() => ClassCharacteristicsSchema.parse({ ...valid, baselineEmotion: 3.6 })).toThrow();
    });

    it('accepts boundary baselineEmotion values', () => {
      expect(ClassCharacteristicsSchema.parse({ ...valid, baselineEmotion: 2.5 }).baselineEmotion).toBe(2.5);
      expect(ClassCharacteristicsSchema.parse({ ...valid, baselineEmotion: 3.5 }).baselineEmotion).toBe(3.5);
    });

    it('rejects volatility below 0.1', () => {
      expect(() => ClassCharacteristicsSchema.parse({ ...valid, volatility: 0.09 })).toThrow();
    });

    it('rejects volatility above 1.0', () => {
      expect(() => ClassCharacteristicsSchema.parse({ ...valid, volatility: 1.1 })).toThrow();
    });

    it('rejects cohesion below 0.1', () => {
      expect(() => ClassCharacteristicsSchema.parse({ ...valid, cohesion: 0.09 })).toThrow();
    });

    it('rejects cohesion above 1.0', () => {
      expect(() => ClassCharacteristicsSchema.parse({ ...valid, cohesion: 1.1 })).toThrow();
    });
  });

  describe('DataGenerationConfigSchema', () => {
    const validConfig = {
      studentCount: 30,
      periodDays: 30,
      distributionPattern: 'normal' as const,
      seasonalEffects: true,
      eventEffects: [],
      classCharacteristics: { baselineEmotion: 3.0, volatility: 0.5, cohesion: 0.5 },
    };

    it('accepts valid config', () => {
      const result = DataGenerationConfigSchema.parse(validConfig);
      expect(result.studentCount).toBe(30);
    });

    it('rejects studentCount below 10', () => {
      expect(() => DataGenerationConfigSchema.parse({ ...validConfig, studentCount: 9 })).toThrow();
    });

    it('rejects studentCount above 500', () => {
      expect(() => DataGenerationConfigSchema.parse({ ...validConfig, studentCount: 501 })).toThrow();
    });

    it('rejects non-integer studentCount', () => {
      expect(() => DataGenerationConfigSchema.parse({ ...validConfig, studentCount: 30.5 })).toThrow();
    });

    it('rejects periodDays below 7', () => {
      expect(() => DataGenerationConfigSchema.parse({ ...validConfig, periodDays: 6 })).toThrow();
    });

    it('rejects periodDays above 365', () => {
      expect(() => DataGenerationConfigSchema.parse({ ...validConfig, periodDays: 366 })).toThrow();
    });

    it('accepts boundary values', () => {
      const min = DataGenerationConfigSchema.parse({ ...validConfig, studentCount: 10, periodDays: 7 });
      expect(min.studentCount).toBe(10);
      expect(min.periodDays).toBe(7);

      const max = DataGenerationConfigSchema.parse({ ...validConfig, studentCount: 500, periodDays: 365 });
      expect(max.studentCount).toBe(500);
      expect(max.periodDays).toBe(365);
    });

    it('rejects missing required fields', () => {
      expect(() => DataGenerationConfigSchema.parse({})).toThrow();
      expect(() => DataGenerationConfigSchema.parse({ studentCount: 30 })).toThrow();
    });
  });

  describe('SeedRequestSchema', () => {
    const validRequest = {
      config: {
        studentCount: 30,
        periodDays: 30,
        distributionPattern: 'normal',
        seasonalEffects: true,
        eventEffects: [],
        classCharacteristics: { baselineEmotion: 3.0, volatility: 0.5, cohesion: 0.5 },
      },
    };

    it('accepts valid seed request', () => {
      const result = SeedRequestSchema.parse(validRequest);
      expect(result.config.studentCount).toBe(30);
    });

    it('rejects request without config', () => {
      expect(() => SeedRequestSchema.parse({})).toThrow();
    });
  });

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
