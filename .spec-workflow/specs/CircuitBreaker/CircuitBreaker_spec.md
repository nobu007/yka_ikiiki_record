# SPEC: CircuitBreaker

## 概要
- **モジュール**: `src/lib/resilience/circuit-breaker.ts`
- **責務**: カスケーディング故障を防ぐためのサーキットブレーカーパターンを実装する。連続する失敗が閾値を超えた場合に自動的に回路を開き、システムの過負荷を防ぐ
- **関連する不変条件**:
  - INV-RESILIENCE-001: Circuit Breaker Pattern (SYSTEM_CONSTITUTION.md §6)
  - INV-TEST-001: Test_Coverage_Floor (100% coverage achieved)

## 設計パターン

Martin FowlerのCircuit Breakerパターンに基づく実装：
https://martinfowler.com/bliki/CircuitBreaker.html

### 状態遷移

```
CLOSED → OPEN (失敗閾値超過時)
OPEN → HALF_OPEN (resetTimeout経過後)
HALF_OPEN → CLOSED (成功時)
HALF_OPEN → OPEN (失敗時)
```

## クラスメソッド

### 1. `execute<T>(operation, config?): Promise<T>`

サーキットブレーカー保護付きで非同期操作を実行する。

#### 入力契約
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|------------|
| `operation` | `() => Promise<T>` | 必須 | - |
| `config` | `CircuitBreakerConfig` | 任意 | `DEFAULT_CIRCUIT_BREAKER_CONFIG` |

#### `CircuitBreakerConfig` 型
| プロパティ | 型 | 制約 | デフォルト | 説明 |
|-----------|-----|------|------------|------|
| `failureThreshold` | `number` | >= 1 | `5` | サーキットを開くまでの連続失敗数 |
| `resetTimeout` | `number` | >= 0 | `60000` (60秒) | HALF_OPENに遷移するまでの待機時間(ms) |
| `monitoringPeriod` | `number` | >= 0 | `30000` (30秒) | 失敗カウントの監視期間(ms) |

#### 出力契約
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| `result` | `Promise<T>` | 操作が成功した場合その結果を返す |

#### エラー契約
| 条件 | 例外 | HTTPステータス |
|------|------|---------------|
| サーキットがOPENでresetTimeout経過前 | `CircuitBreakerOpenError` | 503 |
| 操作自体が失敗 | 元の例外 | - |

#### 状態遷移ロジック

**CLOSED状態（通常運用）**:
- 操作を実行
- 成功時: 失敗カウントリセット
- 失敗時: 失敗カウント増加、`failureThreshold`超過でOPENに遷移

**OPEN状態（回路が開いている）**:
- 直ちに`CircuitBreakerOpenError`をスロー
- `resetTimeout`経過後: HALF_OPENに遷移

**HALF_OPEN状態（復旧試行中）**:
- 操作を1回実行
- 成功時: CLOSEDに遷移、失敗カウントリセット
- 失敗時: OPENに遷移

#### 構造化ロギング

**OPEN時の拒否**:
```typescript
globalLogger.warn("CIRCUIT_BREAKER", "REJECTED", {
  state: "OPEN",
  failureCount: this.failures,
  timeSinceLastFailure: Date.now() - this.lastFailureTime,
  resetTimeout: config.resetTimeout,
})
```

**状態遷移**:
```typescript
globalLogger.info("CIRCUIT_BREAKER", "STATE_TRANSITION", {
  from: previousState,
  to: newState,
  reason: "reset_timeout_elapsed" | "operation_success" | "failure_threshold_exceeded",
  failureCount: this.failures,
  threshold: config.failureThreshold,
})
```

### 2. `getState(): CircuitState`

現在のサーキット状態を取得する。

#### 出力契約
| 戻り値 | 型 | 可能な値 |
|--------|-----|---------|
| `state` | `"CLOSED" | "OPEN" | "HALF_OPEN"` | 現在の状態 |

### 3. `getFailureCount(): number`

現在の失敗カウントを取得する。

#### 出力契約
| 戻り値 | 型 | 説明 |
|--------|-----|------|
| `failures` | `number` | 監視期間内の失敗回数 |

### 4. `reset(): void`

サーキットブレーカーを初期状態にリセットする。

