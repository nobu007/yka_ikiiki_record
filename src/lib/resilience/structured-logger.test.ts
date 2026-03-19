import {
  StructuredLogger,
  globalLogger,
  type LogVisibility,
} from './structured-logger';

describe('StructuredLogger', () => {
  let logger: StructuredLogger;

  beforeEach(() => {
    logger = new StructuredLogger();
  });

  describe('log', () => {
    it('should create log entry with all required fields', () => {
      logger.log({
        level: 'INFO',
        category: 'TEST',
        operation: 'test-operation',
        metadata: { key: 'value' },
        visibility: 'INTERNAL',
      });

      const logs = logger.getRecentLogs(1);
      expect(logs).toHaveLength(1);
      const firstLog = logs[0]!;
      expect(firstLog).toMatchObject({
        level: 'INFO',
        category: 'TEST',
        operation: 'test-operation',
        metadata: { key: 'value' },
        visibility: 'INTERNAL',
      });
      expect(firstLog.timestamp).toBeDefined();
      expect(firstLog.correlationId).toBeDefined();
    });

    it('should add duration to log entry', () => {
      logger.log({
        level: 'INFO',
        category: 'TEST',
        operation: 'test-operation',
        duration: 1234,
        metadata: {},
        visibility: 'INTERNAL',
      });

      const logs = logger.getRecentLogs(1);
      const firstLog = logs[0]!;
      expect(firstLog.duration).toBe(1234);
    });
  });

  describe('Convenience methods', () => {
    it('debug should create DEBUG log entry', () => {
      logger.debug('TEST', 'debug-operation', { data: 'test' });

      const logs = logger.getRecentLogs(1);
      const firstLog = logs[0]!;
      expect(firstLog.level).toBe('DEBUG');
      expect(firstLog.visibility).toBe('DEBUG');
    });

    it('info should create INFO log entry', () => {
      logger.info('TEST', 'info-operation');

      const logs = logger.getRecentLogs(1);
      expect(logs[0]?.level).toBe('INFO');
    });

    it('warn should create WARN log entry', () => {
      logger.warn('TEST', 'warn-operation');

      const logs = logger.getRecentLogs(1);
      expect(logs[0]?.level).toBe('WARN');
    });

    it('error should create ERROR log entry', () => {
      logger.error('TEST', 'error-operation');

      const logs = logger.getRecentLogs(1);
      expect(logs[0]?.level).toBe('ERROR');
    });

    it('fatal should create FATAL log entry', () => {
      logger.fatal('TEST', 'fatal-operation');

      const logs = logger.getRecentLogs(1);
      expect(logs[0]?.level).toBe('FATAL');
    });
  });

  describe('getLogs', () => {
    beforeEach(() => {
      logger.info('CAT1', 'op1', {}, 'INTERNAL');
      logger.debug('CAT1', 'op2', {}, 'DEBUG');
      logger.error('CAT2', 'op3', {}, 'INTERNAL');
      logger.warn('CAT1', 'op4', {}, 'TRACE');
    });

    it('should filter by level', () => {
      const errorLogs = logger.getLogs({ level: 'ERROR' });
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0]?.level).toBe('ERROR');
    });

    it('should filter by category', () => {
      const cat1Logs = logger.getLogs({ category: 'CAT1' });
      expect(cat1Logs).toHaveLength(3);
      expect(cat1Logs.every((log) => log.category === 'CAT1')).toBe(true);
    });

    it('should filter by operation', () => {
      const op1Logs = logger.getLogs({ operation: 'op1' });
      expect(op1Logs).toHaveLength(1);
      expect(op1Logs[0]?.operation).toBe('op1');
    });

    it('should filter by visibility', () => {
      const internalLogs = logger.getLogs({ visibility: 'INTERNAL' });
      expect(internalLogs).toHaveLength(2);
      expect(internalLogs.every((log) => log.visibility === 'INTERNAL')).toBe(true);
    });

    it('should filter by time range', () => {
      const now = Date.now();
      logger.info('TIMERANGE', 'test', { timestamp: now });

      const logs = logger.getLogs({
        timeRange: [now - 1000, now + 1000],
      });
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should exclude logs outside time range', () => {
      const now = Date.now();
      logger.info('TIMERANGE', 'inside', { timestamp: now });

      const logs = logger.getLogs({
        timeRange: [now - 10000, now - 5000],
      });
      expect(logs).toHaveLength(0);
    });

    it('should combine multiple filters', () => {
      const logs = logger.getLogs({
        level: 'INFO',
        category: 'CAT1',
      });
      expect(logs).toHaveLength(1);
      const firstLog = logs[0]!;
      expect(firstLog.level).toBe('INFO');
      expect(firstLog.category).toBe('CAT1');
    });

    it('should return all logs when no filters provided', () => {
      const logs = logger.getLogs({});
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('getRecentLogs', () => {
    it('should return specified number of recent logs', () => {
      for (let i = 0; i < 10; i++) {
        logger.info('TEST', `operation-${i}`);
      }

      const recentLogs = logger.getRecentLogs(5);
      expect(recentLogs).toHaveLength(5);
      expect(recentLogs[0]?.operation).toBe('operation-5');
      expect(recentLogs[4]?.operation).toBe('operation-9');
    });

    it('should return all logs if count exceeds total', () => {
      logger.info('TEST', 'op1');
      logger.info('TEST', 'op2');

      const logs = logger.getRecentLogs(10);
      expect(logs).toHaveLength(2);
    });

    it('should use default count of 100 when not specified', () => {
      for (let i = 0; i < 50; i++) {
        logger.info('TEST', `operation-${i}`);
      }

      const recentLogs = logger.getRecentLogs();
      expect(recentLogs).toHaveLength(50);
    });
  });

  describe('clear', () => {
    it('should remove all logs', () => {
      logger.info('TEST', 'op1');
      logger.info('TEST', 'op2');
      expect(logger.getRecentLogs(10)).toHaveLength(2);

      logger.clear();
      expect(logger.getRecentLogs(10)).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    it('should return statistics about logs', () => {
      logger.info('CAT1', 'op1');
      logger.info('CAT1', 'op2');
      logger.debug('CAT1', 'op3');
      logger.error('CAT2', 'op4');
      logger.warn('CAT2', 'op5');

      const stats = logger.getStats();

      expect(stats.total).toBe(5);
      expect(stats.byLevel.INFO).toBe(2);
      expect(stats.byLevel.DEBUG).toBe(1);
      expect(stats.byLevel.ERROR).toBe(1);
      expect(stats.byLevel.WARN).toBe(1);
      expect(stats.byCategory.CAT1).toBe(3);
      expect(stats.byCategory.CAT2).toBe(2);
    });

    it('should return zero stats for empty logger', () => {
      const stats = logger.getStats();

      expect(stats.total).toBe(0);
      expect(stats.byLevel).toEqual({});
      expect(stats.byCategory).toEqual({});
    });
  });

  describe('Log size management', () => {
    it('should compress logs when exceeding compression threshold', () => {
      const maxLogSize = 10000;
      const compressionThreshold = 5000;

      for (let i = 0; i < compressionThreshold + 100; i++) {
        logger.info('COMPRESSION', `operation-${i}`, {}, 'INTERNAL' as LogVisibility);
      }

      logger.info('FINAL', 'final-log', {}, 'INTERNAL' as LogVisibility);

      const logs = logger.getLogs({});
      expect(logs.length).toBeLessThan(maxLogSize);
      const lastLog = logs[logs.length - 1]!;
      expect(lastLog.operation).toBe('final-log');
    });

    it('should truncate oldest logs when exceeding max log size', () => {
      const loggerWithSmallMax = new StructuredLogger(100, 50);

      for (let i = 0; i < 150; i++) {
        loggerWithSmallMax.info('TRUNCATE', `operation-${i}`, {}, 'INTERNAL' as LogVisibility);
      }

      const logs = loggerWithSmallMax.getLogs({});
      expect(logs.length).toBeLessThanOrEqual(100);

      const oldestLog = logs[0]!;
      const newestLog = logs[logs.length - 1]!;

      expect(oldestLog.operation).toBe('operation-50');
      expect(newestLog.operation).toBe('operation-149');
    });
  });

  describe('globalLogger', () => {
    it('should provide a shared logger instance', () => {
      expect(globalLogger).toBeInstanceOf(StructuredLogger);
    });
  });

  describe('Correlation ID generation', () => {
    it('should generate unique correlation IDs', () => {
      logger.info('TEST', 'op1');
      logger.info('TEST', 'op2');

      const logs = logger.getRecentLogs(2);
      const firstLog = logs[0]!;
      const secondLog = logs[1]!;
      expect(firstLog.correlationId).not.toBe(secondLog.correlationId);
    });

    it('should generate correlation IDs with timestamp', () => {
      logger.info('TEST', 'op1');

      const logs = logger.getRecentLogs(1);
      const firstLog = logs[0]!;
      expect(firstLog.correlationId).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });
});
