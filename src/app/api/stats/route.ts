import { NextRequest, NextResponse } from 'next/server';
import { StatsResponseSchema } from '@/schemas/api';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/api/error-handler';
import { StatsService } from '@/domain/services/StatsService';
import { MockStatsRepository } from '@/infrastructure/storage/MockStatsRepository';
import { createError } from '@/lib/api/error-handler';

// リポジトリとサービスのインスタンスを作成
const repository = new MockStatsRepository();
const statsService = new StatsService(repository);

/**
 * GET /api/stats
 * 統計情報を取得するAPIエンドポイント
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  return withErrorHandler(async () => {
    try {
      // StatsServiceを使用してデータを取得
      const stats = await statsService.getStats();

      // データが存在しない場合のチェック
      if (!stats) {
        throw createError.notFound('統計データが見つかりません');
      }

      // レスポンスの生成
      const response = {
        success: true,
        data: stats
      };

      // スキーマによる検証とレスポンス生成
      return createSuccessResponse(response, StatsResponseSchema);
    } catch (error) {
      // エラーハンドリング
      console.error('Stats API Error:', error);
      throw error;
    }
  });
}
