import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withResilientHandler } from '@/lib/api/error-handler';
import { createSuccessResponse } from '@/lib/api/response';
import { createStatsService, isPrismaProvider } from '@/infrastructure/factories/repositoryFactory';
import { dataService, DataGenerationConfig } from '@/infrastructure/services/dataService';
import { StatsData } from '@/schemas/api';
import { APP_CONFIG } from '@/lib/config';

const SeedRequestSchema = z.object({
  config: z.object({
    periodDays: z.number().min(1).max(365).default(APP_CONFIG.generation.defaultPeriodDays),
    studentCount: z.number().min(1).max(100).default(APP_CONFIG.generation.defaultStudentCount),
    distributionPattern: z.enum(['normal', 'bimodal', 'stress', 'happy']).default(APP_CONFIG.generation.defaultPattern),
    classCharacteristics: z.object({
      volatility: z.number().min(0).max(1).default(0.5),
      baselineEmotion: z.number().min(1).max(5).default(3.0)
    }).optional(),
    seasonalEffects: z.boolean().default(true),
    eventEffects: z.array(z.object({
      startDate: z.string(),
      endDate: z.string(),
      impact: z.number().min(-1).max(1)
    })).default([])
  })
});

interface StoredData {
  data: StatsData;
  timestamp: number;
  config: DataGenerationConfig;
}

let storedData: StoredData | null = null;
const DATA_TTL = 30 * 60 * 1000;

const cleanupOldData = () => {
  if (storedData && Date.now() - storedData.timestamp > DATA_TTL) {
    storedData = null;
  }
};

if (process.env.NODE_ENV === 'test') {
  module.exports.resetStoredData = () => {
    storedData = null;
  };

  module.exports.setStoredDataWithTimestamp = (timestamp: number) => {
    storedData = {
      data: {
        overview: { count: 100, avgEmotion: 3.5 },
        monthlyStats: [],
        studentStats: [],
        dayOfWeekStats: [],
        emotionDistribution: [10, 20, 40, 20, 10],
        timeOfDayStats: { morning: 3.2, afternoon: 3.5, evening: 3.0 },
      },
      timestamp,
      config: {
        studentCount: 20,
        periodDays: 30,
        distributionPattern: 'normal',
        seasonalEffects: true,
        eventEffects: [],
      },
    };
  };

  module.exports.getStoredData = () => storedData;
  module.exports.cleanupOldData = cleanupOldData;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withResilientHandler(async () => {
    if (isPrismaProvider()) {
      const statsService = createStatsService();
      await statsService.generateSeedData();

      return createSuccessResponse({
        success: true,
        message: 'テストデータの生成が完了しました'
      });
    }

    const body = await req.json();
    const { config } = SeedRequestSchema.parse(body);

    const transformedConfig: DataGenerationConfig = {
      studentCount: config.studentCount,
      periodDays: config.periodDays,
      distributionPattern: config.distributionPattern,
      seasonalEffects: config.seasonalEffects,
      eventEffects: config.eventEffects,
      classCharacteristics: config.classCharacteristics || {
        volatility: 0.5,
        baselineEmotion: 3.0
      }
    };

    const stats = dataService.generateStats(transformedConfig);
    storedData = {
      data: stats,
      timestamp: Date.now(),
      config: transformedConfig
    };

    return createSuccessResponse({
      success: true,
      message: 'テストデータの生成が完了しました'
    });
  }, {
    operationName: 'POST /api/seed',
    timeoutMs: 30000
  });
}

export async function GET(): Promise<NextResponse> {
  return withResilientHandler(async () => {
    if (isPrismaProvider()) {
      const statsService = createStatsService();
      const stats = await statsService.getStats();

      return createSuccessResponse({
        success: true,
        data: stats
      });
    }

    cleanupOldData();

    if (!storedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'データがありません。まずPOSTリクエストでデータを生成してください。'
        },
        { status: 404 }
      );
    }

    return createSuccessResponse({
      success: true,
      data: storedData.data,
      metadata: {
        timestamp: storedData.timestamp,
        age: Date.now() - storedData.timestamp,
        config: storedData.config
      }
    });
  }, {
    operationName: 'GET /api/seed',
    timeoutMs: 10000
  });
}