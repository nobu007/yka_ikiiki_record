// Simplified API route for seed data generation

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError, normalizeError, logError } from '@/lib/error-handler';
import { dataService, DataGenerationConfig } from '@/infrastructure/services/dataService';
import { APP_CONFIG } from '@/lib/config';

// Simple validation schema
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

// Simple in-memory storage (in production, use a proper database)
let storedStats: any = null;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { config } = SeedRequestSchema.parse(body);
    
    const stats = dataService.generateStats(config as DataGenerationConfig);
    storedStats = stats;

    return NextResponse.json({
      success: true,
      message: 'テストデータの生成が完了しました',
      data: stats
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
    if (!storedStats) {
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
      data: storedStats
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