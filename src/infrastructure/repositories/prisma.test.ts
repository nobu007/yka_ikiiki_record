import { prisma } from "../../lib/prisma";

describe("Prisma Client Singleton", () => {
  describe("singleton pattern", () => {
    it("should export a prisma instance", () => {
      expect(prisma).toBeDefined();
      expect(typeof prisma).toBe("object");
    });

    it("should maintain the same instance across imports", async () => {
      const { prisma: prisma2 } = await import("../../lib/prisma");

      expect(prisma).toBe(prisma2);
    });
  });

  describe("configuration", () => {
    it("should have record model available", () => {
      expect(prisma.record).toBeDefined();
      expect(typeof prisma.record.findMany).toBe("function");
      expect(typeof prisma.record.create).toBe("function");
    });
  });

  describe("Prisma Client API", () => {
    it("should have transaction support", () => {
      expect(typeof prisma.$transaction).toBe("function");
    });

    it("should have query methods", () => {
      expect(typeof prisma.$queryRaw).toBe("function");
      expect(typeof prisma.$executeRaw).toBe("function");
    });
  });
});
