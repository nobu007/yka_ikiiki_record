Version: 1.0.0
Last Updated: 2026-03-30
# SPEC: ChartWrapper

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
- **モジュール**: `src/components/charts/ChartWrapper.tsx`
- **責務**: チャートコンポーネントのための一貫したレイアウト、ローディング状態、エラー処理、アクセシビリティを提供する
- **関連する不変条件**: INV-UI-001 (Chart_Loading_State_Priority), INV-UI-002 (Chart_ARIA_Labels), INV-CHART-002 (ChartWrapper_Null_Undefined_Handling)

## 入力契約
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| title | string \| undefined | オプション。空白文字列の場合はタイトル非表示 | undefined |
| height | number \| undefined | オプション。ピクセル単位の高さ | UI_CONSTANTS.CHART.HEIGHT.DEFAULT (300px) |
| isLoading | boolean \| undefined | オプション。ローディング状態フラグ | false |
| error | Error \| null \| undefined | オプション。エラーオブジェクト | null |
| children | ReactNode | 必須。レンダリングするチャートコンポーネント | なし |
| isDark | boolean \| undefined | オプション。ダークモードフラグ | false |

## 出力契約
| 状態 | 戻り値 | 保証する条件 |
|------|--------|-------------|
| Loading | JSX.Element | role="status"、aria-label="グラフローディング中"、スピナーアニメーション |
| Error | JSX.Element | role="alert"、aria-label="グラフエラー"、エラーメッセージ表示 |
| Success | JSX.Element | role="region"、children表示、オプションでタイトル |

## 状態優先順位
**INV-UI-001: Loading State Priority**
1. **isLoading = true**: ローディング表示を優先（errorが存在しても無視）
2. **error != null**: エラー表示
3. **デフォルト**: チャートコンテンツを表示

## エラー契約
| 条件 | 例外/レスポンス | HTTPステータス |
|------|----------------|---------------|
| childrenが未提供 | Reactエラー（prop-type違反） | N/A |
| heightが負数 | 負の高さが適用される（無効なUI） | N/A |
| error.messageがundefined | "グラフの表示中にエラーが発生しました: undefined" | N/A |

## 境界値
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| isLoading = true, error = new Error() | ローディングスピナー表示 | ローディング優先 |
| isLoading = false, error = new Error() | エラーメッセージ表示 | エラー状態 |
| isLoading = undefined, error = undefined | チャートコンテンツ表示 | デフォルト状態 |
| title = undefined | aria-label="統計グラフ" | デフォルトARIAラベル |
| title = "" | タイトル非表示、h3要素なし | 空文字列扱い |
| title = "Test Chart With Spaces" | chartId="chart-Test-Chart-With-Spaces-title" | スペースハイフン変換 |
| height = undefined | style.height = "300px" | デフォルト高さ |
| height = 500 | style.height = "500px" | カスタム高さ |
| isDark = true | className="text-gray-100" | ダークモード |
| isDark = false | className="text-gray-900" | ライトモード |
| isDark = undefined | className="text-gray-900" | デフォルトライトモード |

## アクセシビリティ仕様 (INV-UI-002)

### ARIAロールとラベル
| 状態 | role | aria-label | 備考 |
|------|------|-----------|------|
| Loading | status | "グラフローディング中" | ACCESSIBILITY_MESSAGES.CHART_LOADING |
| Error | alert | "グラフエラー" | ACCESSIBILITY_MESSAGES.CHART_ERROR |
| Success (titleあり) | region | titleの値 | タイトルをARIAラベルとして使用 |
| Success (titleなし) | region | "統計グラフ" | ACCESSIBILITY_MESSAGES.CHART_DEFAULT |

### ARIA関連属性
- **heading id**: `chart-{sanitized-title}-title`
- **titleのサニタイゼーション**: スペースをハイフンに変換 (`/\s+/g → "-"`)
- **chartId生成**: `chart-${title?.replace(/\s+/g, "-") ?? "chart"}`

### セマンティックHTML
```tsx
{/* Loading State */}
<div role="status" aria-label="グラフローディング中">
  <div className="animate-spin ..."></div>
</div>

{/* Error State */}
<div role="alert" aria-label="グラフエラー">
  <p>グラフの表示中にエラーが発生しました: {error.message}</p>
</div>

{/* Success State */}
<div role="region" aria-label={title || "統計グラフ"}>
  {title && <h3 id={`${chartId}-title`}>{title}</h3>}
  <div className="overflow-x-auto">{children}</div>
</div>
```

## UI/UX仕様

### ローディングスピナー
- **アニメーション**: `animate-spin` (Tailwind CSS)
- **サイズ**: `UI_CONSTANTS.CHART.SPINNER_SIZE`
- **スタイル**: `rounded-full border-b-2 border-primary`

### エラーメッセージ
- **プレフィックス**: "グラフの表示中にエラーが発生しました: "
- **色**: `UI_CONSTANTS.COLOR.ERROR`
- **レイアウト**: 中央揃え (flex items-center justify-center)

### タイトルスタイル
- **フォントサイズ**: `text-lg`
- **ウェイト**: `font-semibold`
- **マージン**: `mb-4` (下マージン)
- **ライトモード**: `text-gray-900`
- **ダークモード**: `text-gray-100`

### コンテナ
- **幅**: `w-full` (100%幅)
- **オーバーフロー**: `overflow-x-auto` (水平スクロール可能)
- **パディング**: 特定のパディングなし（子コンポーネントに委譲）

## パフォーマンス要件
| メトリクス | 期待値 | 検証方法 |
|----------|--------|---------|
| メモ化 | React.memoでラップ | コードレビュー |
| 再レンダリング防止 | propsが変更されない場合、再レンダリングなし | テスト検証 |

