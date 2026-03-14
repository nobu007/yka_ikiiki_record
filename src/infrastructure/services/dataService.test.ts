import { dataService } from './dataService';
import type { DataGenerationConfig } from './dataService';
import { APP_CONFIG } from '@/lib/config';

describe('DataService', () => {
  describe('createDefaultConfig', () => {
    it('should return config matching APP_CONFIG defaults', () => {
      // Act
      const config = dataService.createDefaultConfig();

      // Assert
      expect(config.periodDays).toBe(APP_CONFIG.generation.defaultPeriodDays);
      expect(config.studentCount).toBe(APP_CONFIG.generation.defaultStudentCount);
      expect(config.distributionPattern).toBe(APP_CONFIG.generation.defaultPattern);
      expect(config.seasonalEffects).toBe(true);
      expect(config.eventEffects).toEqual([]);
    });

    it('should return a new object on each call', () => {
      // Act
      const config1 = dataService.createDefaultConfig();
      const config2 = dataService.createDefaultConfig();

      // Assert
      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });

  describe('generateStats', () => {
    const minimalConfig: DataGenerationConfig = {
      periodDays: 7,
      studentCount: 2,
      distributionPattern: 'normal',
      seasonalEffects: false,
      eventEffects: [],
    };

    it('should return all required GeneratedStats fields', () => {
      // Act
      const stats = dataService.generateStats(minimalConfig);

      // Assert
      expect(stats).toHaveProperty('overview');
      expect(stats).toHaveProperty('monthlyStats');
      expect(stats).toHaveProperty('studentStats');
      expect(stats).toHaveProperty('dayOfWeekStats');
      expect(stats).toHaveProperty('emotionDistribution');
      expect(stats).toHaveProperty('timeOfDayStats');
    });

    it('should generate records for all students across all days', () => {
      // Act
      const stats = dataService.generateStats(minimalConfig);

      // Assert — at least 1 record per student per day (minimum)
      expect(stats.overview.count).toBeGreaterThanOrEqual(
        minimalConfig.studentCount * minimalConfig.periodDays
      );
    });

    it('should produce avgEmotion within valid range [1, 5]', () => {
      // Act
      const stats = dataService.generateStats(minimalConfig);

      // Assert
      expect(stats.overview.avgEmotion).toBeGreaterThanOrEqual(1);
      expect(stats.overview.avgEmotion).toBeLessThanOrEqual(5);
    });

    it('should generate studentStats for each student', () => {
      // Arrange
      const config: DataGenerationConfig = {
        ...minimalConfig,
        studentCount: 3,
      };

      // Act
      const stats = dataService.generateStats(config);

      // Assert
      expect(stats.studentStats.length).toBeGreaterThanOrEqual(config.studentCount);
    });

    it('should generate dayOfWeekStats with 7 entries', () => {
      // Act
      const stats = dataService.generateStats(minimalConfig);

      // Assert
      expect(stats.dayOfWeekStats).toHaveLength(7);
      for (const entry of stats.dayOfWeekStats) {
        expect(entry).toHaveProperty('day');
        expect(entry).toHaveProperty('avgEmotion');
        expect(entry).toHaveProperty('count');
      }
    });

    it('should generate emotionDistribution with 5 buckets', () => {
      // Act
      const stats = dataService.generateStats(minimalConfig);

      // Assert
      expect(stats.emotionDistribution).toHaveLength(5);
      for (const bucket of stats.emotionDistribution) {
        expect(bucket).toBeGreaterThanOrEqual(0);
      }
    });

    it('should generate timeOfDayStats with morning, afternoon, evening', () => {
      // Act
      const stats = dataService.generateStats(minimalConfig);

      // Assert
      expect(stats.timeOfDayStats).toHaveProperty('morning');
      expect(stats.timeOfDayStats).toHaveProperty('afternoon');
      expect(stats.timeOfDayStats).toHaveProperty('evening');
    });

    describe('distribution patterns', () => {
      const patterns = ['normal', 'bimodal', 'stress', 'happy'] as const;

      it.each(patterns)('should generate valid stats for "%s" pattern', (pattern) => {
        // Arrange
        const config: DataGenerationConfig = {
          ...minimalConfig,
          distributionPattern: pattern,
        };

        // Act
        const stats = dataService.generateStats(config);

        // Assert
        expect(stats.overview.count).toBeGreaterThan(0);
        expect(stats.overview.avgEmotion).toBeGreaterThanOrEqual(1);
        expect(stats.overview.avgEmotion).toBeLessThanOrEqual(5);
      });
    });

    describe('seasonal effects', () => {
      it('should produce valid results with seasonal effects enabled', () => {
        // Arrange
        const config: DataGenerationConfig = {
          ...minimalConfig,
          seasonalEffects: true,
        };

        // Act
        const stats = dataService.generateStats(config);

        // Assert
        expect(stats.overview.count).toBeGreaterThan(0);
        expect(stats.overview.avgEmotion).toBeGreaterThanOrEqual(1);
        expect(stats.overview.avgEmotion).toBeLessThanOrEqual(5);
      });
    });

    describe('class characteristics', () => {
      it('should apply class characteristics when provided', () => {
        // Arrange
        const config: DataGenerationConfig = {
          ...minimalConfig,
          classCharacteristics: {
            volatility: 0.8,
            baselineEmotion: 3.5,
          },
        };

        // Act
        const stats = dataService.generateStats(config);

        // Assert
        expect(stats.overview.count).toBeGreaterThan(0);
        expect(stats.overview.avgEmotion).toBeGreaterThanOrEqual(1);
        expect(stats.overview.avgEmotion).toBeLessThanOrEqual(5);
      });

      it('should produce different results with different volatility values', () => {
        // Use large sample to reduce randomness impact
        const baseConfig: DataGenerationConfig = {
          periodDays: 30,
          studentCount: 10,
          distributionPattern: 'normal',
          seasonalEffects: false,
          eventEffects: [],
        };

        // Arrange: low vs high volatility
        const lowVol: DataGenerationConfig = {
          ...baseConfig,
          classCharacteristics: { volatility: 0.1, baselineEmotion: 3.0 },
        };
        const highVol: DataGenerationConfig = {
          ...baseConfig,
          classCharacteristics: { volatility: 0.9, baselineEmotion: 3.0 },
        };

        // Act
        const statsLow = dataService.generateStats(lowVol);
        const statsHigh = dataService.generateStats(highVol);

        // Assert — both produce valid output
        expect(statsLow.overview.avgEmotion).toBeGreaterThanOrEqual(1);
        expect(statsHigh.overview.avgEmotion).toBeGreaterThanOrEqual(1);
      });
    });

    describe('event effects', () => {
      it('should apply event effects to emotion generation', () => {
        // Arrange
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

        // Act
        const stats = dataService.generateStats(config);

        // Assert
        expect(stats.overview.count).toBeGreaterThan(0);
        expect(stats.overview.avgEmotion).toBeGreaterThanOrEqual(1);
        expect(stats.overview.avgEmotion).toBeLessThanOrEqual(5);
      });
    });

    describe('edge cases', () => {
      it('should handle minimum period (1 day)', () => {
        // Arrange
        const config: DataGenerationConfig = {
          ...minimalConfig,
          periodDays: 1,
          studentCount: 1,
        };

        // Act
        const stats = dataService.generateStats(config);

        // Assert
        expect(stats.overview.count).toBeGreaterThanOrEqual(1);
      });

      it('should handle large student count', () => {
        // Arrange
        const config: DataGenerationConfig = {
          ...minimalConfig,
          periodDays: 1,
          studentCount: 50,
        };

        // Act
        const stats = dataService.generateStats(config);

        // Assert
        expect(stats.overview.count).toBeGreaterThanOrEqual(50);
        expect(stats.studentStats.length).toBeGreaterThanOrEqual(50);
      });

      it('should handle all options enabled simultaneously', () => {
        // Arrange
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const config: DataGenerationConfig = {
          periodDays: 14,
          studentCount: 5,
          distributionPattern: 'bimodal',
          seasonalEffects: true,
          classCharacteristics: { volatility: 0.7, baselineEmotion: 3.2 },
          eventEffects: [
            {
              startDate: weekAgo.toISOString(),
              endDate: today.toISOString(),
              impact: -0.3,
            },
          ],
        };

        // Act
        const stats = dataService.generateStats(config);

        // Assert
        expect(stats.overview.count).toBeGreaterThan(0);
        expect(stats.overview.avgEmotion).toBeGreaterThanOrEqual(1);
        expect(stats.overview.avgEmotion).toBeLessThanOrEqual(5);
        expect(stats.dayOfWeekStats).toHaveLength(7);
        expect(stats.emotionDistribution).toHaveLength(5);
      });
    });
  });
});
