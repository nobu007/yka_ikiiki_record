import { globalLogger } from './structured-logger';

const DEFAULT_MEMORY_LIMIT_MB = 512;
const BYTES_PER_MB = 1024 * 1024;
const DEFAULT_CHECK_INTERVAL_MS = 10000;
const DEFAULT_THRESHOLD_RATIO = 0.9;
const PERCENTAGE_MULTIPLIER = 100;

export class MemoryMonitor {
  private readonly memoryLimit: number;
  private checkInterval: number;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    memoryLimit = DEFAULT_MEMORY_LIMIT_MB * BYTES_PER_MB,
    checkInterval = DEFAULT_CHECK_INTERVAL_MS
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
  }

  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private handleMemoryOverflow(usage: NodeJS.MemoryUsage): void {
    if (global.gc) {
      global.gc();
    }

    globalLogger.fatal('MEMORY', 'OVERFLOW', {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers,
    });
  }

  private logMemoryMetrics(usage: NodeJS.MemoryUsage): void {
    globalLogger.debug('MEMORY', 'METRICS', {
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
    return (usage.heapUsed / this.memoryLimit) * PERCENTAGE_MULTIPLIER;
  }

  isNearLimit(threshold = DEFAULT_THRESHOLD_RATIO): boolean {
    return this.getUsagePercentage() > threshold * PERCENTAGE_MULTIPLIER;
  }
}

export const globalMemoryMonitor = new MemoryMonitor();
