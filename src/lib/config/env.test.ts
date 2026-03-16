import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('env configuration', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateEnv', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('should return default values when env vars are not set', () => {
      delete process.env.NODE_ENV;
      delete process.env.DATABASE_PROVIDER;

      const { getEnv } = require('./env');
      const env = getEnv();

      expect(env.NODE_ENV).toBe('development');
      expect(env.DATABASE_PROVIDER).toBe('mirage');
    });

    it('should return custom values when env vars are set', () => {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_PROVIDER = 'prisma';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';

      const { getEnv } = require('./env');
      const env = getEnv();

      expect(env.NODE_ENV).toBe('production');
      expect(env.DATABASE_PROVIDER).toBe('prisma');
      expect(env.DATABASE_URL).toBe('postgresql://localhost:5432/test');
    });

    it('should throw error when DATABASE_PROVIDER=prisma but DATABASE_URL is missing', () => {
      process.env.DATABASE_PROVIDER = 'prisma';
      delete process.env.DATABASE_URL;

      const { getEnv } = require('./env');

      expect(() => getEnv()).toThrow(
        'DATABASE_URL is required when DATABASE_PROVIDER=prisma'
      );
    });

    it('should throw error for invalid NODE_ENV', () => {
      process.env.NODE_ENV = 'invalid' as never;

      const { getEnv } = require('./env');

      expect(() => getEnv()).toThrow();
    });

    it('should throw error for invalid DATABASE_PROVIDER', () => {
      process.env.DATABASE_PROVIDER = 'invalid' as never;

      const { getEnv } = require('./env');

      expect(() => getEnv()).toThrow();
    });

    it('should throw error for invalid DATABASE_URL format', () => {
      process.env.DATABASE_URL = 'not-a-valid-url';

      const { getEnv } = require('./env');

      expect(() => getEnv()).toThrow();
    });

    it('should cache env validation result', () => {
      process.env.DATABASE_PROVIDER = 'prisma';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';

      const { getEnv } = require('./env');
      const env1 = getEnv();
      const env2 = getEnv();

      expect(env1).toBe(env2);
    });
  });

  describe('isPrismaProvider', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('should return true when DATABASE_PROVIDER is prisma', () => {
      process.env.DATABASE_PROVIDER = 'prisma';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';

      const { isPrismaProvider } = require('./env');

      expect(isPrismaProvider()).toBe(true);
    });

    it('should return false when DATABASE_PROVIDER is mirage', () => {
      process.env.DATABASE_PROVIDER = 'mirage';

      const { isPrismaProvider } = require('./env');

      expect(isPrismaProvider()).toBe(false);
    });
  });

  describe('isDevelopment', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('should return true in development', () => {
      process.env.NODE_ENV = 'development';

      const { isDevelopment } = require('./env');

      expect(isDevelopment()).toBe(true);
    });

    it('should return false in production', () => {
      process.env.NODE_ENV = 'production';

      const { isDevelopment } = require('./env');

      expect(isDevelopment()).toBe(false);
    });
  });

  describe('isProduction', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('should return true in production', () => {
      process.env.NODE_ENV = 'production';

      const { isProduction } = require('./env');

      expect(isProduction()).toBe(true);
    });

    it('should return false in development', () => {
      process.env.NODE_ENV = 'development';

      const { isProduction } = require('./env');

      expect(isProduction()).toBe(false);
    });
  });

  describe('isTest', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('should return true in test environment', () => {
      process.env.NODE_ENV = 'test';

      const { isTest } = require('./env');

      expect(isTest()).toBe(true);
    });

    it('should return false in development', () => {
      process.env.NODE_ENV = 'development';

      const { isTest } = require('./env');

      expect(isTest()).toBe(false);
    });
  });
});
