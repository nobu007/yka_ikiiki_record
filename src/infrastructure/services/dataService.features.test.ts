import { dataService } from './dataService';
import type { DataGenerationConfig } from './dataService';

describe('DataService - Feature Variations', () => {
  const minimalConfig: DataGenerationConfig = {
    periodDays: 7,
    studentCount: 2,
    distributionPattern: 'normal',
    seasonalEffects: false,
    eventEffects: [],
  };

  describe('distribution patterns', () => {
    const patterns = ['normal', 'bimodal', 'stress', 'happy'] as const;

    it.each(patterns)('should generate valid stats for "%s" pattern', (pattern) => {
      const config: DataGenerationConfig = {
        ...minimalConfig,
        distributionPattern: pattern,
      };
      const stats = dataService.generateStats(config);
      expect(stats.overview.count).toBeGreaterThan(0);
      expect(stats.overview.avgEmotion).toBeGreaterThanOrEqual(1);
      expect(stats.overview.avgEmotion).toBeLessThanOrEqual(5);
    });
  });

  describe('seasonal effects', () => {
    it('should produce valid results with seasonal effects enabled', () => {
      const config: DataGenerationConfig = {
        ...minimalConfig,
        seasonalEffects: true,
      };
      const stats = dataService.generateStats(config);
      expect(stats.overview.count).toBeGreaterThan(0);
      expect(stats.overview.avgEmotion).toBeGreaterThanOrEqual(1);
      expect(stats.overview.avgEmotion).toBeLessThanOrEqual(5);
    });
  });

  describe('class characteristics', () => {
    it('should apply class characteristics when provided', () => {
      const config: DataGenerationConfig = {
        ...minimalConfig,
        classCharacteristics: {
          volatility: 0.8,
          baselineEmotion: 3.5,
        },
      };
      const stats = dataService.generateStats(config);
      expect(stats.overview.count).toBeGreaterThan(0);
      expect(stats.overview.avgEmotion).toBeGreaterThanOrEqual(1);
      expect(stats.overview.avgEmotion).toBeLessThanOrEqual(5);
    });

    it('should produce different results with different volatility values', () => {
      const baseConfig: DataGenerationConfig = {
        periodDays: 30,
        studentCount: 10,
        distributionPattern: 'normal',
        seasonalEffects: false,
        eventEffects: [],
      };

      const lowVol: DataGenerationConfig = {
        ...baseConfig,
        classCharacteristics: { volatility: 0.1, baselineEmotion: 3.0 },
      };
      const highVol: DataGenerationConfig = {
        ...baseConfig,
        classCharacteristics: { volatility: 0.9, baselineEmotion: 3.0 },
      };

      const statsLow = dataService.generateStats(lowVol);
      const statsHigh = dataService.generateStats(highVol);
      expect(statsLow.overview.avgEmotion).toBeGreaterThanOrEqual(1);
      expect(statsHigh.overview.avgEmotion).toBeGreaterThanOrEqual(1);
    });
  });

  describe('event effects', () => {
    it('should apply event effects to emotion generation', () => {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const config: DataGenerationConfig = {
        ...minimalConfig,
        periodDays: 14,
        eventEffects: [
          {
            startDate: weekAgo.toISOString(),
            endDate: today.toISOString(),
            impact: 0.5,
          },
        ],
      };
      const stats = dataService.generateStats(config);
      expect(stats.overview.count).toBeGreaterThan(0);
      expect(stats.overview.avgEmotion).toBeGreaterThanOrEqual(1);
      expect(stats.overview.avgEmotion).toBeLessThanOrEqual(5);
    });
  });
});
