import { StructuredLogger } from "./structured-logger";
import type { LogVisibility } from "./structured-logger";

describe("StructuredLogger log size management", () => {
  it("should compress logs when exceeding compression threshold", () => {
    const logger = new StructuredLogger();
    const compressionThreshold = 5000;

    for (let i = 0; i < compressionThreshold + 100; i++) {
      logger.info(
        "COMPRESSION",
        `operation-${i}`,
        {},
        "INTERNAL" as LogVisibility,
      );
    }

    logger.info("FINAL", "final-log", {}, "INTERNAL" as LogVisibility);

    const logs = logger.getLogs({});
    expect(logs.length).toBeLessThan(10000);
    const lastLog = logs[logs.length - 1]!;
    expect(lastLog.operation).toBe("final-log");
  });

  it("should truncate oldest logs when exceeding max log size", () => {
    const loggerWithSmallMax = new StructuredLogger(100, 50);

    for (let i = 0; i < 150; i++) {
      loggerWithSmallMax.info(
        "TRUNCATE",
        `operation-${i}`,
        {},
        "INTERNAL" as LogVisibility,
      );
    }

    const logs = loggerWithSmallMax.getLogs({});
    expect(logs.length).toBeLessThanOrEqual(100);

    const oldestLog = logs[0]!;
    const newestLog = logs[logs.length - 1]!;

    expect(oldestLog.operation).toBe("operation-50");
    expect(newestLog.operation).toBe("operation-149");
  });
});
