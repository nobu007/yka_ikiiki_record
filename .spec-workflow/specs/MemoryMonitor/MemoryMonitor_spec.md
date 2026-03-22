# SPEC: lib.resilience.memory-monitor.MemoryMonitor

**Version**: 1.0.0
**Last Updated**: 2026-03-22
**Source**: src/lib/resilience/memory-monitor.ts:5
**Type**: class

---

## 1. 概要

classの実装

## 2. 入力仕様

| パラメータ | 型 | 必須 | 制約 | デフォルト値 | 説明 |
|-----------|------|------|------|--------------|------|
| constructor | 
    memoryLimit: number = MEMORY_MONITOR_CONSTANTS.MEMORY_LIMIT_MB *
      MEMORY_MONITOR_CONSTANTS.BYTES_PER_MB,
    checkInterval: number = MEMORY_MONITOR_CONSTANTS.CHECK_INTERVAL_MS,
   | No | - | - | パラメータ |
| startMonitoring |  | No | - | - | パラメータ |
| if | this.intervalId | No | - | - | パラメータ |
| setInterval | ( | No | - | - | パラメータ |
| memoryUsage |  | No | - | - | パラメータ |
| logMemoryMetrics | memoryUsage | No | - | - | パラメータ |
| if | memoryUsage.heapUsed > this.memoryLimit | No | - | - | パラメータ |
| handleMemoryOverflow | memoryUsage | No | - | - | パラメータ |
| info | "MEMORY_MONITOR", "STARTED", {
      checkInterval: this.checkInterval,
      memoryLimit: this.memoryLimit,
    } | No | - | - | パラメータ |
| stopMonitoring |  | No | - | - | パラメータ |
| if | this.intervalId | No | - | - | パラメータ |
| clearInterval | this.intervalId | No | - | - | パラメータ |
| info | "MEMORY_MONITOR", "STOPPED", {
        reason: "manual_stop",
      } | No | - | - | パラメータ |
| destroy |  | No | - | - | パラメータ |
| stopMonitoring |  | No | - | - | パラメータ |
| info | "MEMORY_MONITOR", "DESTROYED", {
      reason: "cleanup",
    } | No | - | - | パラメータ |
| handleMemoryOverflow | usage: NodeJS.MemoryUsage | No | - | - | パラメータ |
| if | gcTriggered | No | - | - | パラメータ |
| as |  | No | - | - | パラメータ |
| fatal | "MEMORY", "OVERFLOW", {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers,
      gcTriggered,
      memoryLimit: this.memoryLimit,
      usagePercentage: this.getUsagePercentage( | No | - | - | パラメータ |
| reset |  | No | - | - | パラメータ |
| logMemoryMetrics | usage: NodeJS.MemoryUsage | No | - | - | パラメータ |
| debug | "MEMORY", "METRICS", {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers,
      rss: usage.rss,
    } | No | - | - | パラメータ |
| getCurrentUsage |  | No | - | - | パラメータ |
| memoryUsage |  | No | - | - | パラメータ |
| getUsagePercentage |  | No | - | - | パラメータ |
| memoryUsage |  | No | - | - | パラメータ |
| return | 
      (usage.heapUsed / this.memoryLimit | No | - | - | パラメータ |
| isNearLimit | 
    threshold: number = MEMORY_MONITOR_CONSTANTS.THRESHOLD_RATIO,
   | No | - | - | パラメータ |
| return | 
      this.getUsagePercentage( | No | - | - | パラメータ |

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
- 影響範囲: src/lib/resilience/memory-monitor.tsからimportされている箇所

## 11. 既存テスト対応

| テストファイル | テスト関数 | 対応ケース |
|--------------|-----------|-----------|
| (該当なし) | - | - |
