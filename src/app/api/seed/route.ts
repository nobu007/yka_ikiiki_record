import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { normalizeError, logError } from '@/lib/error-handler';
import { dataService, DataGenerationConfig, GeneratedStats } from '@/infrastructure/services/dataService';
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
  data: GeneratedStats;
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

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { config } = SeedRequestSchema.parse(body);
    
    // Transform the parsed config to match DataGenerationConfig requirements
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

    return NextResponse.json({
      success: true,
      message: 'テストデータの生成が完了しました'
    });
  } catch (error) {
    const appError = normalizeError(error);
    logError(appError, 'API:seed:POST');
    
    return NextResponse.json(
      { 
        success: false, 
        error: appError.message 
      },
      { status: appError.statusCode || 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  try {
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

    return NextResponse.json({
      success: true,
      data: storedData.data,
      metadata: {
        timestamp: storedData.timestamp,
        age: Date.now() - storedData.timestamp,
        config: storedData.config
      }
    });
  } catch (error) {
    const appError = normalizeError(error);
    logError(appError, 'API:seed:GET');
    
    return NextResponse.json(
      { 
        success: false, 
        error: appError.message 
      },
      { status: appError.statusCode || 500 }
    );
  }
}