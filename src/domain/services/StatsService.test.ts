import { StatsService } from './StatsService';
import { StatsRepository } from '../repositories/StatsRepository';
import { DataGenerationConfig } from '../entities/DataGeneration';
import { Stats } from '../entities/Stats';
import { generateEmotion } from './EmotionGenerator';

// Mock the dependencies
jest.mock('../repositories/StatsRepository');
jest.mock('./EmotionGenerator');

const mockGenerateEmotion = generateEmotion as jest.MockedFunction<typeof generateEmotion>;

describe('StatsService', () => {
  let statsService: StatsService;
  let mockRepository: jest.Mocked<StatsRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRepository = {
      getStats: jest.fn(),
      saveStats: jest.fn()
    } as jest.Mocked<StatsRepository>;

    // Mock generateEmotion function
    mockGenerateEmotion.mockReturnValue(3.5);

    statsService = new StatsService(mockRepository);
  });

  describe('getStats', () => {
    it('should return stats from repository', async () => {
      const mockStats: Stats = {
        overview: { count: 100, avgEmotion: 3.5 },
        monthlyStats: [],
        studentStats: [],
        dayOfWeekStats: [],
        emotionDistribution: [],
        timeOfDayStats: []
      };

      mockRepository.getStats.mockResolvedValue(mockStats);

      const result = await statsService.getStats();

      expect(mockRepository.getStats).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockStats);
    });
  });

  describe('generateSeedData', () => {
    it('should generate and save stats data', async () => {
      const config: DataGenerationConfig = {
        periodDays: 30,
        studentCount: 5,
        pattern: 'normal',
        events: []
      };

      await statsService.generateSeedData(config);

      expect(mockRepository.saveStats).toHaveBeenCalledTimes(1);
      
      // Verify the saved data structure
      const savedStats = mockRepository.saveStats.mock.calls[0][0];
      expect(savedStats).toHaveProperty('overview');
      expect(savedStats).toHaveProperty('monthlyStats');
      expect(savedStats).toHaveProperty('studentStats');
      expect(savedStats).toHaveProperty('dayOfWeekStats');
      expect(savedStats).toHaveProperty('emotionDistribution');
      expect(savedStats).toHaveProperty('timeOfDayStats');
    });

    it('should generate data with default config when no config provided', async () => {
      await statsService.generateSeedData();

      expect(mockRepository.saveStats).toHaveBeenCalledTimes(1);
      
      const savedStats = mockRepository.saveStats.mock.calls[0][0];
      expect(savedStats.overview.count).toBeGreaterThan(0);
      expect(savedStats.overview.avgEmotion).toBeGreaterThanOrEqual(1);
      expect(savedStats.overview.avgEmotion).toBeLessThanOrEqual(5);
    });

    it('should generate correct number of records based on config', async () => {
      const config: DataGenerationConfig = {
        periodDays: 10,
        studentCount: 3,
        pattern: 'normal',
        events: []
      };

      await statsService.generateSeedData(config);

      const savedStats = mockRepository.saveStats.mock.calls[0][0];
      
      // Each student should have 1-3 records per day
      // So total records should be between studentCount * periodDays and studentCount * periodDays * 3
      const minRecords = config.studentCount * config.periodDays;
      const maxRecords = config.studentCount * config.periodDays * 3;
      
      expect(savedStats.overview.count).toBeGreaterThanOrEqual(minRecords);
      expect(savedStats.overview.count).toBeLessThanOrEqual(maxRecords);
    });

    it('should generate valid emotion values', async () => {
      const config: DataGenerationConfig = {
        periodDays: 5,
        studentCount: 2,
        pattern: 'normal',
        events: []
      };

      await statsService.generateSeedData(config);

      const savedStats = mockRepository.saveStats.mock.calls[0][0];
      
      expect(savedStats.overview.avgEmotion).toBeGreaterThanOrEqual(1);
      expect(savedStats.overview.avgEmotion).toBeLessThanOrEqual(5);
    });
  });

  describe('private methods', () => {
    it('should generate emotion data with correct structure', async () => {
      const config: DataGenerationConfig = {
        periodDays: 1,
        studentCount: 1,
        pattern: 'normal',
        events: []
      };

      await statsService.generateSeedData(config);

      const savedStats = mockRepository.saveStats.mock.calls[0][0];
      
      // Verify that all stats arrays have the expected structure
      expect(Array.isArray(savedStats.monthlyStats)).toBe(true);
      expect(Array.isArray(savedStats.studentStats)).toBe(true);
      expect(Array.isArray(savedStats.dayOfWeekStats)).toBe(true);
      expect(Array.isArray(savedStats.emotionDistribution)).toBe(true);
      // timeOfDayStats is an object, not an array
      expect(typeof savedStats.timeOfDayStats).toBe('object');
      expect(savedStats.timeOfDayStats).toHaveProperty('morning');
      expect(savedStats.timeOfDayStats).toHaveProperty('afternoon');
      expect(savedStats.timeOfDayStats).toHaveProperty('evening');
    });
  });
});