import { PrismaStatsRepository } from './PrismaStatsRepository';
import { PrismaRecordRepository } from './PrismaRecordRepository';
import { Record } from '@/domain/entities/Record';

jest.mock('./PrismaRecordRepository');

describe('PrismaStatsRepository', () => {
  let repository: PrismaStatsRepository;
  let mockRecordRepository: jest.Mocked<PrismaRecordRepository>;

  beforeAll(() => {
    mockRecordRepository = new PrismaRecordRepository() as jest.Mocked<PrismaRecordRepository>;
    repository = new PrismaStatsRepository(mockRecordRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('should calculate stats from records', async () => {
      const records: Record[] = [
        {
          emotion: 85.0,
          date: new Date('2024-01-15T10:00:00'),
          student: '学生1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          emotion: 75.0,
          date: new Date('2024-01-15T11:00:00'),
          student: '学生2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          emotion: 90.0,
          date: new Date('2024-01-15T12:00:00'),
          student: '学生3',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRecordRepository.findAll.mockResolvedValue(records);

      const stats = await repository.getStats();

      expect(stats.overview.count).toBe(3);
      expect(stats.overview.avgEmotion).toBeCloseTo(83.33, 1);
      expect(mockRecordRepository.findAll).toHaveBeenCalled();
    });

    it('should return zero stats when no records exist', async () => {
      mockRecordRepository.findAll.mockResolvedValue([]);

      const stats = await repository.getStats();

      expect(stats.overview.count).toBe(0);
      expect(stats.overview.avgEmotion).toBe(0);
    });

    it('should calculate monthly stats', async () => {
      const records: Record[] = [
        {
          emotion: 80.0,
          date: new Date('2024-01-15T10:00:00'),
          student: '学生1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          emotion: 85.0,
          date: new Date('2024-01-20T11:00:00'),
          student: '学生2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          emotion: 75.0,
          date: new Date('2024-02-10T12:00:00'),
          student: '学生3',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRecordRepository.findAll.mockResolvedValue(records);

      const stats = await repository.getStats();

      expect(stats.monthlyStats).toHaveLength(2);
      expect(stats.monthlyStats[0]!.month).toContain('2024-01');
      expect(stats.monthlyStats[0]!.count).toBe(2);
    });

    it('should calculate student stats', async () => {
      const records: Record[] = [
        {
          emotion: 85.0,
          date: new Date('2024-01-15T10:00:00'),
          student: '学生1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          emotion: 80.0,
          date: new Date('2024-01-16T11:00:00'),
          student: '学生1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          emotion: 75.0,
          date: new Date('2024-01-17T12:00:00'),
          student: '学生2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRecordRepository.findAll.mockResolvedValue(records);

      const stats = await repository.getStats();

      expect(stats.studentStats).toHaveLength(3);
      expect(stats.studentStats[0]!.student).toBe('学生1');
      expect(stats.studentStats[0]!.avgEmotion).toBe(85);
      expect(stats.studentStats[0]!.recordCount).toBe(1);
    });

    it('should calculate day of week stats', async () => {
      const records: Record[] = [
        {
          emotion: 85.0,
          date: new Date('2024-01-15T10:00:00'),
          student: '学生1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          emotion: 80.0,
          date: new Date('2024-01-16T11:00:00'),
          student: '学生2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRecordRepository.findAll.mockResolvedValue(records);

      const stats = await repository.getStats();

      expect(stats.dayOfWeekStats.length).toBeGreaterThan(0);
    });

    it('should calculate emotion distribution', async () => {
      const records: Record[] = [
        {
          emotion: 1.5,
          date: new Date('2024-01-15T10:00:00'),
          student: '学生1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          emotion: 2.8,
          date: new Date('2024-01-15T11:00:00'),
          student: '学生2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          emotion: 4.2,
          date: new Date('2024-01-15T12:00:00'),
          student: '学生3',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRecordRepository.findAll.mockResolvedValue(records);

      const stats = await repository.getStats();

      expect(stats.emotionDistribution).toBeDefined();
      expect(stats.emotionDistribution.length).toBeGreaterThan(0);
    });

    it('should calculate time of day stats', async () => {
      const records: Record[] = [
        {
          emotion: 85.0,
          date: new Date('2024-01-15T09:00:00'),
          student: '学生1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          emotion: 80.0,
          date: new Date('2024-01-15T14:00:00'),
          student: '学生2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRecordRepository.findAll.mockResolvedValue(records);

      const stats = await repository.getStats();

      expect(stats.timeOfDayStats).toBeDefined();
      expect(typeof stats.timeOfDayStats.morning).toBe('number');
      expect(typeof stats.timeOfDayStats.afternoon).toBe('number');
      expect(typeof stats.timeOfDayStats.evening).toBe('number');
    });
  });

  describe('saveStats', () => {
    it('should convert stats to records and save', async () => {
      const stats = {
        overview: {
          count: 2,
          avgEmotion: 82.5,
        },
        monthlyStats: [
          {
            month: '2024-01',
            count: 2,
            avgEmotion: 82.5,
          },
        ],
        studentStats: [],
        dayOfWeekStats: [],
        emotionDistribution: [],
        timeOfDayStats: {
          morning: 0,
          afternoon: 0,
          evening: 0,
        },
      };

      mockRecordRepository.saveMany.mockResolvedValue([]);

      await repository.saveStats(stats);

      expect(mockRecordRepository.saveMany).toHaveBeenCalled();
    });

    it('should handle empty monthly stats', async () => {
      const stats = {
        overview: {
          count: 0,
          avgEmotion: 0,
        },
        monthlyStats: [],
        studentStats: [],
        dayOfWeekStats: [],
        emotionDistribution: [],
        timeOfDayStats: {
          morning: 0,
          afternoon: 0,
          evening: 0,
        },
      };

      mockRecordRepository.saveMany.mockResolvedValue([]);

      await expect(repository.saveStats(stats)).resolves.not.toThrow();
    });
  });

  describe('generateSeedData', () => {
    it('should call generateSeedData from PrismaSeedRepository', async () => {
      const mockGenerateSeedData = jest.fn().mockResolvedValue(750);

      jest.doMock('./PrismaSeedRepository', () => ({
        generateSeedData: mockGenerateSeedData,
      }));

      await repository.generateSeedData();

      expect(mockGenerateSeedData).toHaveBeenCalled();
    });
  });
});
