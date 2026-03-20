import { StatsRepository } from "@/domain/repositories/StatsRepository";
import { IRecordRepository } from "@/domain/repositories/IRecordRepository";
import { StatsService } from "@/domain/services/StatsService";
import { MockStatsRepository } from "@/infrastructure/storage/MockStatsRepository";
import { PrismaStatsRepository } from "@/infrastructure/repositories/PrismaStatsRepository";
import { PrismaRecordRepository } from "@/infrastructure/repositories/PrismaRecordRepository";
import { isPrismaProvider } from "@/lib/config/env";

export function createStatsRepository(): StatsRepository {
  if (isPrismaProvider()) {
    const recordRepository = new PrismaRecordRepository();
    return new PrismaStatsRepository(recordRepository);
  }

  return new MockStatsRepository();
}

export function createRecordRepository(): IRecordRepository {
  if (isPrismaProvider()) {
    return new PrismaRecordRepository();
  }

  throw new Error("Record repository not available in Mirage mode");
}

export function createStatsService(): StatsService {
  const repository = createStatsRepository();
  return new StatsService(repository);
}
