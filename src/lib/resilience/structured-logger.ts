import {
  LOGGER_CONSTANTS,
  LOG_LEVELS,
  LOG_VISIBILITY,
} from "@/lib/constants";

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
export type LogVisibility =
  (typeof LOG_VISIBILITY)[keyof typeof LOG_VISIBILITY];

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

  constructor(
    maxLogSize: number = LOGGER_CONSTANTS.MAX_LOG_SIZE,
    compressionThreshold: number = LOGGER_CONSTANTS.COMPRESSION_THRESHOLD,
  ) {
    this.maxLogSize = maxLogSize;
    this.compressionThreshold = compressionThreshold;
  }

  log(entry: Omit<LogEntry, "timestamp" | "correlationId">): void {
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
    visibility: LogVisibility = LOG_VISIBILITY.DEBUG,
  ): void {
    this.log({
      level: LOG_LEVELS.DEBUG,
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
    visibility: LogVisibility = LOG_VISIBILITY.INTERNAL,
  ): void {
    this.log({
      level: LOG_LEVELS.INFO,
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
    visibility: LogVisibility = LOG_VISIBILITY.INTERNAL,
  ): void {
    this.log({
      level: LOG_LEVELS.WARN,
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
    visibility: LogVisibility = LOG_VISIBILITY.INTERNAL,
  ): void {
    this.log({
      level: LOG_LEVELS.ERROR,
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
    visibility: LogVisibility = LOG_VISIBILITY.INTERNAL,
  ): void {
    this.log({
      level: LOG_LEVELS.FATAL,
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
    return this.logs.filter((log) => this.matchesFilter(log, filter));
  }

  private matchesFilter(
    log: LogEntry,
    filter: {
      level?: LogLevel;
      category?: string;
      operation?: string;
      timeRange?: [number, number];
      visibility?: LogVisibility;
    },
  ): boolean {
    if (filter.level && log.level !== filter.level) return false;
    if (filter.category && log.category !== filter.category) return false;
    if (filter.operation && log.operation !== filter.operation) return false;
    if (!this.matchesTimeRange(log.timestamp, filter.timeRange)) return false;
    if (filter.visibility && log.visibility !== filter.visibility) return false;
    return true;
  }

  private matchesTimeRange(
    timestamp: number,
    timeRange?: [number, number],
  ): boolean {
    if (!timeRange) return true;
    const [start, end] = timeRange;
    return timestamp >= start && timestamp <= end;
  }

  getRecentLogs(count: number = LOGGER_CONSTANTS.RECENT_LOGS_COUNT): LogEntry[] {
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
    const recentLogs = this.logs.slice(-LOGGER_CONSTANTS.COMPRESS_RECENT_LOGS_COUNT);
    const compressedOldLogs = this.logs
      .slice(0, -LOGGER_CONSTANTS.COMPRESS_RECENT_LOGS_COUNT)
      .filter(
        (log) => log.visibility !== LOG_VISIBILITY.DEBUG && log.visibility !== LOG_VISIBILITY.TRACE,
      );

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
