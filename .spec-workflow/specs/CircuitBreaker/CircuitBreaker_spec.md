# SPEC: lib.resilience.circuit-breaker.CircuitBreaker

**Version**: 1.0.0
**Last Updated**: 2026-03-22
**Source**: src/lib/resilience/circuit-breaker.ts:41
**Type**: class

---

## 1. 概要

martinfowler.com/bliki/CircuitBreaker.html}

## 2. 入力仕様

| パラメータ | 型 | 必須 | 制約 | デフォルト値 | 説明 |
|-----------|------|------|------|--------------|------|
| configuration | optional, uses defaults | No | - | - | パラメータ |
| CircuitBreaker |  | No | - | - | パラメータ |
| execute | 
   *     async ( | No | - | - | パラメータ |
| fetchData |  | No | - | - | パラメータ |
| catch | error | No | - | - | パラメータ |
| if | error instanceof CircuitBreakerOpenError | No | - | - | パラメータ |
| execute | 
    operation: ( | No | - | - | パラメータ |
| if | 
      this.state === "OPEN" &&
      Date.now( | No | - | - | パラメータ |
| warn | "CIRCUIT_BREAKER", "REJECTED", {
        state: this.state,
        failureCount: this.failures,
        timeSinceLastFailure: Date.now( | No | - | - | パラメータ |
| CircuitBreakerOpenError |  | No | - | - | パラメータ |
| if | 
      this.state === "OPEN" &&
      Date.now( | No | - | - | パラメータ |
| info | "CIRCUIT_BREAKER", "STATE_TRANSITION", {
        from: this.state,
        to: "HALF_OPEN",
        reason: "reset_timeout_elapsed",
      } | No | - | - | パラメータ |
| operation |  | No | - | - | パラメータ |
| onSuccess | config | No | - | - | パラメータ |
| catch | error | No | - | - | パラメータ |
| onFailure | config | No | - | - | パラメータ |
| onSuccess | _config: CircuitBreakerConfig | No | - | - | パラメータ |
| if | previousState !== "CLOSED" | No | - | - | パラメータ |
| info | "CIRCUIT_BREAKER", "STATE_TRANSITION", {
        from: previousState,
        to: this.state,
        reason: "operation_success",
      } | No | - | - | パラメータ |
| onFailure | config: CircuitBreakerConfig | No | - | - | パラメータ |
| now |  | No | - | - | パラメータ |
| if | 
      this.lastFailureTime > 0 &&
      now - this.lastFailureTime > config.monitoringPeriod
     | No | - | - | パラメータ |
| if | this.failures >= config.failureThreshold && this.state !== "OPEN" | No | - | - | パラメータ |
| error | "CIRCUIT_BREAKER", "STATE_TRANSITION", {
        from: previousState,
        to: this.state,
        reason: "failure_threshold_exceeded",
        failureCount: this.failures,
        threshold: config.failureThreshold,
      } | No | - | - | パラメータ |
| state | "CLOSED" | "OPEN" | "HALF_OPEN" | No | - | - | パラメータ |
| getState |  | No | - | - | パラメータ |
| getFailureCount |  | No | - | - | パラメータ |
| reset |  | No | - | - | パラメータ |

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
- 影響範囲: src/lib/resilience/circuit-breaker.tsからimportされている箇所

## 11. 既存テスト対応

| テストファイル | テスト関数 | 対応ケース |
|--------------|-----------|-----------|
| (該当なし) | - | - |
