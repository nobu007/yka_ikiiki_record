import { NextRequest } from 'next/server';
import { SeedResponseSchema } from '@/schemas/api';
import { createSuccessResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/api/error-handler';
import { StatsService } from '@/domain/services/StatsService';
import { MockStatsRepository } from '@/infrastructure/storage/MockStatsRepository';

// リポジトリとサービスのインスタンスを作成
const repository = new MockStatsRepository();
const statsService = new StatsService(repository);

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    // StatsServiceを使用してシードデータを生成
    await statsService.generateSeedData();

    // レスポンスの生成
    const response = {
      success: true,
      message: 'テストデータの生成が完了しました'
    };

    // スキーマによる検証とレスポンス生成
    return createSuccessResponse(response, SeedResponseSchema);
  });
}
