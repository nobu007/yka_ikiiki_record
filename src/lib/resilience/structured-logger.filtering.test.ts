import { StructuredLogger } from "./structured-logger";

describe("StructuredLogger.getLogs", () => {
  let logger: StructuredLogger;

  beforeEach(() => {
    logger = new StructuredLogger();
    logger.info("CAT1", "op1", {}, "INTERNAL");
    logger.debug("CAT1", "op2", {}, "DEBUG");
    logger.error("CAT2", "op3", {}, "INTERNAL");
    logger.warn("CAT1", "op4", {}, "TRACE");
  });

  describe("filtering", () => {
    it("should filter by level", () => {
      const errorLogs = logger.getLogs({ level: "ERROR" });
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0]?.level).toBe("ERROR");
    });

    it("should filter by category", () => {
      const cat1Logs = logger.getLogs({ category: "CAT1" });
      expect(cat1Logs).toHaveLength(3);
      expect(cat1Logs.every((log) => log.category === "CAT1")).toBe(true);
    });

    it("should filter by operation", () => {
      const op1Logs = logger.getLogs({ operation: "op1" });
      expect(op1Logs).toHaveLength(1);
      expect(op1Logs[0]?.operation).toBe("op1");
    });

    it("should filter by visibility", () => {
      const internalLogs = logger.getLogs({ visibility: "INTERNAL" });
      expect(internalLogs).toHaveLength(2);
      expect(internalLogs.every((log) => log.visibility === "INTERNAL")).toBe(
        true,
      );
    });

    it("should filter by time range", () => {
      const now = Date.now();
      logger.info("TIMERANGE", "test", { timestamp: now });

      const logs = logger.getLogs({
        timeRange: [now - 1000, now + 1000],
      });
      expect(logs.length).toBeGreaterThan(0);
    });

    it("should exclude logs outside time range", () => {
      const now = Date.now();
      logger.info("TIMERANGE", "inside", { timestamp: now });

      const logs = logger.getLogs({
        timeRange: [now - 10000, now - 5000],
      });
      expect(logs).toHaveLength(0);
    });

    it("should combine multiple filters", () => {
      const logs = logger.getLogs({
        level: "INFO",
        category: "CAT1",
      });
      expect(logs).toHaveLength(1);
      const firstLog = logs[0]!;
      expect(firstLog.level).toBe("INFO");
      expect(firstLog.category).toBe("CAT1");
    });

    it("should return all logs when no filters provided", () => {
      const logs = logger.getLogs({});
      expect(logs.length).toBeGreaterThan(0);
    });
  });
});
