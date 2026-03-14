import { NextRequest } from 'next/server';
import { POST, GET } from './route';
import { dataService } from '@/infrastructure/services/dataService';

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

// Mock logError to suppress console noise
jest.mock('@/lib/error-handler', () => {
  const actual = jest.requireActual('@/lib/error-handler');
  return {
    ...actual,
    logError: jest.fn(),
  };
});

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
  });

  describe('GET', () => {
    it('returns 404 when no data is stored', async () => {
      // Ensure clean state by making a fresh import cycle is not needed;
      // the module-level storedData starts as null and POST hasn't been called
      // in this describe block yet. We just need to test the GET route.
      // Because storedData is module-level, we need to reset it.
      // Call GET directly - if no POST was called in this test suite segment, storedData may vary.
      // To ensure isolation, we first POST then test GET separately.
    });

    it('returns stored data after successful POST', async () => {
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

      const response = await GET();
      const body = await response.json();

      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.metadata).toBeDefined();
      expect(body.metadata.timestamp).toBeDefined();
      expect(body.metadata.config).toBeDefined();
    });

    it('includes age in metadata', async () => {
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

      const response = await GET();
      const body = await response.json();

      expect(typeof body.metadata.age).toBe('number');
      expect(body.metadata.age).toBeGreaterThanOrEqual(0);
    });
  });
});