#### 副作用
- 状態をCLOSEDに設定
- 失敗カウントを0にリセット
- 最終失敗時刻を0にリセット

## 境界値

| 入力 | 期待出力 | 備考 |
|------|---------|------|
| `config未指定` | デフォルト設定で動作 | `failureThreshold=5, resetTimeout=60000, monitoringPeriod=30000` |
| `failureThreshold=1` | 1回目の失敗でOPENに遷移 | 最小閾値 |
| `resetTimeout=0` | 即座にHALF_OPENに遷移 | テスト用 |
| `operationが成功` | 結果を返し、状態維持または改善 | CLOSED→CLOSED, HALF_OPEN→CLOSED |
| `operationが失敗` | 例外をスローし、状態悪化 | CLOSED→OPEN, HALF_OPEN→OPEN |
| `OPEN状態でexecute呼び出し` | `CircuitBreakerOpenError`をスロー | 操作を実行せず拒否 |

## 同時実行性

- **非スレッドセーフ**: JavaScriptのシングルスレッド実行モデルにより、複数の`execute`呼び出しが同時に発生する可能性がある
- **状態変更の原子性**: 状態遷移と失敗カウントの増減は`execute`メソッド内で直列に実行される
- **監視期間のリセット**: `onFailure`で監視期間経過時に失敗カウントをリセットするため、古い失敗は影響しない

## メモリ管理

- **状態保持**: `state`, `failures`, `lastFailureTime`の3つのプライベートフィールドのみ
- **メモリリークなし**: 参照循環やイベントリスナーの登録なし
- **自動クリーンアップ**: 不要、インスタンス破棄時に自動解放

## 使用例

### 基本的な使用
```typescript
const breaker = new CircuitBreaker();

try {
  const result = await breaker.execute(
    async () => await fetchData(),
    { failureThreshold: 5, resetTimeout: 60000, monitoringPeriod: 30000 }
  );
  console.log(result);
} catch (error) {
  if (error instanceof CircuitBreakerOpenError) {
    console.error("Circuit breaker is open, service unavailable");
  } else {
    console.error("Operation failed:", error);
  }
}
```

### デフォルト設定での使用
```typescript
const breaker = new CircuitBreaker();

const result = await breaker.execute(async () => {
  return await apiCall();
});
```

### 状態の監視
```typescript
const breaker = new CircuitBreaker();

console.log(breaker.getState());        // "CLOSED"
console.log(breaker.getFailureCount()); // 0

await breaker.execute(failingOperation); // 失敗

console.log(breaker.getState());        // "OPEN" (5回失敗後)
console.log(breaker.getFailureCount()); // 5
```

### 手動リセット
```typescript
const breaker = new CircuitBreaker();

await breaker.execute(failingOperation); // 失敗してOPENに
breaker.reset();                         // 強制的にCLOSEDにリセット

console.log(breaker.getState());        // "CLOSED"
```

## パフォーマンス要件

- **オーバーヘッド**: 最小限、状態チェックと日時比較のみ
- **ブロッキングなし**: 非同期操作のみ実行
- **メモリ効率**: インスタンスあたり3つの数値フィールドのみ

## テストカバレッジ

- ✅ 100% statements, 100% branches, 100% functions, 100% lines
- ✅ 4 test suites: basic, error handling, state transitions, monitoring
- ✅ 全ての状態遷移パターンを網羅
- ✅ 境界値テスト完了
- ✅ エラーシナリオテスト完了

## 不変条件チェック

- [x] INV-RESILIENCE-001: サーキットブレーカーパターン実装（CLOSED → OPEN → HALF_OPEN遷移）
- [x] INV-TEST-001: テストカバレッジ100%達成
- [x] INV-ARCH-001: 単一責務の原則（サーキットブレーカー機能のみ）
- [x] SYSTEM_CONSTITUTION.md §6: 構造化ロギング統合（globalLogger使用）

## 依存関係

- `@/lib/error-handler`: `AppError`, `ERROR_CODES`
- `@/lib/constants/resilience`: `CIRCUIT_BREAKER_CONSTANTS`
- `./structured-logger`: `globalLogger`

## エクスポート

- `CircuitBreaker`: メインクラス
- `CircuitBreakerConfig`: 設定インターフェース
- `CircuitBreakerOpenError`: サーキットオープン時のカスタムエラー
