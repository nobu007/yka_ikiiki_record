import { NextRequest, NextResponse } from 'next/server';
import { StatsResponseSchema } from '@/schemas/api';
import { createSuccessResponse } from '@/lib/api/response';
import { withResilientHandler } from '@/lib/api/error-handler';
import { createStatsService } from '@/infrastructure/factories/repositoryFactory';
import { createError } from '@/lib/api/error-handler';

export async function GET(_req: NextRequest): Promise<NextResponse> {
  return withResilientHandler(async () => {
    const statsService = createStatsService();
    const stats = await statsService.getStats();

    if (!stats) {
      throw createError.notFound('統計データが見つかりません');
    }

    const response = {
      success: true,
      data: stats
    };
    return createSuccessResponse(response, StatsResponseSchema);
  }, {
    operationName: 'GET /api/stats',
    timeoutMs: 10000
  });
}
