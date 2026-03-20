import { globalLogger } from "./structured-logger";
import { MEMORY_MONITOR_CONSTANTS } from "@/lib/constants";
import { globalCircuitBreaker } from "./circuit-breaker";

export class MemoryMonitor {
  private readonly memoryLimit: number;
  private checkInterval: number;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    memoryLimit: number = MEMORY_MONITOR_CONSTANTS.MEMORY_LIMIT_MB *
      MEMORY_MONITOR_CONSTANTS.BYTES_PER_MB,
    checkInterval: number = MEMORY_MONITOR_CONSTANTS.CHECK_INTERVAL_MS,
  ) {
    this.memoryLimit = memoryLimit;
    this.checkInterval = checkInterval;
  }

  startMonitoring(): void {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      const memoryUsage = process.memoryUsage();

      this.logMemoryMetrics(memoryUsage);

      if (memoryUsage.heapUsed > this.memoryLimit) {
        this.handleMemoryOverflow(memoryUsage);
      }
    }, this.checkInterval);

    globalLogger.info("MEMORY_MONITOR", "STARTED", {
      checkInterval: this.checkInterval,
      memoryLimit: this.memoryLimit,
    });
  }

  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;

      globalLogger.info("MEMORY_MONITOR", "STOPPED", {
        reason: "manual_stop",
      });
    }
  }

  destroy(): void {
    this.stopMonitoring();

    globalLogger.info("MEMORY_MONITOR", "DESTROYED", {
      reason: "cleanup",
    });
  }

  private handleMemoryOverflow(usage: NodeJS.MemoryUsage): void {
    const gcTriggered = typeof global.gc === "function";

    if (gcTriggered) {
      (global.gc as () => void)();
    }

    globalLogger.fatal("MEMORY", "OVERFLOW", {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers,
      gcTriggered,
      memoryLimit: this.memoryLimit,
      usagePercentage: this.getUsagePercentage(),
    });

    globalCircuitBreaker.reset();
  }

  private logMemoryMetrics(usage: NodeJS.MemoryUsage): void {
    globalLogger.debug("MEMORY", "METRICS", {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers,
      rss: usage.rss,
    });
  }

  getCurrentUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  getUsagePercentage(): number {
    const usage = process.memoryUsage();
    return (
      (usage.heapUsed / this.memoryLimit) *
      MEMORY_MONITOR_CONSTANTS.PERCENTAGE_MULTIPLIER
    );
  }

  isNearLimit(
    threshold: number = MEMORY_MONITOR_CONSTANTS.THRESHOLD_RATIO,
  ): boolean {
    return (
      this.getUsagePercentage() >
      threshold * MEMORY_MONITOR_CONSTANTS.PERCENTAGE_MULTIPLIER
    );
  }
}

export const globalMemoryMonitor = new MemoryMonitor();
