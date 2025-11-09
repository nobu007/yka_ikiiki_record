import { NextRequest, NextResponse } from 'next/server';
import { SeedRequestSchema } from '@/schemas/api';
import { withErrorHandler } from '@/lib/api/error-handler';
import { StatsService } from '@/domain/services/StatsService';
import { MockStatsRepository } from '@/infrastructure/storage/MockStatsRepository';
import { validateDataSafe } from '@/lib/api/validation';
import { createError } from '@/lib/api/error-handler';

const repository = new MockStatsRepository();
const statsService = new StatsService(repository);

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withErrorHandler(async () => {
    const rawData = await req.json().catch(() => 
      createError.badRequest('リクエストボディの解析に失敗しました')
    );

    const [validated, error] = validateDataSafe(rawData, SeedRequestSchema);
    if (error || !validated) {
      throw createError.badRequest(error || 'リクエストデータの検証に失敗しました');
    }

    await statsService.generateSeedData(validated.config);

    return NextResponse.json({
      success: true,
      message: 'テストデータの生成が完了しました'
    });
  });
}