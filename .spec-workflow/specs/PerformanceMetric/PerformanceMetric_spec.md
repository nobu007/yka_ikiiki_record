# SPEC: PerformanceMetric

## 概要
- **モジュール**: `src/lib/resilience/performance-monitor.ts`
- **責務**: 単一のパフォーマンス計測結果を表すデータ構造
- **関連する不変条件**: INV-TYPE-001 (型安全性)

## データ構造

### PerformanceMetric
| プロパティ | 型 | 必須 | 制約 | 説明 |
|-----------|-----|------|------|------|
| name | string | 必須 | 空文字列可 | 計測の一意識別子 |
| duration | number | 必須 | 正の数値 | 実行時間（ミリ秒） |
| timestamp | number | 必須 | 正の整数 | 計測時刻（Unixタイムスタンプ ms） |
| metadata | Record\<string, unknown\> | 任意 | - | 計測に関する追加メタデータ |

## 不変条件

- [ ] INV-TYPE-001: すべてのプロパティは正しい型を持つ
  - name: string
  - duration: number
  - timestamp: number
  - metadata: Record\<string, unknown\> \| undefined

- [ ] INV-DATA-001: durationは正の数値であるべき
  - 負の値やNaNは論理的に不正だが、型システムでは防止されない

- [ ] INV-DATA-002: timestampは有効なUnixタイムスタンプであるべき
  - Date.now()の戻り値（ミリ秒単位）

## 使用例

```typescript
// 同期関数の計測結果
const metric: PerformanceMetric = {
  name: 'database-query',
  duration: 45.234,
  timestamp: 1711765200000,
  metadata: {
    queryType: 'SELECT',
    rowCount: 100
  }
};

// 非同期関数の計測結果
const asyncMetric: PerformanceMetric = {
  name: 'api-fetch',
  duration: 234.567,
  timestamp: 1711765201000,
  metadata: {
    endpoint: '/api/users',
    status: 200
  }
};
```

## シリアライズ要件

- JSONシリアライズ可能
- structured-loggerによるログ出力時にJSON形式で変換される
- durationは小数点第3位までの精度を持つ
