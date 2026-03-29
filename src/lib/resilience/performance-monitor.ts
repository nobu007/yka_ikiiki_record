import { globalLogger } from "./structured-logger";
import { PERFORMANCE_MONITOR_CONSTANTS } from "@/lib/constants";

/**
 * Performance metrics for a single measurement.
 */
export interface PerformanceMetric {
  /** Unique identifier for the measurement */
  name: string;
  /** Duration in milliseconds */
  duration: number;
  /** Timestamp when measurement was taken */
  timestamp: number;
  /** Additional metadata about the measurement */
  metadata?: Record<string, unknown>;
}

/**
 * Performance statistics for a specific metric.
 */
export interface PerformanceStats {
  /** Metric name */
  name: string;
  /** Number of measurements */
  count: number;
  /** Average duration in milliseconds */
  avgDuration: number;
  /** Minimum duration in milliseconds */
  minDuration: number;
  /** Maximum duration in milliseconds */
  maxDuration: number;
  /** Last measurement timestamp */
  lastTimestamp: number;
}

/**
 * React component render metrics.
 */
export interface RenderMetric {
  /** Component name */
  componentName: string;
  /** Render duration in milliseconds */
  renderTime: number;
  /** Timestamp when render was measured */
  timestamp: number;
  /** Props hash for identifying similar renders */
  propsHash?: string;
}

/**
 * React component render statistics.
 */
export interface RenderStats {
  /** Component name */
  componentName: string;
  /** Number of renders */
  renderCount: number;
  /** Average render time in milliseconds */
  avgRenderTime: number;
  /** Slowest render time in milliseconds */
  maxRenderTime: number;
  /** Fastest render time in milliseconds */
  minRenderTime: number;
  /** Number of slow renders (above threshold) */
  slowRenderCount: number;
  /** Last render timestamp */
  lastRenderTimestamp: number;
}

/**
 * Performance monitoring configuration.
 */
export interface PerformanceMonitorConfig {
  /** Maximum number of metrics to store in memory */
  maxMetrics: number;
  /** Threshold (in ms) for slow renders */
  slowRenderThreshold: number;
  /** Whether performance monitoring is enabled */
  enabled: boolean;
}

/**
 * PerformanceMonitor provides utilities for tracking and analyzing
 * application performance metrics.
 *
 * **Features:**
 * - Measure execution time of code blocks
 * - Track React component render times
 * - Calculate statistics (avg, min, max) for measurements
 * - Detect slow renders and log warnings
 * - Store metrics history for analysis
 *
 * **Usage:**
 * ```ts
 * // Measure a code block
 * const duration = performanceMonitor.measure('database-query', () => {
 *   return db.query('SELECT * FROM users');
 * });
 *
 * // Measure async operations
 * const duration = await performanceMonitor.measureAsync('api-call', async () => {
 *   return await fetch('/api/data');
 * });
 *
 * // Track React component renders
 * performanceMonitor.trackRender('MyComponent', 15.5);
 *
 * // Get statistics for a metric
 * const stats = performanceMonitor.getStats('database-query');
 * console.log(`Avg: ${stats.avgDuration}ms, Min: ${stats.minDuration}ms`);
 * ```
 */
export class PerformanceMonitor {
  private readonly config: PerformanceMonitorConfig;
  private readonly metrics: Map<string, PerformanceMetric[]>;
  private readonly renderMetrics: Map<string, RenderMetric[]>;

  constructor(config?: Partial<PerformanceMonitorConfig>) {
    this.config = {
      maxMetrics:
        config?.maxMetrics ??
        PERFORMANCE_MONITOR_CONSTANTS.DEFAULT_MAX_METRICS,
      slowRenderThreshold:
        config?.slowRenderThreshold ??
        PERFORMANCE_MONITOR_CONSTANTS.DEFAULT_SLOW_RENDER_THRESHOLD,
      enabled: config?.enabled ?? PERFORMANCE_MONITOR_CONSTANTS.DEFAULT_ENABLED,
    };

    this.metrics = new Map();
    this.renderMetrics = new Map();

    if (this.config.enabled) {
      globalLogger.info("PERFORMANCE_MONITOR", "INITIALIZED", {
        maxMetrics: this.config.maxMetrics,
        slowRenderThreshold: this.config.slowRenderThreshold,
      });
    }
  }

