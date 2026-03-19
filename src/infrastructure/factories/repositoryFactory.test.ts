describe("repositoryFactory", () => {
  const originalProvider = process.env.DATABASE_PROVIDER;
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    if (originalProvider === undefined) {
      delete process.env.DATABASE_PROVIDER;
    } else {
      process.env.DATABASE_PROVIDER = originalProvider;
    }
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

  describe("createStatsRepository", () => {
    it("should return MockStatsRepository when provider is mirage", () => {
      process.env.DATABASE_PROVIDER = "mirage";

      const {
        createStatsRepository,
      } = require("@/infrastructure/factories/repositoryFactory");
      const repository = createStatsRepository();

      expect(repository.constructor.name).toBe("MockStatsRepository");
    });

    it("should return MockStatsRepository when provider is not set", () => {
      delete process.env.DATABASE_PROVIDER;

      const {
        createStatsRepository,
      } = require("@/infrastructure/factories/repositoryFactory");
      const repository = createStatsRepository();

      expect(repository.constructor.name).toBe("MockStatsRepository");
    });

    it("should return PrismaStatsRepository when provider is prisma with DATABASE_URL", () => {
      process.env.DATABASE_PROVIDER = "prisma";
      process.env.DATABASE_URL = "postgresql://localhost:5432/test";

      const {
        createStatsRepository,
      } = require("@/infrastructure/factories/repositoryFactory");
      const repository = createStatsRepository();

      expect(repository.constructor.name).toBe("PrismaStatsRepository");
    });

    it("should throw error for invalid provider", () => {
      process.env.DATABASE_PROVIDER = "invalid" as never;

      const {
        createStatsRepository,
      } = require("@/infrastructure/factories/repositoryFactory");

      expect(() => createStatsRepository()).toThrow();
    });

    it("should throw error when provider is prisma but DATABASE_URL is missing", () => {
      process.env.DATABASE_PROVIDER = "prisma";
      delete process.env.DATABASE_URL;

      const {
        createStatsRepository,
      } = require("@/infrastructure/factories/repositoryFactory");

      expect(() => createStatsRepository()).toThrow(
        "DATABASE_URL is required when DATABASE_PROVIDER=prisma",
      );
    });
  });

  describe("createStatsService", () => {
    it("should return StatsService with MockStatsRepository when provider is mirage", () => {
      process.env.DATABASE_PROVIDER = "mirage";

      const {
        createStatsService,
      } = require("@/infrastructure/factories/repositoryFactory");
      const service = createStatsService();

      expect(service.constructor.name).toBe("StatsService");
    });

    it("should return StatsService with PrismaStatsRepository when provider is prisma", () => {
      process.env.DATABASE_PROVIDER = "prisma";
      process.env.DATABASE_URL = "postgresql://localhost:5432/test";

      const {
        createStatsService,
      } = require("@/infrastructure/factories/repositoryFactory");
      const service = createStatsService();

      expect(service.constructor.name).toBe("StatsService");
    });
  });
});
