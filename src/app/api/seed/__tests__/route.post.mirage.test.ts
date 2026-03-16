import { NextRequest } from 'next/server';
import { POST } from '../route';
import { dataService } from '@/infrastructure/services/dataService';

const getRouteHandlers = () => {
  const route = require('../route');
  return { POST: route.POST };
};

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
  StatsData: {},
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

describe('API seed route POST (Mirage provider)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validBody = {
    config: {
      periodDays: 30,
      studentCount: 20,
      distributionPattern: 'normal',
      seasonalEffects: true,
      eventEffects: [],
    },
  };

  it('returns success response for valid config', async () => {
    const { POST } = getRouteHandlers();
    const req = createMockRequest(validBody);
    const response = await POST(req);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.message).toBe('テストデータの生成が完了しました');
  });

  it('calls dataService.generateStats with transformed config', async () => {
    const req = createMockRequest(validBody);
    await POST(req);

    expect(dataService.generateStats).toHaveBeenCalledWith(
      expect.objectContaining({
        studentCount: 20,
        periodDays: 30,
        distributionPattern: 'normal',
        seasonalEffects: true,
        eventEffects: [],
      })
    );
  });

  it('provides default classCharacteristics when not specified', async () => {
    const req = createMockRequest(validBody);
    await POST(req);

    expect(dataService.generateStats).toHaveBeenCalledWith(
      expect.objectContaining({
        classCharacteristics: { volatility: 0.5, baselineEmotion: 3.0 },
      })
    );
  });

  it('passes custom classCharacteristics when specified', async () => {
    const bodyWithChars = {
      config: {
        ...validBody.config,
        classCharacteristics: { volatility: 0.8, baselineEmotion: 4.0 },
      },
    };
    const req = createMockRequest(bodyWithChars);
    await POST(req);

    expect(dataService.generateStats).toHaveBeenCalledWith(
      expect.objectContaining({
        classCharacteristics: { volatility: 0.8, baselineEmotion: 4.0 },
      })
    );
  });

  it('returns error for invalid config (Zod validation)', async () => {
    const invalidBody = {
      config: {
        periodDays: -1,
        studentCount: 'not-a-number',
      },
    };
    const req = createMockRequest(invalidBody);
    const response = await POST(req);
    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });

  it('returns error when req.json() throws', async () => {
    const req = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as NextRequest;
    const response = await POST(req);
    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });

  it('accepts all distribution patterns', async () => {
    for (const pattern of ['normal', 'bimodal', 'stress', 'happy']) {
      const req = createMockRequest({
        config: { ...validBody.config, distributionPattern: pattern },
      });
      await POST(req);
    }
    expect(dataService.generateStats).toHaveBeenCalledTimes(4);
  });

  it('handles errors in POST route', async () => {
    const req = {
      json: jest.fn().mockRejectedValue(new Error('Test error')),
    } as unknown as NextRequest;
    const response = await POST(req);
    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });
});
