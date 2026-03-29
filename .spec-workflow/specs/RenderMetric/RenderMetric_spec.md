# SPEC: RenderMetric

## 概要
- **モジュール**: `src/lib/resilience/performance-monitor.ts`
- **責務**: Reactコンポーネントの単一回のレンダリング計測結果を表すデータ構造
- **関連する不変条件**: INV-TYPE-001 (型安全性)

## データ構造

### RenderMetric
| プロパティ | 型 | 必須 | 制約 | 説明 |
|-----------|-----|------|------|------|
| componentName | string | 必須 | 空文字列可 | コンポーネント名 |
| renderTime | number | 必須 | 正の数値 | レンダリング時間（ミリ秒） |
| timestamp | number | 必須 | 正の整数 | 計測時刻（Unixタイムスタンプ ms） |
| propsHash | string | 任意 | - | コンポーネントpropsのハッシュ値（類似レンダリングのグループ化用） |

## 不変条件

- [ ] INV-TYPE-001: すべてのプロパティは正しい型を持つ
  - componentName: string
  - renderTime: number
  - timestamp: number
  - propsHash: string \| undefined

- [ ] INV-RENDER-001: renderTimeは正の数値であるべき
  - 負の値やNaNは論理的に不正だが、型システムでは防止されない

- [ ] INV-RENDER-002: propsHashの目的
  - 同じpropsを持つレンダリングをグループ化するための識別子
  - 実装依存だが、一般的にはハッシュ関数で生成される文字列

## 使用例

```typescript
// 基本的なレンダリング計測
const basicMetric: RenderMetric = {
  componentName: 'UserProfile',
  renderTime: 16.7,
  timestamp: 1711765200000
};

// propsHashを含む計測
const detailedMetric: RenderMetric = {
  componentName: 'DataTable',
  renderTime: 45.2,
  timestamp: 1711765201000,
  propsHash: 'abc123def456'
};
```

## propsHashの用途

- 同じコンポーネントで異なるpropsによるレンダリングを区別
- 特定のpropsパターンが低速レンダリングを引き起こすかを分析
- React.memoの最適化効果を測定

## シリアライズ要件

- JSONシリアライズ可能
- structured-loggerによるログ出力時にJSON形式で変換される
- renderTimeは小数点第1位までの精度を持つ（一般的なブラウザのperformance.now()の精度）
