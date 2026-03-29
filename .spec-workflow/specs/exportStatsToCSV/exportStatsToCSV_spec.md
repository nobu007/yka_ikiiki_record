Version: 1.0.0
Last Updated: 2026-03-30
# SPEC: exportStatsToCSV

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
- **モジュール**: `src/lib/export/csv.ts`
- **責務**: StatsDataオブジェクトをCSVフォーマットの文字列に変換する
- **関連する不変条件**: INV-API-005 (CSV Headers), INV-API-006 (CSV Escaping Commas), INV-API-007 (CSV Escaping Quotes), INV-API-008 (CSV Escaping Newlines)

## 入力契約
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| data | StatsData | 必須。overview, monthlyStats, studentStats, dayOfWeekStats, emotionDistribution, timeOfDayStatsを含む完全な構造 | - |
| options | CsvExportOptions | 任意。includeHeaders, separator, dateFormatを含む | `{ includeHeaders: true, separator: ",", dateFormat: "ISO" }` |

## 出力契約
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| CSV文字列 | string | RFC 4180準拠のCSVフォーマット。改行区切りの行データ。ヘッダー行は"Section,Key,Value" |

### 出力構造
```
Section,Key,Value
Overview,Record Count,{count}
Overview,Average Emotion,{avgEmotion}
Monthly Stats,{month},{count},{avgEmotion}
Day of Week,{day},{count},{avgEmotion}
Student,{student},{recordCount},{avgEmotion}
Time of Day,Morning,{morning}
Time of Day,Afternoon,{afternoon}
Time of Day,Evening,{evening}
```

## エラー契約
| 条件 | 例外/レスポンス | HTTPステータス |
|------|----------------|---------------|
| dataがundefined/null | TypeScriptコンパイルエラー（型システムにより防止） | - |
| options.separatorが空文字 | 空文字で結合（不正なCSVが生成される可能性） | - |

## 境界値
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| monthlyStats: [] | 空のMonthly Statsセクション（行が生成されない） | 正常処理 |
| studentStats: [] | 空のStudentセクション（行が生成されない） | 正常処理 |
| dayOfWeekStats: [] | 空のDay of Weekセクション（行が生成されない） | 正常処理 |
| student名にカンマ含む | ダブルクォートで囲まれ、カンマはエスケープ | RFC 4180準拠 |
| student名にダブルクォート含む | ダブルクォート2つでエスケープ | RFC 4180準拠 |
| student名に改行含む | ダブルクォートで囲まれ、改行は保持 | RFC 4180準拠 |
| includeHeaders: false | 最初の行がデータ行 | ヘッダー省略 |
| separator: ";" | セミコロン区切り | 欧州CSV形式対応 |

## 不変条件チェック
- [x] INV-API-005: 最初の行は "Section,Key,Value" ヘッダー
- [x] INV-API-006: カンマを含む値はダブルクォートで囲む
- [x] INV-API-007: ダブルクォートは "" でエスケープ
- [x] INV-API-008: 改行を含む値はダブルクォートで囲む

## 実装ノート
- `escapeCSVValue` 内部関数がRFC 4180準拠のエスケープ処理を行う
- 数値は `toFixed(2)` で小数点第2位までフォーマット
- 日付フォーマットオプションは内部的には使用されていない（将来の拡張用）


## 10. 回帰テスト要件

- 変更時に確認すべき既存機能: (このSPECに関連する機能)
- 影響範囲: (このSPECを使用しているモジュール)
- 回帰テストケース: (変更時の挙動確認)
