import { StatsRepository } from "@/domain/repositories/StatsRepository";
import { StatsService } from "@/domain/services/StatsService";
import { MockStatsRepository } from "@/infrastructure/storage/MockStatsRepository";
import { PrismaStatsRepository } from "@/infrastructure/repositories/PrismaStatsRepository";
import { PrismaRecordRepository } from "@/infrastructure/repositories/PrismaRecordRepository";
import { isPrismaProvider as checkIsPrismaProvider } from "@/lib/config/env";

export function createStatsRepository(): StatsRepository {
  if (checkIsPrismaProvider()) {
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
  return checkIsPrismaProvider();
}
