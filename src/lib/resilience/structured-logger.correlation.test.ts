import { StructuredLogger } from "./structured-logger";

describe("StructuredLogger correlation ID generation", () => {
  let logger: StructuredLogger;

  beforeEach(() => {
    logger = new StructuredLogger();
  });

  it("should generate unique correlation IDs", () => {
    logger.info("TEST", "op1");
    logger.info("TEST", "op2");

    const logs = logger.getRecentLogs(2);
    const firstLog = logs[0]!;
    const secondLog = logs[1]!;
    expect(firstLog.correlationId).not.toBe(secondLog.correlationId);
  });

  it("should generate correlation IDs with timestamp", () => {
    logger.info("TEST", "op1");

    const logs = logger.getRecentLogs(1);
    const firstLog = logs[0]!;
    expect(firstLog.correlationId).toMatch(/^\d+-[a-z0-9]+$/);
  });
});
