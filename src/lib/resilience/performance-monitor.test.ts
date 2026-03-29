import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";
import { PerformanceMonitor } from "./performance-monitor";
import { PERFORMANCE_MONITOR_CONSTANTS } from "@/lib/constants";
import { globalLogger } from "./structured-logger";

// Mock the global logger
jest.mock("./structured-logger");

const mockedGlobalLogger = globalLogger as jest.Mocked<typeof globalLogger>;

describe("PerformanceMonitor", () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor({
      maxMetrics: 10,
      slowRenderThreshold: 10,
      enabled: true,
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    monitor.destroy();
  });

  describe("constructor", () => {
    it("should initialize with default configuration", () => {
      const defaultMonitor = new PerformanceMonitor();
      expect(defaultMonitor).toBeDefined();
      defaultMonitor.destroy();
    });

    it("should initialize with custom configuration", () => {
      const customMonitor = new PerformanceMonitor({
        maxMetrics: 100,
        slowRenderThreshold: 20,
        enabled: false,
      });
      expect(customMonitor).toBeDefined();
      customMonitor.destroy();
    });

    it("should log initialization when enabled", () => {
      new PerformanceMonitor({ enabled: true });
      expect(mockedGlobalLogger.info).toHaveBeenCalledWith(
        "PERFORMANCE_MONITOR",
        "INITIALIZED",
        expect.objectContaining({
          maxMetrics: PERFORMANCE_MONITOR_CONSTANTS.DEFAULT_MAX_METRICS,
        }),
      );
    });

    it("should not log initialization when disabled", () => {
      new PerformanceMonitor({ enabled: false });
      expect(globalLogger.info).not.toHaveBeenCalled();
    });
  });

  describe("measure", () => {
    it("should measure synchronous function execution time", () => {
      const result = monitor.measure("test-operation", () => {
        return 42;
      });

      expect(result).toBe(42);
      const stats = monitor.getStats("test-operation");
      expect(stats).toBeDefined();
      expect(stats?.count).toBe(1);
      expect(stats?.avgDuration).toBeGreaterThan(0);
    });

    it("should record multiple measurements", () => {
      monitor.measure("multi-measure", () => 1);
      monitor.measure("multi-measure", () => 2);
      monitor.measure("multi-measure", () => 3);

      const stats = monitor.getStats("multi-measure");
      expect(stats?.count).toBe(3);
    });

    it("should calculate correct statistics", () => {
      monitor.measure("stats-test", () => {
        // Simulate some work
        return Array.from({ length: 1000 }, () => Math.random());
      });

      monitor.measure("stats-test", () => {
        return Array.from({ length: 2000 }, () => Math.random());
      });

      const stats = monitor.getStats("stats-test");
      expect(stats?.count).toBe(2);
      expect(stats?.avgDuration).toBeGreaterThan(0);
      expect(stats?.minDuration).toBeGreaterThan(0);
      expect(stats?.maxDuration).toBeGreaterThan(0);
      expect(stats?.maxDuration).toBeGreaterThanOrEqual(stats?.minDuration);
    });

    it("should attach metadata to measurements", () => {
      monitor.measure(
        "metadata-test",
        () => "result",
        { key: "value", count: 42 },
      );

      const stats = monitor.getStats("metadata-test");
      expect(stats?.count).toBe(1);
    });

    it("should return undefined for non-existent metrics", () => {
      const stats = monitor.getStats("non-existent");
      expect(stats).toBeUndefined();
    });

    it("should not measure when disabled", () => {
      const disabledMonitor = new PerformanceMonitor({ enabled: false });

      const result = disabledMonitor.measure("disabled-test", () => 42);
      expect(result).toBe(42);

      const stats = disabledMonitor.getStats("disabled-test");
      expect(stats).toBeUndefined();

      disabledMonitor.destroy();
    });
  });

  describe("measureAsync", () => {
    it("should measure async function execution time", async () => {
      const result = await monitor.measureAsync("async-operation", async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 42;
      });

      expect(result).toBe(42);
      const stats = monitor.getStats("async-operation");
      expect(stats).toBeDefined();
      expect(stats?.count).toBe(1);
      expect(stats?.avgDuration).toBeGreaterThanOrEqual(10);
    });

    it("should handle multiple async measurements", async () => {
      await monitor.measureAsync("async-multi", async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return 1;
      });

      await monitor.measureAsync("async-multi", async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 2;
      });

      const stats = monitor.getStats("async-multi");
      expect(stats?.count).toBe(2);
      expect(stats?.avgDuration).toBeGreaterThan(0);
    });

    it("should attach metadata to async measurements", async () => {
      await monitor.measureAsync(
        "async-metadata",
        async () => "result",
        { async: true },
      );

      const stats = monitor.getStats("async-metadata");
      expect(stats?.count).toBe(1);
    });

    it("should not measure async when disabled", async () => {
      const disabledMonitor = new PerformanceMonitor({ enabled: false });

      const result = await disabledMonitor.measureAsync(
        "disabled-async",
        async () => 42,
      );
      expect(result).toBe(42);

      const stats = disabledMonitor.getStats("disabled-async");
      expect(stats).toBeUndefined();

      disabledMonitor.destroy();
    });
  });

  describe("trackRender", () => {
    it("should track component render times", () => {
      monitor.trackRender("TestComponent", 5.5);

      const stats = monitor.getRenderStats("TestComponent");
      expect(stats).toBeDefined();
      expect(stats?.renderCount).toBe(1);
      expect(stats?.avgRenderTime).toBe(5.5);
    });

    it("should track multiple renders of the same component", () => {
      monitor.trackRender("MultiRenderComponent", 5);
      monitor.trackRender("MultiRenderComponent", 10);
      monitor.trackRender("MultiRenderComponent", 15);

      const stats = monitor.getRenderStats("MultiRenderComponent");
      expect(stats?.renderCount).toBe(3);
      expect(stats?.avgRenderTime).toBe(10);
      expect(stats?.minRenderTime).toBe(5);
      expect(stats?.maxRenderTime).toBe(15);
    });

    it("should warn for slow renders", () => {
      monitor.trackRender("SlowComponent", 20);

      expect(mockedGlobalLogger.warn).toHaveBeenCalledWith(
        "PERFORMANCE_MONITOR",
        "SLOW_RENDER",
        expect.objectContaining({
          componentName: "SlowComponent",
          renderTime: 20,
          threshold: 10,
        }),
      );
    });

    it("should count slow renders", () => {
      monitor.trackRender("ComponentWithSlowRenders", 5);
      monitor.trackRender("ComponentWithSlowRenders", 15);
      monitor.trackRender("ComponentWithSlowRenders", 20);

      const stats = monitor.getRenderStats("ComponentWithSlowRenders");
      expect(stats?.slowRenderCount).toBe(2);
    });

    it("should track props hash", () => {
      monitor.trackRender("PropsComponent", 10, "hash-123");

      const stats = monitor.getRenderStats("PropsComponent");
      expect(stats?.renderCount).toBe(1);
    });

    it("should not track when disabled", () => {
      const disabledMonitor = new PerformanceMonitor({ enabled: false });

      disabledMonitor.trackRender("DisabledComponent", 10);

      const stats = disabledMonitor.getRenderStats("DisabledComponent");
      expect(stats).toBeUndefined();

      disabledMonitor.destroy();
    });

    it("should return undefined for non-existent components", () => {
      const stats = monitor.getRenderStats("NonExistentComponent");
      expect(stats).toBeUndefined();
    });
  });

  describe("getAllMetricNames", () => {
    it("should return empty array when no metrics recorded", () => {
      const names = monitor.getAllMetricNames();
      expect(names).toEqual([]);
    });

    it("should return all metric names", () => {
      monitor.measure("metric1", () => 1);
      monitor.measure("metric2", () => 2);
      monitor.measure("metric3", () => 3);

      const names = monitor.getAllMetricNames();
      expect(names).toContain("metric1");
      expect(names).toContain("metric2");
      expect(names).toContain("metric3");
      expect(names).toHaveLength(3);
    });
  });

  describe("getAllComponentNames", () => {
    it("should return empty array when no components tracked", () => {
      const names = monitor.getAllComponentNames();
      expect(names).toEqual([]);
    });

    it("should return all component names", () => {
      monitor.trackRender("Component1", 5);
      monitor.trackRender("Component2", 10);
      monitor.trackRender("Component3", 15);

      const names = monitor.getAllComponentNames();
      expect(names).toContain("Component1");
      expect(names).toContain("Component2");
      expect(names).toContain("Component3");
      expect(names).toHaveLength(3);
    });
  });

  describe("clear", () => {
    it("should clear all metrics and render metrics", () => {
      monitor.measure("test-metric", () => 1);
      monitor.trackRender("TestComponent", 5);

      expect(monitor.getAllMetricNames()).toHaveLength(1);
      expect(monitor.getAllComponentNames()).toHaveLength(1);

      monitor.clear();

      expect(monitor.getAllMetricNames()).toHaveLength(0);
      expect(monitor.getAllComponentNames()).toHaveLength(0);
    });

    it("should log clear operation", () => {
      monitor.clear();
      expect(mockedGlobalLogger.info).toHaveBeenCalledWith(
        "PERFORMANCE_MONITOR",
        "CLEARED",
        expect.objectContaining({
          reason: "manual_clear",
        }),
      );
    });
  });

  describe("getSummary", () => {
    it("should return empty summary when no data", () => {
      const summary = monitor.getSummary();
      expect(summary.metrics).toEqual({});
      expect(summary.renders).toEqual({});
    });

    it("should return summary of all metrics and renders", () => {
      monitor.measure("metric1", () => 1);
      monitor.measure("metric2", () => 2);
      monitor.trackRender("Component1", 5);
      monitor.trackRender("Component2", 10);

      const summary = monitor.getSummary();

      expect(Object.keys(summary.metrics)).toHaveLength(2);
      expect(Object.keys(summary.renders)).toHaveLength(2);
      expect(summary.metrics.metric1).toBeDefined();
      expect(summary.metrics.metric2).toBeDefined();
      expect(summary.renders.Component1).toBeDefined();
      expect(summary.renders.Component2).toBeDefined();
    });
  });

  describe("destroy", () => {
    it("should clear all data and log destruction", () => {
      monitor.measure("test", () => 1);
      monitor.trackRender("TestComponent", 5);

      monitor.destroy();

      expect(monitor.getAllMetricNames()).toHaveLength(0);
      expect(monitor.getAllComponentNames()).toHaveLength(0);

      expect(mockedGlobalLogger.info).toHaveBeenCalledWith(
        "PERFORMANCE_MONITOR",
        "DESTROYED",
        expect.objectContaining({
          reason: "cleanup",
        }),
      );
    });
  });

  describe("maxMetrics limit", () => {
    it("should trim old metrics when limit is exceeded", () => {
      const limitedMonitor = new PerformanceMonitor({
        maxMetrics: 3,
        enabled: true,
      });

      // Add 5 measurements
      for (let i = 1; i <= 5; i++) {
        limitedMonitor.measure("limited-metric", () => i);
      }

      const stats = limitedMonitor.getStats("limited-metric");
      // Should only keep the 3 most recent
      expect(stats?.count).toBe(3);

      limitedMonitor.destroy();
    });

    it("should trim old render metrics when limit is exceeded", () => {
      const limitedMonitor = new PerformanceMonitor({
        maxMetrics: 3,
        enabled: true,
      });

      // Add 5 render measurements
      for (let i = 1; i <= 5; i++) {
        limitedMonitor.trackRender("LimitedComponent", i);
      }

      const stats = limitedMonitor.getRenderStats("LimitedComponent");
      // Should only keep the 3 most recent
      expect(stats?.renderCount).toBe(3);

      limitedMonitor.destroy();
    });
  });

  describe("precision", () => {
    it("should store duration with millisecond precision", () => {
      monitor.measure("precision-test", () => {
        const start = performance.now();
        while (performance.now() - start < 5) {
          // Busy wait for ~5ms
        }
      });

      const stats = monitor.getStats("precision-test");
      expect(stats?.avgDuration).toBeGreaterThan(0);

      // Check that precision is to 3 decimal places
      const decimalPlaces = stats?.avgDuration.toString().split(".")[1]
        ?.length;
      expect(decimalPlaces).toBeLessThanOrEqual(3);
    });
  });
});
