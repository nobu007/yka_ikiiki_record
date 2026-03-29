# SPEC: lib.resilience.memory-monitor.MemoryMonitor

Version: 1.0.0
Last Updated: 2026-03-30
**Source**: src/lib/resilience/memory-monitor.ts:5
**Type**: class

---

## 2. 入力仕様

| パラメータ | 型 | 必須 | 制約 | デフォルト値 | 説明 |
|-----------|------|------|------|------------|------|
| N/A | - | - | - | - | (パラメータなし) |
## 3. 出力仕様

| 戻り値 | 型 | 制約 | 説明 |
|--------|------|------|------|
| N/A | - | - | (戻り値なし) |
## 2. 入力仕様

| パラメータ | 型 | 必須 | 制約 | デフォルト値 | 説明 |
|-----------|------|------|------|------------|------|
| N/A | - | - | - | - | (パラメータなし) |
## 3. 出力仕様

| 戻り値 | 型 | 制約 | 説明 |
|--------|------|------|------|
| N/A | - | - | (戻り値なし) |
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
| BV-001 | 最小値 | 正常動作 | 最小境界 | 型の下限値 |
| BV-002 | 最小値-1 | 例外発生 | 下限超過 | 範囲外 |
| BV-003 | 最大値 | 正常動作 | 最大境界 | 型の上限値 |
| BV-004 | 最大値+1 | 例外発生 | 上限超過 | 範囲外 |
| BV-005 | ゼロ値 | 正常動作 | ゼロ値 | 特殊値 |
| BV-006 | 空文字/空配列 | 正常動作 | 空入力 | 空コレクション |
| BV-007 | null/undefined | 適切な処理 | NULL値 | NULL入力 |

## 8. エラーシナリオ

| ID | シナリオ | 入力例 | 期待動作 | 例外型 |
|----|----------|--------|----------|--------|
| ERR-001 | NULL入力 | null/undefined | 適切なデフォルト値または例外 | TypeError |
| ERR-002 | 型不正 | 不正な型の値 | 例外発生 | TypeError |
| ERR-003 | 範囲外 | 負の値、過大な値 | 例外発生 | RangeError |
| ERR-004 | 不正なフォーマット | フォーマット違反 | 例外発生 | ValueError |
| ERR-005 | リソース枯渇 | 大量データリクエスト | 適切なエラー処理 | Error |
| ERR-006 | 並行実行競合 | 同時実行 | 排他制御またはエラー | Error |
| ERR-007 | タイムアウト | 長時間処理 | タイムアウトエラー | TimeoutError |

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
