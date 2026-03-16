import { NextRequest } from 'next/server';
import { POST } from '../route';

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
  StatsData: {},
}));

function createMockRequest(body: object): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
}

describe('API seed route POST (Prisma provider)', () => {
  beforeAll(() => {
    mockIsPrismaProvider = true;
  });

  afterAll(() => {
    mockIsPrismaProvider = false;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls generateSeedData when using Prisma provider', async () => {
    const req = createMockRequest({});
    const response = await POST(req);
    const body = await response.json();

    expect(mockGenerateSeedData).toHaveBeenCalledTimes(1);
    expect(body.success).toBe(true);
    expect(body.message).toBe('テストデータの生成が完了しました');
  });

  it('ignores request body and uses Prisma seed logic', async () => {
    const req = createMockRequest({
      config: { studentCount: 999 },
    });
    await POST(req);

    expect(mockGenerateSeedData).toHaveBeenCalledTimes(1);
  });

  it('handles errors from generateSeedData', async () => {
    mockGenerateSeedData.mockRejectedValueOnce(new Error('Database connection failed'));

    const req = createMockRequest({});
    const response = await POST(req);
    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });
});
