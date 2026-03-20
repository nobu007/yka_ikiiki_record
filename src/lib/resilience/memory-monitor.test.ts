import { MemoryMonitor, globalMemoryMonitor } from "./memory-monitor";
import { globalLogger } from "./structured-logger";

jest.mock("./structured-logger");
jest.mock("@/lib/error-handler", () => ({
  ...jest.requireActual("@/lib/error-handler"),
  ERROR_CODES: {
    UNKNOWN: "UNKNOWN_ERROR",
    TIMEOUT: "TIMEOUT_ERROR",
  },
}));

describe("MemoryMonitor", () => {
  let monitor: MemoryMonitor;

  beforeEach(() => {
    monitor = new MemoryMonitor(1024 * 1024, 100);
    jest.clearAllMocks();
  });

  afterEach(() => {
    monitor.stopMonitoring();
  });

  describe("constructor", () => {
    it("should create monitor with default values", () => {
      const defaultMonitor = new MemoryMonitor();

      expect(defaultMonitor).toBeInstanceOf(MemoryMonitor);
    });

    it("should create monitor with custom values", () => {
      const customMonitor = new MemoryMonitor(512 * 1024 * 1024, 5000);

      expect(customMonitor).toBeInstanceOf(MemoryMonitor);
    });
  });

  describe("getCurrentUsage", () => {
    it("should return current memory usage", () => {
      const usage = monitor.getCurrentUsage();

      expect(usage).toHaveProperty("heapUsed");
      expect(usage).toHaveProperty("heapTotal");
      expect(usage).toHaveProperty("external");
      expect(usage).toHaveProperty("arrayBuffers");
      expect(usage).toHaveProperty("rss");
    });

    it("should return positive numbers", () => {
      const usage = monitor.getCurrentUsage();

      expect(usage.heapUsed).toBeGreaterThan(0);
      expect(usage.heapTotal).toBeGreaterThan(0);
    });
  });

  describe("getUsagePercentage", () => {
    it("should calculate usage percentage", () => {
      const percentage = monitor.getUsagePercentage();

      expect(percentage).toBeGreaterThanOrEqual(0);
      expect(typeof percentage).toBe("number");
    });
  });

  describe("isNearLimit", () => {
    it("should check if usage is near limit", () => {
      const result = monitor.isNearLimit(0.9);
      expect(typeof result).toBe("boolean");
    });

    it("should use default threshold of 0.9", () => {
      const result = monitor.isNearLimit();
      expect(typeof result).toBe("boolean");
    });
  });

  describe("startMonitoring and stopMonitoring", () => {
    it("should start monitoring", () => {
      monitor.startMonitoring();

      expect(() => monitor.startMonitoring()).not.toThrow();
    });

    it("should stop monitoring", () => {
      monitor.startMonitoring();
      monitor.stopMonitoring();

      expect(() => monitor.stopMonitoring()).not.toThrow();
    });

    it("should handle multiple start calls gracefully", () => {
      monitor.startMonitoring();
      monitor.startMonitoring();

      expect(() => monitor.stopMonitoring()).not.toThrow();
    });

    it("should log when monitoring starts", () => {
      const infoSpy = jest.spyOn(globalLogger, "info");

      monitor.startMonitoring();

      expect(infoSpy).toHaveBeenCalledWith(
        "MEMORY_MONITOR",
        "STARTED",
        expect.objectContaining({
          checkInterval: 100,
          memoryLimit: 1024 * 1024,
        }),
      );
    });

    it("should log when monitoring stops", () => {
      const infoSpy = jest.spyOn(globalLogger, "info");

      monitor.startMonitoring();
      monitor.stopMonitoring();

      expect(infoSpy).toHaveBeenCalledWith(
        "MEMORY_MONITOR",
        "STOPPED",
        expect.objectContaining({
          reason: "manual_stop",
        }),
      );
    });
  });

  describe("destroy", () => {
    it("should call stopMonitoring and log cleanup", () => {
      const infoSpy = jest.spyOn(globalLogger, "info");

      monitor.startMonitoring();
      monitor.destroy();

      expect(infoSpy).toHaveBeenCalledWith(
        "MEMORY_MONITOR",
        "STOPPED",
        expect.objectContaining({
          reason: "manual_stop",
        }),
      );

      expect(infoSpy).toHaveBeenCalledWith(
        "MEMORY_MONITOR",
        "DESTROYED",
        expect.objectContaining({
          reason: "cleanup",
        }),
      );
    });

    it("should handle destroy when not monitoring", () => {
      const infoSpy = jest.spyOn(globalLogger, "info");

      expect(() => monitor.destroy()).not.toThrow();

      expect(infoSpy).toHaveBeenCalledWith(
        "MEMORY_MONITOR",
        "DESTROYED",
        expect.objectContaining({
          reason: "cleanup",
        }),
      );
    });

    it("should handle multiple destroy calls gracefully", () => {
      monitor.startMonitoring();

      expect(() => {
        monitor.destroy();
        monitor.destroy();
      }).not.toThrow();
    });
  });

  describe("Monitoring behavior", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should log memory metrics periodically", () => {
      const logSpy = jest.spyOn(globalLogger, "debug");

      monitor.startMonitoring();

      jest.advanceTimersByTime(100);

      expect(logSpy).toHaveBeenCalledWith(
        "MEMORY",
        "METRICS",
        expect.objectContaining({
          heapUsed: expect.any(Number),
          heapTotal: expect.any(Number),
        }),
      );

      monitor.stopMonitoring();
    });

    it("should not log before interval elapses", () => {
      const logSpy = jest.spyOn(globalLogger, "debug");

      monitor.startMonitoring();

      jest.advanceTimersByTime(50);

      expect(logSpy).not.toHaveBeenCalled();

      monitor.stopMonitoring();
    });

    it("should continue logging after multiple intervals", () => {
      const logSpy = jest.spyOn(globalLogger, "debug");

      monitor.startMonitoring();

      jest.advanceTimersByTime(100);
      jest.advanceTimersByTime(100);

      expect(logSpy).toHaveBeenCalledTimes(2);

      monitor.stopMonitoring();
    });

    it("should stop logging after stopMonitoring", () => {
      const logSpy = jest.spyOn(globalLogger, "debug");

      monitor.startMonitoring();

      jest.advanceTimersByTime(100);

      monitor.stopMonitoring();

      jest.advanceTimersByTime(100);

      expect(logSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("Memory overflow handling", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should log fatal error on overflow", () => {
      const fatalSpy = jest.spyOn(globalLogger, "fatal");
      const smallMonitor = new MemoryMonitor(1, 100);

      smallMonitor.startMonitoring();

      jest.advanceTimersByTime(100);

      expect(fatalSpy).toHaveBeenCalledWith(
        "MEMORY",
        "OVERFLOW",
        expect.objectContaining({
          heapUsed: expect.any(Number),
          heapTotal: expect.any(Number),
        }),
      );

      smallMonitor.stopMonitoring();
    });

    it("should attempt garbage collection if available", () => {
      const gcMock = jest.fn();
      (global as { gc?: () => void }).gc = gcMock;

      const smallMonitor = new MemoryMonitor(1, 100);
      smallMonitor.startMonitoring();

      jest.advanceTimersByTime(100);

      expect(gcMock).toHaveBeenCalled();

      delete (global as { gc?: () => void }).gc;
      smallMonitor.stopMonitoring();
    });
  });

  describe("globalMemoryMonitor", () => {
    it("should provide a shared memory monitor instance", () => {
      expect(globalMemoryMonitor).toBeInstanceOf(MemoryMonitor);
    });
  });
});
