import { PrismaStatsRepository } from './PrismaStatsRepository';
import { PrismaRecordRepository } from './PrismaRecordRepository';

jest.mock('./PrismaRecordRepository');

describe('PrismaStatsRepository.saveStats', () => {
  let repository: PrismaStatsRepository;
  let mockRecordRepository: jest.Mocked<PrismaRecordRepository>;

  beforeAll(() => {
    mockRecordRepository = new PrismaRecordRepository() as jest.Mocked<PrismaRecordRepository>;
    repository = new PrismaStatsRepository(mockRecordRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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

  it('should handle out of bounds student index with fallback to Unknown', async () => {
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
    const savedRecords = mockRecordRepository.saveMany.mock.calls[0]![0] as Array<{ student: string }>;
    savedRecords.forEach(record => {
      expect(record.student).toBe('Unknown');
    });
  });
});
