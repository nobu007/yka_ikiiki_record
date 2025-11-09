import { NextRequest, NextResponse } from 'next/server';
import { SeedRequestSchema } from '@/schemas/api';
import { withErrorHandler, parseRequestBody, createError } from '@/lib/api/error-handler';
import { StatsService } from '@/domain/services/StatsService';
import { MockStatsRepository } from '@/infrastructure/storage/MockStatsRepository';
import { validateDataSafe } from '@/lib/api/validation';

const repository = new MockStatsRepository();
const statsService = new StatsService(repository);

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withErrorHandler(async () => {
    const rawData = await parseRequestBody(req);

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