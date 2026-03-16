import { GET } from '../route';

const originalEnv = process.env.DATABASE_PROVIDER;

beforeAll(() => {
  process.env.DATABASE_PROVIDER = 'mirage';
});

afterAll(() => {
  process.env.DATABASE_PROVIDER = originalEnv;
});

const mockGenerateSeedData = jest.fn().mockResolvedValue(undefined);
const mockGetStats = jest.fn().mockResolvedValue({
  overview: { count: 100, avgEmotion: 3.5 },
  monthlyStats: [],
  studentStats: [],
  dayOfWeekStats: [],
  emotionDistribution: [10, 20, 40, 20, 10],
  timeOfDayStats: { morning: 3.2, afternoon: 3.5, evening: 3.0 },
});

const mockStatsService = {
  generateSeedData: mockGenerateSeedData,
  getStats: mockGetStats,
};

let mockIsPrismaProvider = false;

jest.mock('@/infrastructure/factories/repositoryFactory', () => ({
  createStatsService: jest.fn(() => mockStatsService),
  isPrismaProvider: jest.fn(() => mockIsPrismaProvider),
}));

jest.mock('@/infrastructure/services/dataService', () => ({
  dataService: {
    generateStats: jest.fn(),
  },
  DataGenerationConfig: {},
  GeneratedStats: {},
}));

describe('API seed route GET (Prisma provider)', () => {
  beforeAll(() => {
    mockIsPrismaProvider = true;
  });

  afterAll(() => {
    mockIsPrismaProvider = false;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns stats from Prisma database', async () => {
    const response = await GET();
    const body = await response.json();

    expect(mockGetStats).toHaveBeenCalledTimes(1);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  it('handles errors from getStats', async () => {
    mockGetStats.mockRejectedValueOnce(new Error('Query failed'));

    const response = await GET();
    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });
});
