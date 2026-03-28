# SPEC: Dashboard

## 概要
- **モジュール**: src/components/Dashboard.tsx
- **責務**: メインダッシュボードUIを表示し、統計データの取得・表示を行う
- **関連する不変条件**:
  - INV-UI-001: Chart_Loading_State_Priority
  - INV-UI-002: Chart_ARIA_Labels
  - INV-UI-003: Chart_Error_Resilience
  - INV-TIME-001: Timeout_Wrapper_Standard_Durations
  - INV-ERR-001: AppError_Type_Guard_Contract

## 入力契約

| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| isGenerating | boolean | 必須 | - |
| onGenerate | () => void | 必須 | - |
| notification.show | boolean | 任意 | false |
| notification.message | string | show=trueの場合必須 | - |
| notification.type | "success" \| "error" \| "warning" \| "info" | show=trueの場合必須 | - |
| onNotificationClose | (() => void) \| undefined | 任意 | undefined |

## 出力契約

| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| JSX.Element | React.FC | nullを返さない、常に有効なJSXを返す |
| 内部state stats | StatsData \| null | API検証済みのデータのみ格納 |
| 内部state isLoading | boolean | ローディング状態を正確に反映 |

## エラー契約

| 条件 | 例外/レスポンス | HTTPステータス |
|------|----------------|---------------|
| API呼び出し失敗 | AppError | 0（ネットワークエラー） |
| APIレスポンスが200以外 | AppError | response.status |
| バリデーション失敗 | AppError | 500 |
| タイムアウト | TimeoutError | - |

## 境界値

| 入力 | 期待出力 | 備考 |
|------|---------|------|
| isGenerating=true | ボタンがdisabled、ローディングスピナー表示 | - |
| isGenerating=false | ボタンが有効、プラスアイコン表示 | - |
| notification.show=true | 通知コンポーネント表示 | - |
| notification.show=false | 通知非表示 | - |
| stats=null, isLoading=false | 空状態メッセージ表示 | - |
| stats!=null, isLoading=false | DataVisualizationコンポーネント表示 | - |
| stats=null, isLoading=true | ローディングスピナー表示 | - |

## 不変条件チェック

- [ ] INV-UI-001: ローディング状態がエラー状態より優先される
- [ ] INV-TIME-001: API呼び出しは10秒タイムアウトを使用
- [ ] INV-ERR-001: エラーは正規化され、構造化ログに記録される
- [ ] React.memoによる最適化: propsが変更された場合のみ再レンダリング
- [ ] 成功通知受信時にstatsを再フェッチする
- [ ] StatsResponseSchemaによる実行時バリデーション

## 副作用

1. **マウント時**: `/api/seed` からstatsデータを自動フェッチ
2. **成功通知時**: statsデータを再フェッチ
3. **エラー発生時**: 構造化ログに出力（logError）

## パフォーマンス要件

1. **React.memo**: メモ化により不要な再レンダリングを防止
2. **useCallback**: fetchStats関数は再生成されない
3. **useMemo**: featuresListとhelpTextは依存関係が変更された場合のみ再計算

## アクセシビリティ

1. **aria-describedby**: "generate-help" 属性でボタンと説明テキストを関連付け
2. **ローディング状態**: LoadingSpinnerコンポーネントで視覚的なフィードバック
3. **disabled状態**: isGenerating時はボタンを無効化
