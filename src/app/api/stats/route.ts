import { NextRequest } from 'next/server';
import { StatsResponseSchema } from '@/schemas/api';
import { createSuccessResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/api/error-handler';
import { StatsService } from '@/domain/services/StatsService';
import { MockStatsRepository } from '@/infrastructure/storage/MockStatsRepository';

// リポジトリとサービスのインスタンスを作成
const repository = new MockStatsRepository();
const statsService = new StatsService(repository);

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    // StatsServiceを使用してデータを取得
    const stats = await statsService.getStats();

    // レスポンスの生成
    const response = {
      success: true,
      data: stats
    };

    // スキーマによる検証とレスポンス生成
    return createSuccessResponse(response, StatsResponseSchema);
  });
}
