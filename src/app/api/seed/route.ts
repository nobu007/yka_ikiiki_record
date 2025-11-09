import { NextRequest, NextResponse } from 'next/server';
import { SeedRequestSchema, SeedResponseSchema } from '@/schemas/api';
import { createSuccessResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/api/error-handler';
import { StatsService } from '@/domain/services/StatsService';
import { MockStatsRepository } from '@/infrastructure/storage/MockStatsRepository';
import { validateDataSafe } from '@/lib/api/validation';
import { createError } from '@/lib/api/error-handler';

// リポジトリとサービスのインスタンスを作成
const repository = new MockStatsRepository();
const statsService = new StatsService(repository);

/**
 * POST /api/seed
 * テストデータを生成するAPIエンドポイント
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  return withErrorHandler(async () => {
    try {
      // リクエストボディの取得と検証
      let rawData;
      try {
        rawData = await req.json();
      } catch (parseError) {
        throw createError.badRequest('リクエストボディの解析に失敗しました');
      }

      const [validated, error] = validateDataSafe(rawData, SeedRequestSchema);

      if (error || !validated) {
        throw createError.badRequest(error || 'リクエストデータの検証に失敗しました');
      }

      // StatsServiceを使用してシードデータを生成
      await statsService.generateSeedData(validated.config);

      // レスポンスの生成
      const response = {
        success: true,
        message: 'テストデータの生成が完了しました'
      };

      // スキーマによる検証とレスポンス生成
      return createSuccessResponse(response, SeedResponseSchema);
    } catch (error) {
      // エラーハンドリング
      console.error('Seed API Error:', error);
      throw error;
    }
  });
}
