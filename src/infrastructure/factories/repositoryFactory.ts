import { StatsRepository } from '@/domain/repositories/StatsRepository';
import { StatsService } from '@/domain/services/StatsService';
import { MockStatsRepository } from '@/infrastructure/storage/MockStatsRepository';
import { PrismaStatsRepository } from '@/infrastructure/repositories/PrismaStatsRepository';
import { PrismaRecordRepository } from '@/infrastructure/repositories/PrismaRecordRepository';

type DatabaseProvider = 'mirage' | 'prisma';

function getProvider(): DatabaseProvider {
  const provider = process.env.DATABASE_PROVIDER || 'mirage';

  if (provider !== 'mirage' && provider !== 'prisma') {
    throw new Error(`Invalid DATABASE_PROVIDER: ${provider}. Must be 'mirage' or 'prisma'`);
  }

  return provider as DatabaseProvider;
}

export function createStatsRepository(): StatsRepository {
  const provider = getProvider();

  if (provider === 'prisma') {
    const recordRepository = new PrismaRecordRepository();
    return new PrismaStatsRepository(recordRepository);
  }

  return new MockStatsRepository();
}

export function createStatsService(): StatsService {
  const repository = createStatsRepository();
  return new StatsService(repository);
}

export function isPrismaProvider(): boolean {
  return getProvider() === 'prisma';
}