## 内部定数
| 定数 | 値 | 目的 |
|------|-----|------|
| UI_CONSTANTS.CHART.HEIGHT.DEFAULT | 300 | デフォルトチャート高さ (px) |
| UI_CONSTANTS.CHART.SPINNER_SIZE | Tailwindクラス | スピナーサイズ |
| UI_CONSTANTS.CHART.HEADING_COLOR.LIGHT | "text-gray-900" | ライトモード見出し色 |
| UI_CONSTANTS.CHART.HEADING_COLOR.DARK | "text-gray-100" | ダークモード見出し色 |
| UI_CONSTANTS.COLOR.ERROR | Tailwindクラス | エラーメッセージ色 |
| ACCESSIBILITY_MESSAGES.CHART_LOADING | "グラフローディング中" | ローディングARIAラベル |
| ACCESSIBILITY_MESSAGES.CHART_ERROR | "グラフエラー" | エラーARIAラベル |
| ACCESSIBILITY_MESSAGES.CHART_ERROR_MESSAGE | "グラフの表示中にエラーが発生しました:" | エラーメッセージプレフィックス |
| ACCESSIBILITY_MESSAGES.CHART_DEFAULT | "統計グラフ" | デフォルトARIAラベル |
| ACCESSIBILITY_MESSAGES.CHART_DEFAULT_ID | "chart" | デフォルトchartIdプレフィックス |

## 不変条件チェック
- [x] INV-UI-001: ローディング状態がエラー状態より優先される
- [x] INV-UI-002: 全状態で適切なARIAラベルとロールが設定される
- [x] INV-CHART-002: null/undefinedのerrorおよびtitleプロパティを適切に処理
- [x] INV-ARCH-001: シングルレスポンシビリティ（チャートラッパー機能のみ）

## 依存関係
### 外部依存
- @/lib/constants/messages: ACCESSIBILITY_MESSAGES定数
- @/lib/constants/ui: UI_CONSTANTS定数

### React依存
- React: ReactNode, memo

## 実装詳細

### メモ化戦略
```typescript
export const ChartWrapper = memo<ChartWrapperProps>(({...}) => {
  // コンポーネント実装
});
```
- React.memoでラップ：不必要な再レンダリングを防止
- displayName設定：デバッグ容易性のため

### chartId生成ロジック
```typescript
const chartId = `chart-${title?.replace(/\s+/g, "-") ?? ACCESSIBILITY_MESSAGES.CHART_DEFAULT_ID}`;
```
- title内のスペースをハイフンに変換
- titleがundefinedの場合、"chart"をデフォルトIDとして使用

### 状態判定順序
```typescript
// 1. ローディング優先
if (isLoading) {
  return <LoadingState />;
}

// 2. エラー状態
if (error) {
  return <ErrorState />;
}

// 3. 正常状態
return <SuccessState />;
```

## テストカバレッジ
### 必須テストシナリオ
1. **ローディング状態** (INV-UI-001):
   - isLoading=trueでスピナー表示
   - isLoading=falseでコンテンツ表示
   - isLoading=trueとerror存在時、ローディング優先

2. **エラー状態**:
   - error提供時のエラーメッセージ表示
   - error=null/undefinedでコンテンツ表示
   - カスタムエラーメッセージ表示

3. **アクセシビリティ** (INV-UI-002):
   - ローディング状態のrole="status"とaria-label
   - エラー状態のrole="alert"とaria-label
   - 成功状態のrole="region"とaria-label
   - タイトル存在時のheading idとchartIdの連携

4. **レンダリング**:
   - タイトルあり/なしのレンダリング
   - 空文字列タイトルの非表示
   - タイトルのサニタイゼーション（スペース→ハイフン）

5. **ダークモード**:
   - isDark=trueでダークモードスタイル適用
   - isDark=falseでライトモードスタイル適用
   - デフォルトライトモード

6. **高さカスタマイゼーション**:
   - カスタム高さの適用
   - デフォルト高さの使用

### テストファイル構成
- `ChartWrapper.loading.test.tsx`: ローディング状態と優先順位
- `ChartWrapper.error.test.tsx`: エラー状態と表示
- `ChartWrapper.accessibility.test.tsx`: ARIAラベルとロール
- `ChartWrapper.rendering.test.tsx`: 通常レンダリング、タイトル、ダークモード、高さ
- `ChartWrapper.children.test.tsx`: 子コンポーネントレンダリング
- `ChartWrapper.test.setup.tsx`: テストユーティリティとモック

## 使用例
```tsx
// 基本的な使用例
<ChartWrapper title="Monthly Emotion Trends" height={400}>
  <EmotionChart data={data} />
</ChartWrapper>

// ローディング状態
<ChartWrapper title="Student Statistics" isLoading={true}>
  <StudentChart data={[]} />
</ChartWrapper>

// エラー状態
<ChartWrapper title="Daily Distribution" error={new Error("Failed to load")}>
  <DayChart data={[]} />
</ChartWrapper>

// ダークモード
<ChartWrapper title="Night Mode Chart" isDark={true}>
  <CustomChart data={data} />
</ChartWrapper>
```

## 将来の拡張可能性
- カスタムローディングコンポーネントのpropsによる注入
- カスタムエラーコンポーネントのpropsによる注入
- 再試行ボタンの追加（エラー状態）
- チャートツールチップの統合
- アニメーションオプションの追加
- レスポンシブ高さの自動調整


## 10. 回帰テスト要件

- 変更時に確認すべき既存機能: (このSPECに関連する機能)
- 影響範囲: (このSPECを使用しているモジュール)
- 回帰テストケース: (変更時の挙動確認)
