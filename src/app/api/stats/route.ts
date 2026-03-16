import { NextRequest, NextResponse } from 'next/server';
import { StatsResponseSchema } from '@/schemas/api';
import { createSuccessResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/api/error-handler';
import { StatsService } from '@/domain/services/StatsService';
import { MockStatsRepository } from '@/infrastructure/storage/MockStatsRepository';
import { PrismaStatsRepository } from '@/infrastructure/repositories/PrismaStatsRepository';
import { PrismaRecordRepository } from '@/infrastructure/repositories/PrismaRecordRepository';
import { createError } from '@/lib/api/error-handler';

function getRepository() {
  const provider = process.env.DATABASE_PROVIDER || 'mirage';

  if (provider === 'prisma') {
    const recordRepository = new PrismaRecordRepository();
    return new PrismaStatsRepository(recordRepository);
  }

  return new MockStatsRepository();
}

const repository = getRepository();
const statsService = new StatsService(repository);

export async function GET(_req: NextRequest): Promise<NextResponse> {
  return withErrorHandler(async () => {
    try {
      const stats = await statsService.getStats();

      if (!stats) {
        throw createError.notFound('統計データが見つかりません');
      }

      const response = {
        success: true,
        data: stats
      };
      return createSuccessResponse(response, StatsResponseSchema);
    } catch (error) {
      throw error;
    }
  });
}
