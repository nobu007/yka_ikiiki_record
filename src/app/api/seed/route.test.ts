import { NextRequest } from 'next/server';
import { POST, GET } from './route';
import { dataService } from '@/infrastructure/services/dataService';

const getRouteHandlers = () => {
  const route = require('./route');
  return { POST: route.POST, GET: route.GET };
};

const originalEnv = process.env.DATABASE_PROVIDER;

beforeAll(() => {
  process.env.DATABASE_PROVIDER = 'mirage';
});

afterAll(() => {
  process.env.DATABASE_PROVIDER = originalEnv;
});

// Mock dataService
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

// Mock repository factory
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
  getStats: mockGetStats
};

let mockIsPrismaProvider = false;

jest.mock('@/infrastructure/factories/repositoryFactory', () => ({
  createStatsService: jest.fn(() => mockStatsService),
  isPrismaProvider: jest.fn(() => mockIsPrismaProvider),
}));

function createMockRequest(body: object): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
}

describe('API seed route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
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
          periodDays: -1, // invalid: min 1
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

    it('handles errors in GET route', async () => {
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

      const req = {
        json: jest.fn().mockRejectedValue(new Error('Test error')),
      } as unknown as NextRequest;
      const response = await POST(req);
      const body = await response.json();

      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });
  });

  describe('GET', () => {
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
      // First GET should return data
      const response1 = await GET();
      expect(response1.status).toBe(200);

      // The cleanupOldData function is called but data is still fresh
      // so it won't be cleaned up yet
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

  describe('POST (Prisma provider)', () => {
    beforeAll(() => {
      mockIsPrismaProvider = true;
    });

    afterAll(() => {
      mockIsPrismaProvider = false;
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
      expect(dataService.generateStats).not.toHaveBeenCalled();
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

  describe('GET (Prisma provider)', () => {
    beforeAll(() => {
      mockIsPrismaProvider = true;
    });

    afterAll(() => {
      mockIsPrismaProvider = false;
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
});
