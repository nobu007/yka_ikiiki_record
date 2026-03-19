export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
export type LogVisibility = 'PUBLIC' | 'INTERNAL' | 'DEBUG' | 'TRACE';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  operation: string;
  duration?: number;
  metadata: Record<string, unknown>;
  correlationId: string;
  visibility: LogVisibility;
}

const generateCorrelationId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export class StructuredLogger {
  private logs: LogEntry[] = [];
  private maxLogSize: number;
  private compressionThreshold: number;

  constructor(maxLogSize = 10000, compressionThreshold = 5000) {
    this.maxLogSize = maxLogSize;
    this.compressionThreshold = compressionThreshold;
  }

  log(entry: Omit<LogEntry, 'timestamp' | 'correlationId'>): void {
    const logEntry: LogEntry = {
      timestamp: Date.now(),
      correlationId: generateCorrelationId(),
      ...entry,
    };

    this.logs.push(logEntry);
    this.manageLogSize();
  }

  debug(
    category: string,
    operation: string,
    metadata: Record<string, unknown> = {},
    visibility: LogVisibility = 'DEBUG'
  ): void {
    this.log({
      level: 'DEBUG',
      category,
      operation,
      metadata,
      visibility,
    });
  }

  info(
    category: string,
    operation: string,
    metadata: Record<string, unknown> = {},
    visibility: LogVisibility = 'INTERNAL'
  ): void {
    this.log({
      level: 'INFO',
      category,
      operation,
      metadata,
      visibility,
    });
  }

  warn(
    category: string,
    operation: string,
    metadata: Record<string, unknown> = {},
    visibility: LogVisibility = 'INTERNAL'
  ): void {
    this.log({
      level: 'WARN',
      category,
      operation,
      metadata,
      visibility,
    });
  }

  error(
    category: string,
    operation: string,
    metadata: Record<string, unknown> = {},
    visibility: LogVisibility = 'INTERNAL'
  ): void {
    this.log({
      level: 'ERROR',
      category,
      operation,
      metadata,
      visibility,
    });
  }

  fatal(
    category: string,
    operation: string,
    metadata: Record<string, unknown> = {},
    visibility: LogVisibility = 'INTERNAL'
  ): void {
    this.log({
      level: 'FATAL',
      category,
      operation,
      metadata,
      visibility,
    });
  }

  getLogs(filter: {
    level?: LogLevel;
    category?: string;
    operation?: string;
    timeRange?: [number, number];
    visibility?: LogVisibility;
  }): LogEntry[] {
    return this.logs.filter((log) => {
      if (filter.level && log.level !== filter.level) return false;
      if (filter.category && log.category !== filter.category) return false;
      if (filter.operation && log.operation !== filter.operation) return false;
      if (filter.timeRange) {
        const [start, end] = filter.timeRange;
        if (log.timestamp < start || log.timestamp > end) return false;
      }
      if (filter.visibility && log.visibility !== filter.visibility) return false;
      return true;
    });
  }

  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  clear(): void {
    this.logs = [];
  }

  private manageLogSize(): void {
    if (this.logs.length > this.compressionThreshold) {
      this.compressLogs();
    }
    if (this.logs.length > this.maxLogSize) {
      this.truncateOldestLogs();
    }
  }

  private compressLogs(): void {
    const recentLogs = this.logs.slice(-1000);
    const compressedOldLogs = this.logs
      .slice(0, -1000)
      .filter((log) => log.visibility !== 'DEBUG' && log.visibility !== 'TRACE');

    this.logs = [...compressedOldLogs, ...recentLogs];
  }

  private truncateOldestLogs(): void {
    this.logs = this.logs.slice(-this.maxLogSize);
  }

  getStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<string, number>;
  } {
    const byLevel: Record<LogLevel, number> = Object.create(null);
    const byCategory: Record<string, number> = Object.create(null);
    const stats = {
      total: this.logs.length,
      byLevel,
      byCategory,
    };

    for (const log of this.logs) {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      stats.byCategory[log.category] =
        (stats.byCategory[log.category] || 0) + 1;
    }

    return stats;
  }
}

export const globalLogger = new StructuredLogger();
