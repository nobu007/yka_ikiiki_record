# SPEC: generateCSVFilename

## 概要
- **モジュール**: `src/lib/export/csv.ts`
- **責務**: CSVエクスポート用の一意なファイル名をタイムスタンプ付きで生成する
- **関連する不変条件**: INV-API-010 (Content-Disposition Header), INV-API-011 (Unique Filename Generation)

## 入力契約
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| prefix | string | 任意。ファイル名の接頭辞 | "stats" |
| format | "ISO" \| "JP" | 任意。日付フォーマットの種類 | "ISO" |

## 出力契約
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| ファイル名 | string | `{prefix}_{date}_{time}.csv` 形式。一意性はタイムスタンプにより保証 |

### 出力形式
- **ISO形式**: `{prefix}_YYYY-MM-DD_HH-MM-SS.csv`
- **JP形式**: `{prefix}_{Japanese locale date}_HH-MM-SS.csv`

## エラー契約
| 条件 | 例外/レスポンス | HTTPステータス |
|------|----------------|---------------|
| formatが無効な値 | TypeScriptコンパイルエラー（Union型により防止） | - |

## 境界値
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| prefix: "export" | export_YYYY-MM-DD_HH-MM-SS.csv | カスタム接頭辞 |
| prefix: "" | _YYYY-MM-DD_HH-MM-SS.csv | 空文字許容 |
| format: "ISO" | 2024-03-29 形式 | ISO 8601準拠 |
| format: "JP" | 日本語ロケールの日付形式 | 例: 2024/3/29 |
| 同時に複数回呼び出し | 異なるタイムスタンプ（秒単位） | 一意性保証 |

## 不変条件チェック
- [x] INV-API-010: ファイル名はタイムスタンプを含み、一意性を保証
- [x] INV-API-011: 各呼び出しで異なるタイムスタンプが生成される

## 実装ノート
- `formatDate` 内部関数が日付フォーマット処理を行う
- 時刻の区切り文字はコロン（:）からハイフン（-）に変換（ファイルシステム互換性）
- ISO形式は `toISOString().split("T")[0]` で実装
- JP形式は `toLocaleDateString("ja-JP")` で実装
