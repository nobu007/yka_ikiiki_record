# SPEC: PerformanceMonitorConfig

## 概要
- **モジュール**: `src/lib/resilience/performance-monitor.ts`
- **責務**: PerformanceMonitorの動作設定を表すデータ構造
- **関連する不変条件**: INV-CONFIG-001 (設定の一貫性)

## データ構造

### PerformanceMonitorConfig
| プロパティ | 型 | 必須 | デフォルト値 | 説明 |
|-----------|-----|------|------------|------|
| maxMetrics | number | 必須 | PERFORMANCE_MONITOR_CONSTANTS.DEFAULT_MAX_METRICS | メモリ内に保存する最大メトリクス数 |
| slowRenderThreshold | number | 必須 | PERFORMANCE_MONITOR_CONSTANTS.DEFAULT_SLOW_RENDER_THRESHOLD | 低速レンダリング判定の閾値（ミリ秒） |
| enabled | boolean | 必須 | PERFORMANCE_MONITOR_CONSTANTS.DEFAULT_ENABLED | パフォーマンス監視の有効/無効フラグ |

## 不変条件

- [ ] INV-CONFIG-001: 設定値の妥当性
  - maxMetrics > 0（負の値は論理的に不正）
  - slowRenderThreshold >= 0（負の値はすべてのレンダリングを低速と判定）
  - enabledはboolean値

- [ ] INV-CONFIG-002: デフォルト値
  - すべてのプロパティはデフォルト値を持つ
  - constructorで部分設定のみが可能

## デフォルト値の定義

```typescript
// PERFORMANCE_MONITOR_CONSTANTS (src/lib/constants/resilience.ts)
const PERFORMANCE_MONITOR_CONSTANTS = {
  DEFAULT_MAX_METRICS: 1000,
  DEFAULT_SLOW_RENDER_THRESHOLD: 16.7, // 60fpsの1フレーム相当
  DEFAULT_ENABLED: true
};
```

## 設定の影響

### maxMetrics
- **影響**: 各メトリク名/コンポーネント名ごとの最大保存数
- **メモリ使用量**: 約 (メトリクス数 × maxMetrics × 1つのメトリクスサイズ) バイト
- **FIFO動作**: 上限を超えた場合、最古のメトリクスから削除
- **推奨値**: 100-1000（用途に応じて調整）

### slowRenderThreshold
- **影響**: WARNログを出力する閾値
- **推奨値**: 16.7ms（60fpsの1フレーム相当）
- **調整基準**:
  - 厳しすぎる（低い値）: 多くのWARNログ、ノイズが増加
  - 緩すぎる（高い値）: 重要な低速レンダリングを見逃す可能性

### enabled
- **影響**: パフォーマンス監視全体の有効/無効
- **無効時の動作**:
  - measure/measureAsync: 関数は実行されるが、計測・記録はされない
  - trackRender: 何も行わない（早期return）
  - getStats/getRenderStats: 記録されたメトリクスは空のMap
- **用途**: 本番環境でのパフォーマンス監視の切り替え

## 使用例

```typescript
// デフォルト設定
const monitor1 = new PerformanceMonitor();

// カスタム設定
const monitor2 = new PerformanceMonitor({
  maxMetrics: 500,
  slowRenderThreshold: 33.4, // 30fpsの1フレーム相当
  enabled: true
});

// 監視無効化（本番環境でのオーバーヘッド削減）
const monitor3 = new PerformanceMonitor({
  enabled: false
});
```

## 設定のベストプラクティス

### 開発環境
```typescript
const devMonitor = new PerformanceMonitor({
  maxMetrics: 1000,
  slowRenderThreshold: 16.7,
  enabled: true
});
```

### 本番環境
```typescript
const prodMonitor = new PerformanceMonitor({
  maxMetrics: 100,
  slowRenderThreshold: 33.4,
  enabled: process.env.NODE_ENV === 'development'
});
```

### パフォーマンス重視の環境
```typescript
const perfMonitor = new PerformanceMonitor({
  maxMetrics: 50,
  slowRenderThreshold: 50.0,
  enabled: false // 必要時のみ手動で有効化
});
```

## 境界値

| プロパティ | 最小値 | 推奨範囲 | 最大値 | 備考 |
|-----------|--------|---------|--------|------|
| maxMetrics | 1 | 100-1000 | メモリ容量に依存 | 値が大きいほどメモリ使用量が増加 |
| slowRenderThreshold | 0 | 16.7-33.4 | なし | 0ですべてのレンダリングが低速と判定 |
| enabled | - | - | - | true/false のみ |

## シリアライズ要件

- JSONシリアライズ可能
- 環境変数や設定ファイルからの読み込みが可能
- 型安全な Partial\<PerformanceMonitorConfig\> で部分設定をサポート
