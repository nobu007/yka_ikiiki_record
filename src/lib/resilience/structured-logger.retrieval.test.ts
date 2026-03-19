import { StructuredLogger } from "./structured-logger";

describe("StructuredLogger.getRecentLogs", () => {
  let logger: StructuredLogger;

  beforeEach(() => {
    logger = new StructuredLogger();
  });

  it("should return specified number of recent logs", () => {
    for (let i = 0; i < 10; i++) {
      logger.info("TEST", `operation-${i}`);
    }

    const recentLogs = logger.getRecentLogs(5);
    expect(recentLogs).toHaveLength(5);
    expect(recentLogs[0]?.operation).toBe("operation-5");
    expect(recentLogs[4]?.operation).toBe("operation-9");
  });

  it("should return all logs if count exceeds total", () => {
    logger.info("TEST", "op1");
    logger.info("TEST", "op2");

    const logs = logger.getRecentLogs(10);
    expect(logs).toHaveLength(2);
  });

  it("should use default count of 100 when not specified", () => {
    for (let i = 0; i < 50; i++) {
      logger.info("TEST", `operation-${i}`);
    }

    const recentLogs = logger.getRecentLogs();
    expect(recentLogs).toHaveLength(50);
  });
});
