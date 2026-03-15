import {
  DataGenerationConfigSchema,
  SeedRequestSchema,
} from './api';

describe('Schemas - Configuration', () => {
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
});
