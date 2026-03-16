import { NextRequest } from 'next/server';
import { POST, GET } from '../route';
import { dataService } from '@/infrastructure/services/dataService';

const originalEnv = process.env.DATABASE_PROVIDER;

beforeAll(() => {
  process.env.DATABASE_PROVIDER = 'mirage';
});

afterAll(() => {
  process.env.DATABASE_PROVIDER = originalEnv;
});

jest.mock('@/infrastructure/services/dataService', () => ({
  dataService: {
    generateStats: jest.fn().mockReturnValue({
      overview: { count: 100, avgEmotion: 3.5 },
      monthlyStats: [],
      studentStats: [],
      dayOfWeekStats: [],
      emotionDistribution: [10, 20, 40, 20, 10],
      timeOfDayStats: { morning: 3.2, afternoon: 3.5, evening: 3.0 },
    }),
  },
  DataGenerationConfig: {},
  GeneratedStats: {},
}));

const mockIsPrismaProvider = false;

jest.mock('@/infrastructure/factories/repositoryFactory', () => ({
  createStatsService: jest.fn(),
  isPrismaProvider: jest.fn(() => mockIsPrismaProvider),
}));

function createMockRequest(body: object): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
}

describe('API seed route GET (Mirage provider)', () => {
  beforeEach(async () => {
    const validBody = {
      config: {
        periodDays: 30,
        studentCount: 20,
        distributionPattern: 'normal',
        seasonalEffects: true,
        eventEffects: [],
      },
    };
    const postReq = createMockRequest(validBody);
    await POST(postReq);
  });

  it('returns cached data when available', async () => {
    const response = await GET();
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.metadata).toBeDefined();
    expect(body.metadata.timestamp).toBeDefined();
    expect(body.metadata.config).toBeDefined();
  });

  it('includes age in metadata', async () => {
    const response = await GET();
    const body = await response.json();

    expect(typeof body.metadata.age).toBe('number');
    expect(body.metadata.age).toBeGreaterThanOrEqual(0);
  });

  it('cleans up old data on GET', async () => {
    const response1 = await GET();
    expect(response1.status).toBe(200);

    const response2 = await GET();
    expect(response2.status).toBe(200);
  });

  it('uses default values when config properties are missing', async () => {
    const partialBody = {
      config: {
        periodDays: 30,
      },
    };
    const req = createMockRequest(partialBody);
    await POST(req);

    expect(dataService.generateStats).toHaveBeenCalledWith(
      expect.objectContaining({
        periodDays: 30,
        studentCount: 20,
        distributionPattern: 'normal',
        seasonalEffects: true,
        eventEffects: [],
      })
    );
  });
});
