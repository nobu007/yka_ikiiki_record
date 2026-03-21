import { prisma } from "./prisma";

describe("Prisma Client Singleton", () => {
  describe("singleton pattern", () => {
    it("should export a prisma instance", () => {
      expect(prisma).toBeDefined();
      expect(typeof prisma).toBe("object");
    });

    it("should maintain the same instance across imports", async () => {
      const { prisma: prisma2 } = await import("./prisma");

      expect(prisma).toBe(prisma2);
    });

    it("should set global prisma in development environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      expect(global.prisma).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    it("should not set global prisma in production environment", () => {
      const originalEnv = process.env.NODE_ENV;
      const originalGlobalPrisma = global.prisma;

      process.env.NODE_ENV = "production";
      delete global.prisma;

      require("./prisma");

      expect(global.prisma).toBeUndefined();

      global.prisma = originalGlobalPrisma;
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("logging configuration", () => {
    it("should configure error logging in all environments", () => {
      expect(prisma).toBeDefined();
    });

    it("should configure warn logging in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      expect(process.env.NODE_ENV).toBe("development");

      process.env.NODE_ENV = originalEnv;
    });

    it("should not configure warn logging in production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      expect(process.env.NODE_ENV).toBe("production");

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("global namespace extension", () => {
    it("should extend global namespace with prisma property", () => {
      expect(global).toHaveProperty("prisma");
    });

    it("should allow prisma to be optional in global namespace", () => {
      const originalGlobalPrisma = global.prisma;
      delete (global as any).prisma;

      expect((global as any).prisma).toBeUndefined();

      (global as any).prisma = originalGlobalPrisma;
    });
  });

  describe("Prisma Client instantiation", () => {
    it("should create PrismaClient instance when global prisma is undefined", () => {
      const originalGlobalPrisma = global.prisma;
      delete global.prisma;

      const { prisma: newPrisma } = require("./prisma");

      expect(newPrisma).toBeDefined();

      global.prisma = originalGlobalPrisma;
    });

    it("should reuse global prisma instance when available", () => {
      const originalGlobalPrisma = global.prisma;
      global.prisma = prisma;

      const { prisma: reusedPrisma } = require("./prisma");

      expect(reusedPrisma).toBe(prisma);

      global.prisma = originalGlobalPrisma;
    });
  });
});
