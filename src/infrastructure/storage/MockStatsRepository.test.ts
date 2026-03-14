import { MockStatsRepository } from './MockStatsRepository';
import { StatsRepository } from '../../domain/repositories/StatsRepository';
import { createValidStats, createEmptyStats } from '@/test-utils/fixtures';

describe('MockStatsRepository', () => {
  let repository: MockStatsRepository;

  beforeEach(() => {
    repository = new MockStatsRepository();
  });

  describe('StatsRepository contract compliance', () => {
    it('should implement StatsRepository interface', () => {
      // Arrange & Assert
      const repo: StatsRepository = repository;
      expect(repo).toBeDefined();
      expect(typeof repo.getStats).toBe('function');
      expect(typeof repo.saveStats).toBe('function');
      expect(typeof repo.generateSeedData).toBe('function');
    });
  });

  describe('getStats', () => {
    it('should return initial mock stats with valid structure', async () => {
      // Act
      const stats = await repository.getStats();

      // Assert
      expect(stats).toBeDefined();
      expect(stats.overview).toBeDefined();
      expect(stats.overview.count).toBeGreaterThan(0);
      expect(stats.overview.avgEmotion).toBeGreaterThanOrEqual(1);
      expect(stats.overview.avgEmotion).toBeLessThanOrEqual(5);
    });

    it('should return stats with all required fields', async () => {
      // Act
      const stats = await repository.getStats();

      // Assert
      expect(stats).toHaveProperty('overview');
      expect(stats).toHaveProperty('monthlyStats');
      expect(stats).toHaveProperty('studentStats');
      expect(stats).toHaveProperty('dayOfWeekStats');
      expect(stats).toHaveProperty('emotionDistribution');
      expect(stats).toHaveProperty('timeOfDayStats');
    });

    it('should return monthlyStats as non-empty array', async () => {
      // Act
      const stats = await repository.getStats();

      // Assert
      expect(Array.isArray(stats.monthlyStats)).toBe(true);
      expect(stats.monthlyStats.length).toBeGreaterThan(0);
      for (const monthly of stats.monthlyStats) {
        expect(monthly).toHaveProperty('month');
        expect(monthly).toHaveProperty('avgEmotion');
        expect(monthly).toHaveProperty('count');
      }
    });

    it('should return studentStats with valid trendlines', async () => {
      // Act
      const stats = await repository.getStats();

      // Assert
      expect(stats.studentStats.length).toBeGreaterThan(0);
      for (const student of stats.studentStats) {
        expect(student).toHaveProperty('student');
        expect(student).toHaveProperty('recordCount');
        expect(student).toHaveProperty('avgEmotion');
        expect(student).toHaveProperty('trendline');
        expect(Array.isArray(student.trendline)).toBe(true);
        expect(student.trendline.length).toBeGreaterThan(0);
      }
    });

    it('should return all 7 dayOfWeekStats entries', async () => {
      // Act
      const stats = await repository.getStats();

      // Assert
      expect(stats.dayOfWeekStats).toHaveLength(7);
      for (const day of stats.dayOfWeekStats) {
        expect(day.avgEmotion).toBeGreaterThanOrEqual(1);
        expect(day.avgEmotion).toBeLessThanOrEqual(5);
        expect(day.count).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return emotionDistribution as array of 5 buckets', async () => {
      // Act
      const stats = await repository.getStats();

      // Assert
      expect(stats.emotionDistribution).toHaveLength(5);
      for (const bucket of stats.emotionDistribution) {
        expect(typeof bucket).toBe('number');
        expect(bucket).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return timeOfDayStats with morning, afternoon, evening', async () => {
      // Act
      const stats = await repository.getStats();

      // Assert
      expect(stats.timeOfDayStats).toHaveProperty('morning');
      expect(stats.timeOfDayStats).toHaveProperty('afternoon');
      expect(stats.timeOfDayStats).toHaveProperty('evening');
      expect(typeof stats.timeOfDayStats.morning).toBe('number');
      expect(typeof stats.timeOfDayStats.afternoon).toBe('number');
      expect(typeof stats.timeOfDayStats.evening).toBe('number');
    });

    it('should return consistent data across multiple calls', async () => {
      // Act
      const stats1 = await repository.getStats();
      const stats2 = await repository.getStats();

      // Assert
      expect(stats1).toEqual(stats2);
    });
  });

  describe('saveStats', () => {
    it('should persist stats and return them on subsequent getStats call', async () => {
      // Arrange
      const newStats = createValidStats({
        overview: { count: 200, avgEmotion: 4.0 },
      });

      // Act
      await repository.saveStats(newStats);
      const retrieved = await repository.getStats();

      // Assert
      expect(retrieved.overview.count).toBe(200);
      expect(retrieved.overview.avgEmotion).toBe(4.0);
    });

    it('should fully replace previous stats', async () => {
      // Arrange
      const emptyStats = createEmptyStats();

      // Act
      await repository.saveStats(emptyStats);
      const retrieved = await repository.getStats();

      // Assert
      expect(retrieved.overview.count).toBe(0);
      expect(retrieved.monthlyStats).toEqual([]);
      expect(retrieved.studentStats).toEqual([]);
    });

    it('should not throw on valid stats', async () => {
      // Arrange
      const stats = createValidStats();

      // Act & Assert
      await expect(repository.saveStats(stats)).resolves.toBeUndefined();
    });
  });

  describe('generateSeedData', () => {
    it('should resolve without errors', async () => {
      // Act & Assert
      await expect(repository.generateSeedData()).resolves.toBeUndefined();
    });

    it('should not modify existing stats', async () => {
      // Arrange
      const statsBefore = await repository.getStats();

      // Act
      await repository.generateSeedData();
      const statsAfter = await repository.getStats();

      // Assert
      expect(statsAfter).toEqual(statsBefore);
    });
  });
});
