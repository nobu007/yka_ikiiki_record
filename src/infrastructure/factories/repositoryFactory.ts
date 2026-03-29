import { StatsRepository } from "@/domain/repositories/StatsRepository";
import { IRecordRepository } from "@/domain/repositories/IRecordRepository";
import { TrendAnalysisRepository } from "@/domain/repositories/TrendAnalysisRepository";
import { BackupRepository } from "@/domain/repositories/BackupRepository";
import { AuditLogRepository } from "@/domain/repositories/AuditLogRepository";
import { StatsService } from "@/domain/services/StatsService";
import { MockStatsRepository } from "@/infrastructure/storage/MockStatsRepository";
import { PrismaStatsRepository } from "@/infrastructure/repositories/PrismaStatsRepository";
import { PrismaRecordRepository } from "@/infrastructure/repositories/PrismaRecordRepository";
import { InMemoryTrendAnalysisRepository } from "@/infrastructure/storage/InMemoryTrendAnalysisRepository";
import { InMemoryBackupRepository } from "@/infrastructure/repositories/InMemoryBackupRepository";
import { InMemoryAuditLogRepository } from "@/infrastructure/repositories/InMemoryAuditLogRepository";
import { InMemoryRecordRepository } from "@/infrastructure/storage/InMemoryRecordRepository";
import { BackupService } from "@/application/services/BackupService";
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

/**
 * Creates a BackupRepository instance for backup operations.
 *
 * Returns an InMemoryBackupRepository with in-memory storage.
 * Suitable for development environments and testing scenarios.
 *
 * @returns {BackupRepository} A repository instance for backup operations
 *
 * @example
 * ```ts
 * const repository = createBackupRepository();
 * const backup = await repository.findById("backup-123");
 * ```
 */
export function createBackupRepository(): BackupRepository {
  return new InMemoryBackupRepository();
}

/**
 * Creates an AuditLogRepository instance for audit logging operations.
 *
 * Returns an InMemoryAuditLogRepository with in-memory storage.
 * Suitable for development environments and testing scenarios.
 *
 * @returns {AuditLogRepository} A repository instance for audit logging
 *
 * @example
 * ```ts
 * const repository = createAuditLogRepository();
 * await repository.create({ ...auditLogEntry });
 * ```
 */
export function createAuditLogRepository(): AuditLogRepository {
  return new InMemoryAuditLogRepository();
}

/**
 * Creates a BackupService instance with its required dependencies.
 *
 * The BackupService provides high-level backup and restore operations,
 * automatically wired to the appropriate repositories based on environment
 * configuration.
 *
 * @returns {BackupService} A service instance for backup and restore operations
 *
 * @example
 * ```ts
 * const service = createBackupService();
 * const backup = await service.createBackup({ source: "manual" }, "user-123");
 * const result = await service.restoreBackup(backup.id);
 * ```
 */
export function createBackupService(): BackupService {
  const backupRepository = createBackupRepository();
  const recordRepository = isPrismaProvider()
    ? createRecordRepository()
    : new InMemoryRecordRepository();
  const statsRepository = createStatsRepository();
  const auditLogRepository = createAuditLogRepository();

  return new BackupService(
    backupRepository,
    recordRepository,
    statsRepository,
    auditLogRepository,
  );
}
