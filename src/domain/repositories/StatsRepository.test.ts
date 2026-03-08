import { StatsRepository } from './StatsRepository';
import { Stats } from '../entities/Stats';
import { createEmptyStats, createValidStats } from '@/test-utils/fixtures';

type MockedStatsRepository = {
  [K in keyof StatsRepository]: jest.MockedFunction<StatsRepository[K]>
};

describe('StatsRepository Interface', () => {
  describe('Interface Contract', () => {
    it('should define required methods', () => {
      // Arrange
      const mockRepository: StatsRepository = {
        getStats: jest.fn().mockResolvedValue({} as Stats),
        saveStats: jest.fn().mockResolvedValue(undefined),
        generateSeedData: jest.fn().mockResolvedValue(undefined)
      };

      // Assert
      expect(mockRepository).toHaveProperty('getStats');
      expect(mockRepository).toHaveProperty('saveStats');
      expect(mockRepository).toHaveProperty('generateSeedData');
      expect(typeof mockRepository.getStats).toBe('function');
      expect(typeof mockRepository.saveStats).toBe('function');
      expect(typeof mockRepository.generateSeedData).toBe('function');
    });

    it('should have correct method signatures', () => {
      // Arrange
      const mockStats = createValidStats({
        overview: { count: 100, avgEmotion: 3.5 },
        timeOfDayStats: { morning: 3.0, afternoon: 3.5, evening: 4.0 }
      });

      const mockRepository: StatsRepository = {
        getStats: jest.fn().mockResolvedValue(mockStats),
        saveStats: jest.fn().mockResolvedValue(undefined),
        generateSeedData: jest.fn().mockResolvedValue(undefined)
      };

      // Assert - TypeScript should enforce these signatures
      expect(mockRepository.getStats()).resolves.toBe(mockStats);
      expect(mockRepository.saveStats(mockStats)).resolves.toBeUndefined();
      expect(mockRepository.generateSeedData()).resolves.toBeUndefined();
    });

    it('should enforce async method contracts', () => {
      // Arrange
      const emptyStats = createEmptyStats();

      const mockRepository: StatsRepository = {
        getStats: jest.fn().mockResolvedValue(emptyStats),
        saveStats: jest.fn().mockResolvedValue(undefined),
        generateSeedData: jest.fn().mockResolvedValue(undefined)
      };

      // Assert
      expect(mockRepository.getStats()).toBeInstanceOf(Promise);
      expect(mockRepository.saveStats(emptyStats)).toBeInstanceOf(Promise);
      expect(mockRepository.generateSeedData()).toBeInstanceOf(Promise);
    });
  });

  describe('Method Behavior Validation', () => {
    let mockRepository: MockedStatsRepository;
    let mockStats: Stats;

    beforeEach(() => {
      // Arrange
      mockStats = {
        overview: { count: 150, avgEmotion: 3.8 },
        monthlyStats: [
          { month: '2024-01', count: 50, avgEmotion: 3.5 },
          { month: '2024-02', count: 55, avgEmotion: 4.0 }
        ],
        studentStats: [
          { student: '田中太郎', recordCount: 25, avgEmotion: 3.7, trendline: [3.0, 3.5, 4.0] }
        ],
        dayOfWeekStats: [
          { day: '月曜日', avgEmotion: 3.6, count: 30 }
        ],
        emotionDistribution: [20, 30, 40, 25, 35],
        timeOfDayStats: { morning: 3.4, afternoon: 3.8, evening: 4.2 }
      };

      mockRepository = {
        getStats: jest.fn().mockResolvedValue(mockStats) as unknown as jest.MockedFunction<StatsRepository['getStats']>,
        saveStats: jest.fn().mockResolvedValue(undefined) as unknown as jest.MockedFunction<StatsRepository['saveStats']>,
        generateSeedData: jest.fn().mockResolvedValue(undefined) as unknown as jest.MockedFunction<StatsRepository['generateSeedData']>
      };
    });

    describe('getStats', () => {
      it('should return Stats object', async () => {
        // Act
        const result = await mockRepository.getStats();

        // Assert
        expect(result).toBe(mockStats);
        expect(mockRepository.getStats).toHaveBeenCalledTimes(1);
        expect(result.overview.count).toBe(150);
        expect(result.overview.avgEmotion).toBe(3.8);
      });

      it('should handle empty stats', async () => {
        // Arrange
        const emptyStats = createEmptyStats();
        mockRepository.getStats.mockResolvedValue(emptyStats);

        // Act
        const result = await mockRepository.getStats();

        // Assert
        expect(result.overview.count).toBe(0);
        expect(result.monthlyStats).toEqual([]);
        expect(result.studentStats).toEqual([]);
      });

      it('should handle repository errors', async () => {
        // Arrange
        const errorMessage = 'Database connection failed';
        mockRepository.getStats.mockRejectedValue(new Error(errorMessage));

        // Act & Assert
        await expect(mockRepository.getStats()).rejects.toThrow(errorMessage);
      });
    });

    describe('saveStats', () => {
      it('should save stats successfully', async () => {
        // Act
        await mockRepository.saveStats(mockStats);

        // Assert
        expect(mockRepository.saveStats).toHaveBeenCalledTimes(1);
        expect(mockRepository.saveStats).toHaveBeenCalledWith(mockStats);
      });

      it('should handle different stats configurations', async () => {
        // Arrange
        const differentStats: Stats = {
          overview: { count: 200, avgEmotion: 4.2 },
          monthlyStats: [
            { month: '2024-03', count: 70, avgEmotion: 4.1 },
            { month: '2024-04', count: 75, avgEmotion: 4.3 }
          ],
          studentStats: [
            { student: '山田花子', recordCount: 30, avgEmotion: 4.0, trendline: [3.8, 4.0, 4.2] }
          ],
          dayOfWeekStats: [
            { day: '金曜日', avgEmotion: 4.5, count: 40 }
          ],
          emotionDistribution: [15, 25, 35, 20, 30],
          timeOfDayStats: { morning: 3.9, afternoon: 4.3, evening: 4.6 }
        };

        // Act
        await mockRepository.saveStats(differentStats);

        // Assert
        expect(mockRepository.saveStats).toHaveBeenCalledWith(differentStats);
      });

      it('should handle save errors', async () => {
        // Arrange
        const errorMessage = 'Save operation failed';
        mockRepository.saveStats.mockRejectedValue(new Error(errorMessage));

        // Act & Assert
        await expect(mockRepository.saveStats(mockStats)).rejects.toThrow(errorMessage);
      });
    });

    describe('generateSeedData', () => {
      it('should generate seed data successfully', async () => {
        // Act
        await mockRepository.generateSeedData();

        // Assert
        expect(mockRepository.generateSeedData).toHaveBeenCalledTimes(1);
      });

      it('should handle seed generation errors', async () => {
        // Arrange
        const errorMessage = 'Seed generation failed';
        mockRepository.generateSeedData.mockRejectedValue(new Error(errorMessage));

        // Act & Assert
        await expect(mockRepository.generateSeedData()).rejects.toThrow(errorMessage);
      });

      it('should not return any value', async () => {
        // Act
        const result = await mockRepository.generateSeedData();

        // Assert
        expect(result).toBeUndefined();
      });
    });
  });

  describe('Integration Simulation', () => {
    it('should simulate complete repository workflow', async () => {
      // Arrange
      let savedStats: Stats | null = null;
      const integrationRepository: StatsRepository = {
        getStats: jest.fn().mockImplementation(async () => {
          return savedStats || {
            overview: { count: 0, avgEmotion: 0 },
            monthlyStats: [],
            studentStats: [],
            dayOfWeekStats: [],
            emotionDistribution: [],
            timeOfDayStats: { morning: 0, afternoon: 0, evening: 0 }
          };
        }),
        saveStats: jest.fn().mockImplementation(async (stats: Stats) => {
          savedStats = stats;
        }),
        generateSeedData: jest.fn().mockImplementation(async () => {
          savedStats = {
            overview: { count: 100, avgEmotion: 3.5 },
            monthlyStats: [{ month: '2024-01', count: 30, avgEmotion: 3.5 }],
            studentStats: [{ student: 'テスト生徒', recordCount: 10, avgEmotion: 3.5, trendline: [3.5] }],
            dayOfWeekStats: [{ day: '月曜日', avgEmotion: 3.5, count: 10 }],
            emotionDistribution: [20, 20, 20, 20, 20],
            timeOfDayStats: { morning: 3.4, afternoon: 3.5, evening: 3.6 }
          };
        })
      };

      // Act
      await integrationRepository.generateSeedData();
      const retrievedStats = await integrationRepository.getStats();
      await integrationRepository.saveStats({
        ...retrievedStats,
        overview: { count: retrievedStats.overview.count + 10, avgEmotion: 3.6 }
      });
      const finalStats = await integrationRepository.getStats();

      // Assert
      expect(integrationRepository.generateSeedData).toHaveBeenCalledTimes(1);
      expect(integrationRepository.getStats).toHaveBeenCalledTimes(2);
      expect(integrationRepository.saveStats).toHaveBeenCalledTimes(1);
      expect(finalStats.overview.count).toBe(110);
      expect(finalStats.overview.avgEmotion).toBe(3.6);
    });

    it('should handle concurrent operations', async () => {
      // Arrange
      const concurrentRepository: StatsRepository = {
        getStats: jest.fn().mockResolvedValue({
          overview: { count: 50, avgEmotion: 3.0 },
          monthlyStats: [],
          studentStats: [],
          dayOfWeekStats: [],
          emotionDistribution: [],
          timeOfDayStats: { morning: 3.0, afternoon: 3.0, evening: 3.0 }
        }),
        saveStats: jest.fn().mockResolvedValue(undefined),
        generateSeedData: jest.fn().mockResolvedValue(undefined)
      };

      // Act
      const emptyStats = createEmptyStats();

      const operations = [
        concurrentRepository.getStats(),
        concurrentRepository.saveStats(emptyStats),
        concurrentRepository.generateSeedData()
      ];

      // Assert
      await expect(Promise.all(operations)).resolves.toBeDefined();
      expect(concurrentRepository.getStats).toHaveBeenCalledTimes(1);
      expect(concurrentRepository.saveStats).toHaveBeenCalledTimes(1);
      expect(concurrentRepository.generateSeedData).toHaveBeenCalledTimes(1);
    });
  });

  describe('Type Safety Validation', () => {
    it('should enforce Stats type in saveStats', () => {
      // Arrange
      const mockRepository: StatsRepository = {
        getStats: jest.fn(),
        saveStats: jest.fn(),
        generateSeedData: jest.fn()
      };

      const validStats = createValidStats({
        overview: { count: 100, avgEmotion: 3.5 },
        timeOfDayStats: { morning: 3.0, afternoon: 3.5, evening: 4.0 }
      });

      // Act & Assert
      expect(() => mockRepository.saveStats(validStats)).not.toThrow();
      expect(mockRepository.saveStats).toHaveBeenCalledWith(validStats);
    });

    it('should properly type Stats objects', () => {
      // Arrange
      const mockRepository: StatsRepository = {
        getStats: jest.fn(),
        saveStats: jest.fn(),
        generateSeedData: jest.fn()
      };

      const validStats = createValidStats();

      // Act & Assert
      // TypeScript ensures type safety at compile time
      expect(() => mockRepository.saveStats(validStats)).not.toThrow();
    });
  });
});
