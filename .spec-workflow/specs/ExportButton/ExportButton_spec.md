Version: 1.0.0
Last Updated: 2026-03-30
# SPEC: ExportButton

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
- **モジュール**: `src/components/common/ExportButton.tsx`
- **責務**: 統計データをCSVまたはExcel形式でエクスポートするボタンUIコンポーネント
- **関連する不変条件**: INV-UI-001 (Loading State Priority), INV-UI-002 (ARIA Labels)

## 入力契約（Props）
| プロパティ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| format | "csv" \| "xlsx" | 必須。エクスポート形式 | - |
| disabled | boolean | 任意。ボタンの無効状態 | false |
| className | string | 任意。追加のCSSクラス | - |

## 出力契約（UI挙動）
| 状態 | 表示内容 | ARIA属性 |
|------|---------|----------|
| 初期状態 | アイコン + "Export {CSV\|Excel}" テキスト | aria-label="Download as {CSV\|Excel}" |
| エクスポート中 | ローディングスピナー + "Exporting..." テキスト | aria-label="Download as {CSV\|Excel}" |
| disabled=true | ボタン無効、クリック不可 | - |
| エラー発生 | 通知表示（useNotification経由） | - |

## エラー契約
| 条件 | 挙動 | 通知タイプ |
|------|------|----------|
| HTTPレスポンスが !ok | normalizeErrorでエラー変換、logErrorでログ記録 | error |
| ネットワークエラー | 同上 | error |
| エクスポート成功 | ファイルダウンロードトリガー | - |

## 境界値
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| format: "csv" | CSVファイルダウンロード | ファイル名: records.csv |
| format: "xlsx" | Excelファイルダウンロード | ファイル名: records.xlsx |
| disabled: true | ボタン無効、クリック無効 | isExporting時も自動的に無効 |
| 連続クリック | 2回目以降は無効（isExporting=true） | 二重送信防止 |

## 内部処理フロー
1. ユーザークリック → `handleExport` 呼び出し
2. `setIsExporting(true)` でローディング状態開始
3. `GET /api/export?format={format}` リクエスト送信
4. レスポンスチェック → `!ok` ならAppErrorスロー
5. `response.blob()` でバイナリデータ取得
6. 一時URL作成 → `<a>` 要素生成 → クリックトリガー
7. クリーンアップ：URL破棄、DOM要素削除
8. `setIsExporting(false)` でローディング状態終了

## 不変条件チェック
- [x] INV-UI-001: isExporting=true の時、ローディング状態が優先表示される
- [x] INV-UI-002: 適切なARIAラベルが提供される（aria-label="Download as {format}"）

## 実装ノート
- `React.memo` でパフォーマンス最適化（propsが変更された場合のみ再レンダリング）
- `useCallback` で `handleExport` 関数をメモ化（format依存）
- `API_ENDPOINTS.EXPORT` 定数を使用（ハードコード防止）
- エラーハンドリングは `@/lib/error-handler` の共通関数を使用
- バイナリダウンロードは Blob + ObjectURL パターンで実装
- `displayName` を設定（React DevTools友好性）


## 10. 回帰テスト要件

- 変更時に確認すべき既存機能: (このSPECに関連する機能)
- 影響範囲: (このSPECを使用しているモジュール)
- 回帰テストケース: (変更時の挙動確認)
