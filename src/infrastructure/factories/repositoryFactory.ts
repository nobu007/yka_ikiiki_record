import { StatsRepository } from "@/domain/repositories/StatsRepository";
import { IRecordRepository } from "@/domain/repositories/IRecordRepository";
import { TrendAnalysisRepository } from "@/domain/repositories/TrendAnalysisRepository";
import { StatsService } from "@/domain/services/StatsService";
import { MockStatsRepository } from "@/infrastructure/storage/MockStatsRepository";
import { PrismaStatsRepository } from "@/infrastructure/repositories/PrismaStatsRepository";
import { PrismaRecordRepository } from "@/infrastructure/repositories/PrismaRecordRepository";
import { InMemoryTrendAnalysisRepository } from "@/infrastructure/storage/InMemoryTrendAnalysisRepository";
import { isPrismaProvider } from "@/lib/config/env";
import { ValidationError } from "@/lib/error-handler";

/**
 * Creates a StatsRepository instance based on the current environment configuration.
 *
 * In production mode (DATABASE_PROVIDER=prisma), returns a PrismaStatsRepository
 * backed by PostgreSQL. In development mode (DATABASE_PROVIDER=mirage), returns
 * a MockStatsRepository with in-memory storage.
 *
 * @returns {StatsRepository} A repository instance for accessing stats data
 *
 * @example
 * ```ts
 * const repository = createStatsRepository();
 * const stats = await repository.getStats();
 * ```
 */
export function createStatsRepository(): StatsRepository {
  if (isPrismaProvider()) {
    const recordRepository = new PrismaRecordRepository();
    return new PrismaStatsRepository(recordRepository);
  }

  return new MockStatsRepository();
}

/**
 * Creates an IRecordRepository instance for record management operations.
 *
 * Only available in production mode (DATABASE_PROVIDER=prisma). In development
 * mode, this function throws a ValidationError as record operations require
 * persistent storage.
 *
 * @returns {IRecordRepository} A repository instance for record operations
 * @throws {ValidationError} If called in Mirage (development) mode
 *
 * @example
 * ```ts
 * try {
 *   const repository = createRecordRepository();
 *   await repository.save(record);
 * } catch (error) {
 *   if (isValidationError(error)) {
 *     // Handle Mirage mode incompatibility
 *   }
 * }
 * ```
 */
export function createRecordRepository(): IRecordRepository {
  if (isPrismaProvider()) {
    return new PrismaRecordRepository();
  }

  throw new ValidationError("Record repository not available in Mirage mode");
}

/**
 * Creates a StatsService instance with its required dependencies.
 *
 * The StatsService provides high-level statistics operations, automatically
 * wired to the appropriate repository based on environment configuration.
 *
 * @returns {StatsService} A service instance for statistics operations
 *
 * @example
 * ```ts
 * const service = createStatsService();
 * const overview = await service.getStats();
 * ```
 */
export function createStatsService(): StatsService {
  const repository = createStatsRepository();
  return new StatsService(repository);
}

/**
 * Creates a TrendAnalysisRepository instance for trend analysis operations.
 *
 * Returns an InMemoryTrendAnalysisRepository with in-memory storage.
 * Suitable for development environments and testing scenarios.
 *
 * @returns {TrendAnalysisRepository} A repository instance for trend analysis operations
 *
 * @example
 * ```ts
 * const repository = createTrendAnalysisRepository();
 * await repository.saveStudentTrend(studentAnalysis);
 * const retrieved = await repository.getStudentTrend("Alice");
 * ```
 */
export function createTrendAnalysisRepository(): TrendAnalysisRepository {
  return new InMemoryTrendAnalysisRepository();
}
