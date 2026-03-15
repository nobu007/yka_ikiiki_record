import { dataService } from './dataService';
import type { DataGenerationConfig } from './dataService';

describe('DataService - Generate Stats', () => {
  const minimalConfig: DataGenerationConfig = {
    periodDays: 7,
    studentCount: 2,
    distributionPattern: 'normal',
    seasonalEffects: false,
    eventEffects: [],
  };

  describe('generateStats - Basic Output', () => {
    it('should return all required GeneratedStats fields', () => {
      const stats = dataService.generateStats(minimalConfig);

      expect(stats).toHaveProperty('overview');
      expect(stats).toHaveProperty('monthlyStats');
      expect(stats).toHaveProperty('studentStats');
      expect(stats).toHaveProperty('dayOfWeekStats');
      expect(stats).toHaveProperty('emotionDistribution');
      expect(stats).toHaveProperty('timeOfDayStats');
    });

    it('should generate records for all students across all days', () => {
      const stats = dataService.generateStats(minimalConfig);
      expect(stats.overview.count).toBeGreaterThanOrEqual(
        minimalConfig.studentCount * minimalConfig.periodDays
      );
    });

    it('should produce avgEmotion within valid range [1, 5]', () => {
      const stats = dataService.generateStats(minimalConfig);
      expect(stats.overview.avgEmotion).toBeGreaterThanOrEqual(1);
      expect(stats.overview.avgEmotion).toBeLessThanOrEqual(5);
    });

    it('should generate studentStats for each student', () => {
      const config: DataGenerationConfig = {
        ...minimalConfig,
        studentCount: 3,
      };
      const stats = dataService.generateStats(config);
      expect(stats.studentStats.length).toBeGreaterThanOrEqual(config.studentCount);
    });

    it('should generate dayOfWeekStats with 7 entries', () => {
      const stats = dataService.generateStats(minimalConfig);
      expect(stats.dayOfWeekStats).toHaveLength(7);
      for (const entry of stats.dayOfWeekStats) {
        expect(entry).toHaveProperty('day');
        expect(entry).toHaveProperty('avgEmotion');
        expect(entry).toHaveProperty('count');
      }
    });

    it('should generate emotionDistribution with 5 buckets', () => {
      const stats = dataService.generateStats(minimalConfig);
      expect(stats.emotionDistribution).toHaveLength(5);
      for (const bucket of stats.emotionDistribution) {
        expect(bucket).toBeGreaterThanOrEqual(0);
      }
    });

    it('should generate timeOfDayStats with morning, afternoon, evening', () => {
      const stats = dataService.generateStats(minimalConfig);
      expect(stats.timeOfDayStats).toHaveProperty('morning');
      expect(stats.timeOfDayStats).toHaveProperty('afternoon');
      expect(stats.timeOfDayStats).toHaveProperty('evening');
    });
  });

  describe('generateStats - Edge Cases', () => {
    it('should handle minimum period (1 day)', () => {
      const config: DataGenerationConfig = {
        ...minimalConfig,
        periodDays: 1,
        studentCount: 1,
      };
      const stats = dataService.generateStats(config);
      expect(stats.overview.count).toBeGreaterThanOrEqual(1);
    });

    it('should handle large student count', () => {
      const config: DataGenerationConfig = {
        ...minimalConfig,
        periodDays: 1,
        studentCount: 50,
      };
      const stats = dataService.generateStats(config);
      expect(stats.overview.count).toBeGreaterThanOrEqual(50);
      expect(stats.studentStats.length).toBeGreaterThanOrEqual(50);
    });

    it('should handle all options enabled simultaneously', () => {
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
      const stats = dataService.generateStats(config);
      expect(stats.overview.count).toBeGreaterThan(0);
      expect(stats.overview.avgEmotion).toBeGreaterThanOrEqual(1);
      expect(stats.overview.avgEmotion).toBeLessThanOrEqual(5);
      expect(stats.dayOfWeekStats).toHaveLength(7);
      expect(stats.emotionDistribution).toHaveLength(5);
    });
  });
});
