Version: 1.0.0
Last Updated: 2026-03-30
# SPEC: DataVisualization

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
## 概要
- **モジュール**: `src/components/dashboard/DataVisualization.tsx`
- **責務**: 統計データの包括的な可視化ダッシュボードを提供し、複数のチャートタイプと統計表示を整理してレンダリングする
- **関連する不変条件**: INV-DOM-002 (Stats_Structure_Completeness), INV-SVC-001 (StatsService_Complete_Stats_Structure)

## 入力契約
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| data | StatsData | 必須。completeなStats構造を持つこと | なし |

### StatsData構造
```typescript
interface StatsData {
  overview: { count: number; avgEmotion: number };
  monthlyStats: MonthlyStats[];
  dayOfWeekStats: DayOfWeekStats[];
  emotionDistribution: number[];
  timeOfDayStats: TimeOfDayStats;
  studentStats: StudentStats[];
}
```

## 出力契約
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| JSX.Element | React.FC | 7つのセクションを含む完全なダッシュボードUI |

### 可視化セクション
1. **Overview Statistics**: 総記録数と平均感情スコア
2. **Monthly Trends**: 月別感情パターン
3. **Day of Week Analysis**: 曜日別パターン
4. **Emotion Distribution**: 感情カテゴリ別内訳
5. **Time of Day Analysis**: 時間帯別パターン
6. **Student Statistics**: 個別生徒データとトレンド指標
7. **Recent Trends**: 最近の感情変化を示す折れ線グラフ

## エラー契約
| 条件 | 例外/レスポンス | HTTPステータス |
|------|----------------|---------------|
| dataがundefined/null | Reactエラー（prop-type違反） | N/A |
| StatsData構造が不完全 | 子チャートコンポーネントでエラー | N/A |

## 境界値
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| overview.count = 0 | "0"を表示 | 空データケース |
| studentStats = [] | 空のテーブルを表示 | 生徒不在ケース |
| studentStats.length > 10 | 上位10名のみ表示 | MAX_STUDENTS_IN_TABLE制限 |
| trendline.length = 0 | トレンド矢印なし（空文字列） | データ不足ケース |
| trendline.length = 1 | トレンド矢印なし（空文字列） | 単一ポイントケース |
| trendline[last] > trendline[prev] | "↗️" (上矢印) | 上昇トレンド |
| trendline[last] < trendline[prev] | "↘️" (下矢印) | 下降トレンド |
| trendline[last] === trendline[prev] | "→" (右矢印) | 安定トレンド |
| overview.count = 1,000,000 | "1,000,000" (ロケール対応) | 大数値フォーマット |

## パフォーマンス要件
| メトリクス | 期待値 | 検証方法 |
|----------|--------|---------|
| 典型的データでのレンダリング時間 | < 1000ms | performance.now()計測 |
| 大データセット(100生徒)でのレンダリング | < 2000ms | performance.now()計測 |
| メモ化の適用 | useMemo/useCallback使用 | コードレビュー |

## UI/UX仕様
### レスポンシブデザイン
- モバイル: 1カラムグリッド (grid-cols-1)
- デスクトップ: 2カラムグリッド (lg:grid-cols-2)
- 統計カード: モバイル1カラム、デスクトップ2カラム (md:grid-cols-2)

### カラースキーム
- **Total Records**: 青 (bg-blue-50, text-blue-600)
- **Average Emotion**: 緑 (bg-green-50, text-green-600)
- **Table Headers**: グレー (bg-gray-50)
- **Alternating Rows**: 白/グレー (bg-white / bg-gray-50, modulo 2)

### ローカライゼーション
- ヘッダー: CHART_TITLES定数（日本語）
- テーブルヘッダー: ハードコードされた日本語テキスト
- 数値フォーマット: toLocaleString()によるロケール対応

## 内部定数
| 定数名 | 値 | 目的 |
|--------|-----|------|
| MAX_STUDENTS_IN_TABLE | 10 | パフォーマンスのためのテーブル行数制限 |
| ALTERNATING_ROW_MODULO | 2 | テーブル行の背景色パターン |
| RECENT_TREND_POINTS | 3 | トレンド表示に使用する最近のデータポイント数 |

## 不変条件チェック
- [x] INV-DOM-002: StatsDataの完全な構造を子コンポーネントに渡す
- [x] INV-SVC-001: 全7つのサブセクション(overview, monthlyStats, studentStats, dayOfWeekStats, emotionDistribution, timeOfDayStats, studentStatsテーブル)をレンダリング
- [x] INV-ARCH-001: シングルレスポンシビリティ（データ可視化のみ、データ変換なし）

## 依存関係
### 子コンポーネント
- MonthlyEmotionChart (月次トレンド)
- DayOfWeekChart (曜日別分析)
- EmotionDistributionChart (感情分布)
- TimeOfDayChart (時間帯分析)
- StudentEmotionChart (生徒統計)
- EmotionTrendChart (トレンド分析)
- ExportButton (CSV/XLSXエクスポート)

### 外部依存
- @/schemas/api: StatsData型定義
- @/lib/constants/messages: CHART_TITLES定数

## 実装詳細
### メモ化戦略
```typescript
// 学生統計スライスのメモ化（最大10名に制限）
const studentStatsSlice = useMemo(
  () => data.studentStats.slice(0, MAX_STUDENTS_IN_TABLE),
  [data.studentStats]
);

// トレンド矢印フォーマットのコールバックメモ化
const formatTrendArrow = useCallback((trendline: number[]) => {
  if (trendline.length < 2) return "";
  const last = trendline[trendline.length - 1];
  const prev = trendline[trendline.length - 2];
  if (last === undefined || prev === undefined) return "";
  return last > prev ? "↗️" : last < prev ? "↘️" : "→";
}, []);
```

### コンポーネントラッパー
- React.memoでラップ：不必要な再レンダリングを防止
- displayName設定：デバッグ容易性のため

## テストカバレッジ
### 必須テストシナリオ
1. **正常系**: 完全なStatsDataでのレンダリング
2. **境界値**: 空データ、大数値、単一生徒、多数生徒(50+)
3. **トレンド矢印**: 上昇、下降、安定、単一ポイント、空配列
4. **パフォーマンス**: 典型的データ<1000ms、大データセット<2000ms
5. **統合**: 子コンポーネントへの正しいprops渡し

### テストファイル構成
- `DataVisualization.rendering.test.tsx`: 基本レンダリングと統合
- `DataVisualization.logic.test.tsx`: トレンド矢印ロジックとデータ統合
- `DataVisualization.edgeCases.test.tsx`: 境界値とパフォーマンス

## 将来の拡張可能性
- カスタム学生数制限のpropsによる設定可能化
- テーブルソート機能の追加
- チャートタイプの切り替え機能
- ダークモード対応
- i18n対応による多言語サポート


## 10. 回帰テスト要件

- 変更時に確認すべき既存機能: (このSPECに関連する機能)
- 影響範囲: (このSPECを使用しているモジュール)
- 回帰テストケース: (変更時の挙動確認)


## 11. 既存テスト対応

| テストファイル | テスト関数 | 対応ケース |
|--------------|-----------|-----------|
