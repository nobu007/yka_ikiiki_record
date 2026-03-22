# SPEC: lib.resilience.structured-logger.StructuredLogger

**Version**: 1.0.0
**Last Updated**: 2026-03-22
**Source**: src/lib/resilience/structured-logger.ts:22
**Type**: class

---

## 1. 概要

classの実装

## 2. 入力仕様

| パラメータ | 型 | 必須 | 制約 | デフォルト値 | 説明 |
|-----------|------|------|------|--------------|------|
| constructor | 
    maxLogSize: number = LOGGER_CONSTANTS.MAX_LOG_SIZE,
    compressionThreshold: number = LOGGER_CONSTANTS.COMPRESSION_THRESHOLD,
   | No | - | - | パラメータ |
| log | entry: Omit<LogEntry, "timestamp" | "correlationId"> | No | - | - | パラメータ |
| now |  | No | - | - | パラメータ |
| generateCorrelationId |  | No | - | - | パラメータ |
| push | logEntry | No | - | - | パラメータ |
| manageLogSize |  | No | - | - | パラメータ |
| logWithLevel | 
    level: LogLevel,
    category: string,
    operation: string,
    metadata: Record<string, unknown> = {},
    visibility: LogVisibility = LOG_VISIBILITY.INTERNAL,
   | No | - | - | パラメータ |
| log | {
      level,
      category,
      operation,
      metadata,
      visibility,
    } | No | - | - | パラメータ |
| debug | 
    category: string,
    operation: string,
    metadata: Record<string, unknown> = {},
    visibility: LogVisibility = LOG_VISIBILITY.DEBUG,
   | No | - | - | パラメータ |
| logWithLevel | LOG_LEVELS.DEBUG, category, operation, metadata, visibility | No | - | - | パラメータ |
| info | 
    category: string,
    operation: string,
    metadata: Record<string, unknown> = {},
    visibility: LogVisibility = LOG_VISIBILITY.INTERNAL,
   | No | - | - | パラメータ |
| logWithLevel | LOG_LEVELS.INFO, category, operation, metadata, visibility | No | - | - | パラメータ |
| warn | 
    category: string,
    operation: string,
    metadata: Record<string, unknown> = {},
    visibility: LogVisibility = LOG_VISIBILITY.INTERNAL,
   | No | - | - | パラメータ |
| logWithLevel | LOG_LEVELS.WARN, category, operation, metadata, visibility | No | - | - | パラメータ |
| error | 
    category: string,
    operation: string,
    metadata: Record<string, unknown> = {},
    visibility: LogVisibility = LOG_VISIBILITY.INTERNAL,
   | No | - | - | パラメータ |
| logWithLevel | LOG_LEVELS.ERROR, category, operation, metadata, visibility | No | - | - | パラメータ |
| fatal | 
    category: string,
    operation: string,
    metadata: Record<string, unknown> = {},
    visibility: LogVisibility = LOG_VISIBILITY.INTERNAL,
   | No | - | - | パラメータ |
| logWithLevel | LOG_LEVELS.FATAL, category, operation, metadata, visibility | No | - | - | パラメータ |
| getLogs | filter: {
    level?: LogLevel;
    category?: string;
    operation?: string;
    timeRange?: [number, number];
    visibility?: LogVisibility;
  } | No | - | - | パラメータ |
| filter | (log | No | - | - | パラメータ |
| matchesFilter | log, filter | No | - | - | パラメータ |
| matchesFilter | 
    log: LogEntry,
    filter: {
      level?: LogLevel;
      category?: string;
      operation?: string;
      timeRange?: [number, number];
      visibility?: LogVisibility;
    },
   | No | - | - | パラメータ |
| if | filter.level && log.level !== filter.level | No | - | - | パラメータ |
| if | filter.category && log.category !== filter.category | No | - | - | パラメータ |
| if | filter.operation && log.operation !== filter.operation | No | - | - | パラメータ |
| if | !this.matchesTimeRange(log.timestamp, filter.timeRange | No | - | - | パラメータ |
| if | filter.visibility && log.visibility !== filter.visibility | No | - | - | パラメータ |
| matchesTimeRange | 
    timestamp: number,
    timeRange?: [number, number],
   | No | - | - | パラメータ |
| if | !timeRange | No | - | - | パラメータ |
| getRecentLogs | 
    count: number = LOGGER_CONSTANTS.RECENT_LOGS_COUNT,
   | No | - | - | パラメータ |
| slice | -count | No | - | - | パラメータ |
| clear |  | No | - | - | パラメータ |
| manageLogSize |  | No | - | - | パラメータ |
| if | this.logs.length > this.compressionThreshold | No | - | - | パラメータ |
| compressLogs |  | No | - | - | パラメータ |
| if | this.logs.length > this.maxLogSize | No | - | - | パラメータ |
| truncateOldestLogs |  | No | - | - | パラメータ |
| compressLogs |  | No | - | - | パラメータ |
| slice | 
      -LOGGER_CONSTANTS.COMPRESS_RECENT_LOGS_COUNT,
     | No | - | - | パラメータ |
| slice | 0, -LOGGER_CONSTANTS.COMPRESS_RECENT_LOGS_COUNT | No | - | - | パラメータ |
| filter | 
        (log | No | - | - | パラメータ |
| truncateOldestLogs |  | No | - | - | パラメータ |
| slice | -this.maxLogSize | No | - | - | パラメータ |
| getStats |  | No | - | - | パラメータ |
| create | null | No | - | - | パラメータ |
| create | null | No | - | - | パラメータ |
| for | const log of this.logs | No | - | - | パラメータ |

## 3. 出力仕様

| 戻り値 | 型 | 制約 | 説明 |
|--------|------|------|------|
| result | void | - | classの戻り値 |

## 4. 前提条件（Preconditions）

- 入力パラメータが適切に型チェックされていること

## 5. 事後条件（Postconditions）

- 戻り値が定義された型であること

## 6. 不変条件（Invariants）

- なし

## 7. 境界値テストケース

| ID | 入力 | 期待出力 | カテゴリ | 根拠 |
|----|------|----------|----------|------|
| BV-001 | 正常値 | 正常動作 | 正常系 | 標準入力 |
| BV-002 | 最小値 | 正常動作 | 最小境界 | 型の下限 |
| BV-003 | 最大値 | 正常動作 | 最大境界 | 型の上限 |
| BV-004 | 空入力 | エラー | 空入力 | 空コレクション |

## 8. エラーシナリオ

| ID | シナリオ | 入力例 | 期待動作 | 例外型 |
|----|----------|--------|----------|--------|
| ERR-001 | 型不正 | 不正な型 | エラー発生 | TypeError |
| ERR-002 | None入力 | null | エラー発生 | TypeError |
| ERR-003 | 範囲外 | 範囲外の値 | エラー発生 | RangeError |

## 9. 正常系テストケース

| ID | 入力 | 期待出力 | 説明 |
|----|------|----------|------|
| TC-001 | 正常入力 | 正常出力 | 基本動作 |

## 10. 回帰テスト要件

- 変更時に確認すべき既存機能: このclassに依存する全コンポーネント
- 影響範囲: src/lib/resilience/structured-logger.tsからimportされている箇所

## 11. 既存テスト対応

| テストファイル | テスト関数 | 対応ケース |
|--------------|-----------|-----------|
| (該当なし) | - | - |
