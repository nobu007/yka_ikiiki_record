# SPEC: RenderStats

## 概要
- **モジュール**: `src/lib/resilience/performance-monitor.ts`
- **責務**: 特定のReactコンポーネントのレンダリング統計情報を表すデータ構造
- **関連する不変条件**: INV-TYPE-001 (型安全性), INV-PERF-001 (パフォーマンス監視)

## データ構造

### RenderStats
| プロパティ | 型 | 必須 | 制約 | 説明 |
|-----------|-----|------|------|------|
| componentName | string | 必須 | 空文字列可 | コンポーネント名 |
| renderCount | number | 必須 | 正の整数 | レンダリング回数 |
| avgRenderTime | number | 必須 | 正の数値 | 平均レンダリング時間（ミリ秒、小数点第3位まで） |
| maxRenderTime | number | 必須 | 正の数値 | 最長レンダリング時間（ミリ秒、小数点第3位まで） |
| minRenderTime | number | 必須 | 正の数値 | 最短レンダリング時間（ミリ秒、小数点第3位まで） |
| slowRenderCount | number | 必須 | 非負の整数 | 低速レンダリング回数（閾値超過） |
| lastRenderTimestamp | number | 必須 | 正の整数 | 最後のレンダリング時刻（Unixタイムスタンプ ms） |

## 不変条件

- [ ] INV-TYPE-001: すべてのプロパティは正しい型を持つ
  - componentName: string
  - renderCount: number
  - avgRenderTime: number
  - maxRenderTime: number
  - minRenderTime: number
  - slowRenderCount: number
  - lastRenderTimestamp: number

- [ ] INV-STATS-001: 統計的一貫性
  - renderCount >= 1
  - slowRenderCount <= renderCount
  - minRenderTime <= avgRenderTime <= maxRenderTime
  - すべての時間値は小数点第3位に丸められている

- [ ] INV-STATS-002: 単一レンダリングの場合
  - renderCount === 1 のとき、avgRenderTime === minRenderTime === maxRenderTime

- [ ] INV-PERF-001: slowRenderCountの定義
  - slowRenderThresholdを超えるrenderTimeの数
  - 閾値はPerformanceMonitorConfig.slowRenderThresholdで定義

## 計算方法

```typescript
// レンダリング時間の配列から統計を計算
const renderTimes = metrics.map(m => m.renderTime);
const renderCount = renderTimes.length;
const sum = renderTimes.reduce((a, b) => a + b, 0);
const avgRenderTime = sum / renderCount;
const maxRenderTime = Math.max(...renderTimes);
const minRenderTime = Math.min(...renderTimes);

// 低速レンダリングのカウント
const slowRenderCount = renderTimes.filter(
  t => t > slowRenderThreshold
).length;

// 小数点第3位に丸め
const roundedAvg = Number.parseFloat(avgRenderTime.toFixed(3));
const roundedMax = Number.parseFloat(maxRenderTime.toFixed(3));
const roundedMin = Number.parseFloat(minRenderTime.toFixed(3));
```

## 使用例

```typescript
// 複数回のレンダリング統計
const stats: RenderStats = {
  componentName: 'ExpensiveChart',
  renderCount: 50,
  avgRenderTime: 23.456,
  maxRenderTime: 123.789,
  minRenderTime: 5.123,
  slowRenderCount: 3,
  lastRenderTimestamp: 1711765200000
};

// 単一回のレンダリング統計
const singleStats: RenderStats = {
  componentName: 'SimpleButton',
  renderCount: 1,
  avgRenderTime: 2.345,
  maxRenderTime: 2.345,
  minRenderTime: 2.345,
  slowRenderCount: 0,
  lastRenderTimestamp: 1711765201000
};
```

## パフォーマンス分析への活用

### 低速レンダリングの検出
```typescript
const stats = performanceMonitor.getRenderStats('MyComponent');
if (stats && stats.slowRenderCount > 0) {
  const slowRenderRatio = stats.slowRenderCount / stats.renderCount;
  console.warn(`${slowRenderRatio * 100}% of renders are slow`);
}
```

### React.memoの最適化効果の測定
```typescript
const beforeMemo = performanceMonitor.getRenderStats('Component');
// ... React.memoを適用 ...
const afterMemo = performanceMonitor.getRenderStats('Component');
console.log(`Render count reduced: ${beforeMemo.renderCount} → ${afterMemo.renderCount}`);
```

## 境界値

| 条件 | 期待値 |
|------|--------|
| renderCount === 1 | avgRenderTime === minRenderTime === maxRenderTime |
| すべてのrenderTimeが閾値以下 | slowRenderCount === 0 |
| すべてのrenderTimeが閾値超過 | slowRenderCount === renderCount |

## シリアライズ要件

- JSONシリアライズ可能
- APIレスポンスやログ出力に使用可能
- すべての数値はプリミティブなnumber型
