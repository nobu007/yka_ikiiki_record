import { globalLogger } from './structured-logger';

export class MemoryMonitor {
  private readonly memoryLimit: number;
  private checkInterval: number;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(memoryLimit = 512 * 1024 * 1024, checkInterval = 10000) {
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
    return (usage.heapUsed / this.memoryLimit) * 100;
  }

  isNearLimit(threshold = 0.9): boolean {
    return this.getUsagePercentage() > threshold * 100;
  }
}

export const globalMemoryMonitor = new MemoryMonitor();
