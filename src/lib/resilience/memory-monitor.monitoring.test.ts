import { MemoryMonitor } from "./memory-monitor";
import { globalLogger } from "./structured-logger";

jest.mock("./structured-logger");

describe("MemoryMonitor - Monitoring Behavior", () => {
  let monitor: MemoryMonitor;

  beforeEach(() => {
    monitor = new MemoryMonitor(1024 * 1024, 100);
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    monitor.stopMonitoring();
    jest.useRealTimers();
  });

  describe("Periodic logging", () => {
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
});
