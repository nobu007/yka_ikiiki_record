import { createStatsRepository, createStatsService, isPrismaProvider } from '@/infrastructure/factories/repositoryFactory';
import { MockStatsRepository } from '@/infrastructure/storage/MockStatsRepository';
import { PrismaStatsRepository } from '@/infrastructure/repositories/PrismaStatsRepository';
import { StatsService } from '@/domain/services/StatsService';

describe('repositoryFactory', () => {
  const originalProvider = process.env.DATABASE_PROVIDER;

  afterEach(() => {
    if (originalProvider === undefined) {
      delete process.env.DATABASE_PROVIDER;
    } else {
      process.env.DATABASE_PROVIDER = originalProvider;
    }
  });

  describe('createStatsRepository', () => {
    it('should return MockStatsRepository when provider is mirage', () => {
      process.env.DATABASE_PROVIDER = 'mirage';

      const repository = createStatsRepository();

      expect(repository).toBeInstanceOf(MockStatsRepository);
    });

    it('should return MockStatsRepository when provider is not set', () => {
      delete process.env.DATABASE_PROVIDER;

      const repository = createStatsRepository();

      expect(repository).toBeInstanceOf(MockStatsRepository);
    });

    it('should return PrismaStatsRepository when provider is prisma', () => {
      process.env.DATABASE_PROVIDER = 'prisma';

      const repository = createStatsRepository();

      expect(repository).toBeInstanceOf(PrismaStatsRepository);
    });

    it('should throw error for invalid provider', () => {
      process.env.DATABASE_PROVIDER = 'invalid' as never;

      expect(() => createStatsRepository()).toThrow('Invalid DATABASE_PROVIDER: invalid');
    });
  });

  describe('createStatsService', () => {
    it('should return StatsService with MockStatsRepository when provider is mirage', () => {
      process.env.DATABASE_PROVIDER = 'mirage';

      const service = createStatsService();

      expect(service).toBeInstanceOf(StatsService);
    });

    it('should return StatsService with PrismaStatsRepository when provider is prisma', () => {
      process.env.DATABASE_PROVIDER = 'prisma';

      const service = createStatsService();

      expect(service).toBeInstanceOf(StatsService);
    });
  });

  describe('isPrismaProvider', () => {
    it('should return false when provider is mirage', () => {
      process.env.DATABASE_PROVIDER = 'mirage';

      expect(isPrismaProvider()).toBe(false);
    });

    it('should return false when provider is not set', () => {
      delete process.env.DATABASE_PROVIDER;

      expect(isPrismaProvider()).toBe(false);
    });

    it('should return true when provider is prisma', () => {
      process.env.DATABASE_PROVIDER = 'prisma';

      expect(isPrismaProvider()).toBe(true);
    });

    it('should throw error for invalid provider', () => {
      process.env.DATABASE_PROVIDER = 'invalid' as never;

      expect(() => isPrismaProvider()).toThrow('Invalid DATABASE_PROVIDER: invalid');
    });
  });
});
