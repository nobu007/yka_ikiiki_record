# SPEC: PerformanceStats

## 概要
- **モジュール**: `src/lib/resilience/performance-monitor.ts`
- **責務**: 特定のメトリクスに対する統計情報を表すデータ構造
- **関連する不変条件**: INV-TYPE-001 (型安全性)

## データ構造

### PerformanceStats
| プロパティ | 型 | 必須 | 制約 | 説明 |
|-----------|-----|------|------|------|
| name | string | 必須 | 空文字列可 | メトリクス名 |
| count | number | 必須 | 正の整数 | 計測回数 |
| avgDuration | number | 必須 | 正の数値 | 平均実行時間（ミリ秒、小数点第3位まで） |
| minDuration | number | 必須 | 正の数値 | 最短実行時間（ミリ秒、小数点第3位まで） |
| maxDuration | number | 必須 | 正の数値 | 最長実行時間（ミリ秒、小数点第3位まで） |
| lastTimestamp | number | 必須 | 正の整数 | 最後の計測時刻（Unixタイムスタンプ ms） |

## 不変条件

- [ ] INV-TYPE-001: すべてのプロパティは正しい型を持つ
  - name: string
  - count: number
  - avgDuration: number
  - minDuration: number
  - maxDuration: number
  - lastTimestamp: number

- [ ] INV-STATS-001: 統計的一貫性
  - count >= 1
  - minDuration <= avgDuration <= maxDuration
  - すべてのduration値は小数点第3位に丸められている

- [ ] INV-STATS-002: 単一計測の場合
  - count === 1 のとき、avgDuration === minDuration === maxDuration

## 計算方法

```typescript
// 計測値の配列から統計を計算
const durations = metrics.map(m => m.duration);
const count = durations.length;
const sum = durations.reduce((a, b) => a + b, 0);
const avgDuration = sum / count;
const minDuration = Math.min(...durations);
const maxDuration = Math.max(...durations);

// 小数点第3位に丸め
const roundedAvg = Number.parseFloat(avgDuration.toFixed(3));
const roundedMin = Number.parseFloat(minDuration.toFixed(3));
const roundedMax = Number.parseFloat(maxDuration.toFixed(3));
```

## 使用例

```typescript
// 複数回の計測結果
const stats: PerformanceStats = {
  name: 'database-query',
  count: 100,
  avgDuration: 45.234,
  minDuration: 12.123,
  maxDuration: 234.567,
  lastTimestamp: 1711765200000
};

// 単一回の計測結果
const singleStats: PerformanceStats = {
  name: 'api-call',
  count: 1,
  avgDuration: 123.456,
  minDuration: 123.456,
  maxDuration: 123.456,
  lastTimestamp: 1711765201000
};
```

## 境界値

| 条件 | 期待値 |
|------|--------|
| count === 1 | avgDuration === minDuration === maxDuration |
| すべてのdurationが同じ | avgDuration === minDuration === maxDuration |
| 極端に短い/長いdurationが含まれる | min/maxが正しく反映される |

## シリアライズ要件

- JSONシリアライズ可能
- APIレスポンスやログ出力に使用可能
- すべての数値はプリミティブなnumber型
