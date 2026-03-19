describe("env configuration", () => {
  const originalEnv = { ...process.env };

  const setEnv = (key: string, value: string | undefined) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  };

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    }
    for (const [key, value] of Object.entries(originalEnv)) {
      process.env[key] = value;
    }
  });

  describe("validateEnv", () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it("should return default values when env vars are not set", () => {
      setEnv("NODE_ENV", undefined);
      setEnv("DATABASE_PROVIDER", undefined);

      const { getEnv } = require("./env");
      const env = getEnv();

      expect(env.NODE_ENV).toBe("development");
      expect(env.DATABASE_PROVIDER).toBe("mirage");
    });

    it("should return custom values when env vars are set", () => {
      setEnv("NODE_ENV", "production");
      setEnv("DATABASE_PROVIDER", "prisma");
      setEnv("DATABASE_URL", "postgresql://localhost:5432/test");

      const { getEnv } = require("./env");
      const env = getEnv();

      expect(env.NODE_ENV).toBe("production");
      expect(env.DATABASE_PROVIDER).toBe("prisma");
      expect(env.DATABASE_URL).toBe("postgresql://localhost:5432/test");
    });

    it("should throw error when DATABASE_PROVIDER=prisma but DATABASE_URL is missing", () => {
      setEnv("DATABASE_PROVIDER", "prisma");
      setEnv("DATABASE_URL", undefined);

      const { getEnv } = require("./env");

      expect(() => getEnv()).toThrow(
        "DATABASE_URL is required when DATABASE_PROVIDER=prisma",
      );
    });

    it("should throw error for invalid NODE_ENV", () => {
      setEnv("NODE_ENV", "invalid");

      const { getEnv } = require("./env");

      expect(() => getEnv()).toThrow();
    });

    it("should throw error for invalid DATABASE_PROVIDER", () => {
      setEnv("DATABASE_PROVIDER", "invalid");

      const { getEnv } = require("./env");

      expect(() => getEnv()).toThrow();
    });

    it("should throw error for invalid DATABASE_URL format", () => {
      setEnv("DATABASE_URL", "not-a-valid-url");

      const { getEnv } = require("./env");

      expect(() => getEnv()).toThrow();
    });

    it("should cache env validation result", () => {
      setEnv("DATABASE_PROVIDER", "prisma");
      setEnv("DATABASE_URL", "postgresql://localhost:5432/test");

      const { getEnv } = require("./env");
      const env1 = getEnv();
      const env2 = getEnv();

      expect(env1).toBe(env2);
    });
  });

  describe("isPrismaProvider", () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it("should return true when DATABASE_PROVIDER is prisma", () => {
      setEnv("DATABASE_PROVIDER", "prisma");
      setEnv("DATABASE_URL", "postgresql://localhost:5432/test");

      const { isPrismaProvider } = require("./env");

      expect(isPrismaProvider()).toBe(true);
    });

    it("should return false when DATABASE_PROVIDER is mirage", () => {
      setEnv("DATABASE_PROVIDER", "mirage");

      const { isPrismaProvider } = require("./env");

      expect(isPrismaProvider()).toBe(false);
    });
  });

  describe("isDevelopment", () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it("should return true in development", () => {
      setEnv("NODE_ENV", "development");

      const { isDevelopment } = require("./env");

      expect(isDevelopment()).toBe(true);
    });

    it("should return false in production", () => {
      setEnv("NODE_ENV", "production");

      const { isDevelopment } = require("./env");

      expect(isDevelopment()).toBe(false);
    });
  });

  describe("isProduction", () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it("should return true in production", () => {
      setEnv("NODE_ENV", "production");

      const { isProduction } = require("./env");

      expect(isProduction()).toBe(true);
    });

    it("should return false in development", () => {
      setEnv("NODE_ENV", "development");

      const { isProduction } = require("./env");

      expect(isProduction()).toBe(false);
    });
  });

  describe("isTest", () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it("should return true in test environment", () => {
      setEnv("NODE_ENV", "test");

      const { isTest } = require("./env");

      expect(isTest()).toBe(true);
    });

    it("should return false in development", () => {
      setEnv("NODE_ENV", "development");

      const { isTest } = require("./env");

      expect(isTest()).toBe(false);
    });
  });
});
