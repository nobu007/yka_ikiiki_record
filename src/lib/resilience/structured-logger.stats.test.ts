import { StructuredLogger } from "./structured-logger";

describe("StructuredLogger.getStats", () => {
  let logger: StructuredLogger;

  beforeEach(() => {
    logger = new StructuredLogger();
  });

  it("should return statistics about logs", () => {
    logger.info("CAT1", "op1");
    logger.info("CAT1", "op2");
    logger.debug("CAT1", "op3");
    logger.error("CAT2", "op4");
    logger.warn("CAT2", "op5");

    const stats = logger.getStats();

    expect(stats.total).toBe(5);
    expect(stats.byLevel.INFO).toBe(2);
    expect(stats.byLevel.DEBUG).toBe(1);
    expect(stats.byLevel.ERROR).toBe(1);
    expect(stats.byLevel.WARN).toBe(1);
    expect(stats.byCategory.CAT1).toBe(3);
    expect(stats.byCategory.CAT2).toBe(2);
  });

  it("should return zero stats for empty logger", () => {
    const stats = logger.getStats();

    expect(stats.total).toBe(0);
    expect(stats.byLevel).toEqual({});
    expect(stats.byCategory).toEqual({});
  });
});
