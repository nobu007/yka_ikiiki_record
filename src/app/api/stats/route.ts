import { NextResponse } from 'next/server';
import { ensureServer } from '../../../mirage';
import { calculateStats } from '../../../utils/statsCalculator';
import { z } from 'zod';

// カスタムエラークラス
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// レスポンスヘルパー
const createResponse = (data: unknown, status = 200) => {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
};

/** App Router ではキャッシュを防ぐため */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 環境チェック
    if (process.env.NEXT_PUBLIC_MOCK !== "true") {
      throw new ApiError(400, 'MOCK_DISABLED', 'Mock mode is not enabled');
    }

    const server = ensureServer();
    if (!server) {
      throw new ApiError(500, 'SERVER_ERROR', 'Failed to initialize mock server');
    }

    // データ取得とバリデーション
    const records = server.schema.all('record').models;
    if (!records || !Array.isArray(records)) {
      throw new ApiError(500, 'DATA_ERROR', 'Invalid data format');
    }

    // 統計計算
    const stats = calculateStats(records);

    // レスポンスバリデーション
    const statsSchema = z.object({
      overview: z.object({
        count: z.number(),
        avgEmotion: z.string()
      }),
      monthlyStats: z.array(z.object({
        month: z.string(),
        count: z.number(),
        avgEmotion: z.string()
      })),
      studentStats: z.array(z.object({
        student: z.string(),
        recordCount: z.number(),
        avgEmotion: z.string(),
        trendline: z.array(z.number())
      })),
      dayOfWeekStats: z.array(z.object({
        day: z.string(),
        avgEmotion: z.string(),
        count: z.number()
      })),
      emotionDistribution: z.array(z.number()),
      timeOfDayStats: z.object({
        morning: z.string(),
        afternoon: z.string(),
        evening: z.string()
      })
    });

    const validatedStats = statsSchema.parse(stats);
    return createResponse(validatedStats);

  } catch (error) {
    console.error('Stats API Error:', error);

    if (error instanceof ApiError) {
      return createResponse(
        {
          error: error.code,
          message: error.message
        },
        error.statusCode
      );
    }

    if (error instanceof z.ZodError) {
      return createResponse(
        {
          error: 'VALIDATION_ERROR',
          message: 'Data validation failed',
          details: error.errors
        },
        400
      );
    }

    return createResponse(
      {
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      },
      500
    );
  }
}
