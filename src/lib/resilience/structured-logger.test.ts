import {
  StructuredLogger,
  globalLogger,
} from "./structured-logger";

describe("StructuredLogger", () => {
  let logger: StructuredLogger;

  beforeEach(() => {
    logger = new StructuredLogger();
  });

  describe("log", () => {
    it("should create log entry with all required fields", () => {
      logger.log({
        level: "INFO",
        category: "TEST",
        operation: "test-operation",
        metadata: { key: "value" },
        visibility: "INTERNAL",
      });

      const logs = logger.getRecentLogs(1);
      expect(logs).toHaveLength(1);
      const firstLog = logs[0]!;
      expect(firstLog).toMatchObject({
        level: "INFO",
        category: "TEST",
        operation: "test-operation",
        metadata: { key: "value" },
        visibility: "INTERNAL",
      });
      expect(firstLog.timestamp).toBeDefined();
      expect(firstLog.correlationId).toBeDefined();
    });

    it("should add duration to log entry", () => {
      logger.log({
        level: "INFO",
        category: "TEST",
        operation: "test-operation",
        duration: 1234,
        metadata: {},
        visibility: "INTERNAL",
      });

      const logs = logger.getRecentLogs(1);
      const firstLog = logs[0]!;
      expect(firstLog.duration).toBe(1234);
    });
  });

  describe("Convenience methods", () => {
    it("debug should create DEBUG log entry", () => {
      logger.debug("TEST", "debug-operation", { data: "test" });

      const logs = logger.getRecentLogs(1);
      const firstLog = logs[0]!;
      expect(firstLog.level).toBe("DEBUG");
      expect(firstLog.visibility).toBe("DEBUG");
    });

    it("info should create INFO log entry", () => {
      logger.info("TEST", "info-operation");

      const logs = logger.getRecentLogs(1);
      expect(logs[0]?.level).toBe("INFO");
    });

    it("warn should create WARN log entry", () => {
      logger.warn("TEST", "warn-operation");

      const logs = logger.getRecentLogs(1);
      expect(logs[0]?.level).toBe("WARN");
    });

    it("error should create ERROR log entry", () => {
      logger.error("TEST", "error-operation");

      const logs = logger.getRecentLogs(1);
      expect(logs[0]?.level).toBe("ERROR");
    });

    it("fatal should create FATAL log entry", () => {
      logger.fatal("TEST", "fatal-operation");

      const logs = logger.getRecentLogs(1);
      expect(logs[0]?.level).toBe("FATAL");
    });
  });

  describe("clear", () => {
    it("should remove all logs", () => {
      logger.info("TEST", "op1");
      logger.info("TEST", "op2");
      expect(logger.getRecentLogs(10)).toHaveLength(2);

      logger.clear();
      expect(logger.getRecentLogs(10)).toHaveLength(0);
    });
  });

  describe("globalLogger", () => {
    it("should provide a shared logger instance", () => {
      expect(globalLogger).toBeInstanceOf(StructuredLogger);
    });
  });
});