  /**
   * Measure the execution time of a synchronous function.
   *
   * @param name - Unique identifier for the measurement
   * @param fn - Function to measure
   * @param metadata - Optional metadata to attach to the measurement
   * @returns The return value of the measured function
   *
   * @example
   * ```ts
   * const result = performanceMonitor.measure('expensive-calculation', () => {
   *   return complexAlgorithm(data);
   * });
   * ```
   */
  measure<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, unknown>,
  ): T {
    if (!this.config.enabled) {
      return fn();
    }

    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    this.recordMetric(name, duration, metadata);

    return result;
  }

  /**
   * Measure the execution time of an asynchronous function.
   *
   * @param name - Unique identifier for the measurement
   * @param fn - Async function to measure
   * @param metadata - Optional metadata to attach to the measurement
   * @returns Promise that resolves with the return value of the measured function
   *
   * @example
   * ```ts
   * const data = await performanceMonitor.measureAsync('api-fetch', async () => {
   *   const response = await fetch('/api/data');
   *   return response.json();
   * });
   * ```
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>,
  ): Promise<T> {
    if (!this.config.enabled) {
      return fn();
    }

    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    this.recordMetric(name, duration, metadata);

    return result;
  }

  /**
   * Track React component render time.
   *
   * @param componentName - Name of the component being rendered
   * @param renderTime - Time taken to render in milliseconds
   * @param propsHash - Optional hash of component props for grouping similar renders
   *
   * @example
   * ```ts
   * // In a React component
   * useEffect(() => {
   *   const start = performance.now();
   *   return () => {
   *     const renderTime = performance.now() - start;
   *     performanceMonitor.trackRender('MyComponent', renderTime);
   *   };
   * });
   * ```
   */
  trackRender(
    componentName: string,
    renderTime: number,
    propsHash?: string,
  ): void {
    if (!this.config.enabled) {
      return;
    }

    const metric: RenderMetric = {
      componentName,
      renderTime,
      timestamp: Date.now(),
      ...(propsHash !== undefined && { propsHash }),
    };

    if (!this.renderMetrics.has(componentName)) {
      this.renderMetrics.set(componentName, []);
    }

    const metrics = this.renderMetrics.get(componentName)!;
    metrics.push(metric);

    // Trim old metrics if we exceed the limit
    if (metrics.length > this.config.maxMetrics) {
      metrics.shift();
    }

    // Log warning for slow renders
    if (renderTime > this.config.slowRenderThreshold) {
      globalLogger.warn("PERFORMANCE_MONITOR", "SLOW_RENDER", {
        componentName,
        renderTime,
        threshold: this.config.slowRenderThreshold,
        propsHash,
      });
    }

    // Log render metric at debug level
    globalLogger.debug("PERFORMANCE_MONITOR", "RENDER_TRACKED", {
      componentName,
      renderTime,
      propsHash,
    });
  }

  /**
   * Get statistics for a specific metric.
   *
   * @param name - Metric name to get statistics for
   * @returns Statistics object or undefined if metric not found
   *
   * @example
   * ```ts
   * const stats = performanceMonitor.getStats('database-query');
   * if (stats) {
   *   console.log(`Average: ${stats.avgDuration}ms`);
   *   console.log(`Count: ${stats.count}`);
   * }
   * ```
   */
  getStats(name: string): PerformanceStats | undefined {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) {
      return undefined;
    }

    const durations = metrics.map((m) => m.duration);
    const count = durations.length;
    const sum = durations.reduce((a, b) => a + b, 0);
    const avgDuration = sum / count;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const lastTimestamp = metrics[metrics.length - 1]!.timestamp;

    return {
      name,
      count,
      avgDuration: Number.parseFloat(avgDuration.toFixed(3)),
      minDuration: Number.parseFloat(minDuration.toFixed(3)),
      maxDuration: Number.parseFloat(maxDuration.toFixed(3)),
      lastTimestamp,
    };
  }

  /**
   * Get render statistics for a specific component.
   *
   * @param componentName - Component name to get statistics for
   * @returns Render statistics object or undefined if component not found
   *
   * @example
   * ```ts
   * const stats = performanceMonitor.getRenderStats('MyComponent');
   * if (stats) {
   *   console.log(`Average render time: ${stats.avgRenderTime}ms`);
   *   console.log(`Slow renders: ${stats.slowRenderCount}/${stats.renderCount}`);
   * }
   * ```
   */
  getRenderStats(componentName: string): RenderStats | undefined {
    const metrics = this.renderMetrics.get(componentName);
    if (!metrics || metrics.length === 0) {
      return undefined;
    }

    const renderTimes = metrics.map((m) => m.renderTime);
    const renderCount = renderTimes.length;
    const sum = renderTimes.reduce((a, b) => a + b, 0);
    const avgRenderTime = sum / renderCount;
    const maxRenderTime = Math.max(...renderTimes);
    const minRenderTime = Math.min(...renderTimes);
    const slowRenderCount = renderTimes.filter(
      (t) => t > this.config.slowRenderThreshold,
    ).length;
    const lastRenderTimestamp = metrics[metrics.length - 1]!.timestamp;

    return {
      componentName,
      renderCount,
      avgRenderTime: Number.parseFloat(avgRenderTime.toFixed(3)),
      maxRenderTime: Number.parseFloat(maxRenderTime.toFixed(3)),
      minRenderTime: Number.parseFloat(minRenderTime.toFixed(3)),
      slowRenderCount,
      lastRenderTimestamp,
    };
  }

  /**
   * Get all metric names that have been recorded.
   *
   * @returns Array of metric names
   */
  getAllMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Get all component names that have been tracked.
   *
   * @returns Array of component names
   */
  getAllComponentNames(): string[] {
    return Array.from(this.renderMetrics.keys());
  }

  /**
   * Clear all recorded metrics.
   *
   * @example
   * ```ts
   * performanceMonitor.clear();
   * console.log('All metrics cleared');
   * ```
   */
  clear(): void {
    this.metrics.clear();
    this.renderMetrics.clear();

    globalLogger.info("PERFORMANCE_MONITOR", "CLEARED", {
      reason: "manual_clear",
    });
  }

  /**
   * Get a summary of all performance statistics.
   *
   * @returns Object containing all metric and render statistics
   *
   * @example
   * ```ts
   * const summary = performanceMonitor.getSummary();
   * console.log('Performance Summary:', summary);
   * ```
   */
  getSummary(): {
    metrics: Record<string, PerformanceStats>;
    renders: Record<string, RenderStats>;
  } {
    const metrics: Record<string, PerformanceStats> = {};
    const renders: Record<string, RenderStats> = {};

    for (const name of this.getAllMetricNames()) {
      const stats = this.getStats(name);
      if (stats) {
        metrics[name] = stats;
      }
    }

    for (const name of this.getAllComponentNames()) {
      const stats = this.getRenderStats(name);
      if (stats) {
        renders[name] = stats;
      }
    }

    return { metrics, renders };
  }

  /**
   * Destroy the performance monitor and clean up resources.
   */
  destroy(): void {
    this.clear();

    globalLogger.info("PERFORMANCE_MONITOR", "DESTROYED", {
      reason: "cleanup",
    });
  }

  /**
   * Record a performance metric.
   */
  private recordMetric(
    name: string,
    duration: number,
    metadata?: Record<string, unknown>,
  ): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      ...(metadata !== undefined && { metadata }),
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Trim old metrics if we exceed the limit
    if (metrics.length > this.config.maxMetrics) {
      metrics.shift();
    }

    // Log metric at debug level
    globalLogger.debug("PERFORMANCE_MONITOR", "METRIC_RECORDED", {
      name,
      duration,
      metadata,
    });
  }
}

/**
 * Global performance monitor instance.
 */
export const globalPerformanceMonitor = new PerformanceMonitor();
