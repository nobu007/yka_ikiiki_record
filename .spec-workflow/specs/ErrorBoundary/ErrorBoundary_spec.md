# SPEC: components.common.ErrorBoundary.ErrorBoundary

**Version**: 1.0.0
**Last Updated**: 2026-03-22
**Source**: src/components/common/ErrorBoundary.tsx:67
**Type**: class

---

## 1. 概要

Wrapping entire application

## 2. 入力仕様

| パラメータ | 型 | 必須 | 制約 | デフォルト値 | 説明 |
|-----------|------|------|------|--------------|------|
| constructor | props: Props | No | - | - | パラメータ |
| super | props | No | - | - | パラメータ |
| getDerivedStateFromError | error: Error | No | - | - | パラメータ |
| componentDidCatch | error: Error, errorInfo: ErrorInfo | No | - | - | パラメータ |
| error | 
      "ErrorBoundary",
      "componentDidCatch",
      {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        componentStack: errorInfo.componentStack,
        digest: errorInfo.digest,
      },
      "INTERNAL",
     | No | - | - | パラメータ |
| reloadPage |  | No | - | - | パラメータ |
| if | process.env.NODE_ENV !== "development" || !this.state.error | No | - | - | パラメータ |
| return | 
      <details className="mt-4 p-2 bg-gray-100 rounded text-xs">
        <summary>{ERROR_BOUNDARY_MESSAGES.DEV_DETAILS}</summary>
        <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
      </details>
     | No | - | - | パラメータ |
| renderErrorDetails |  | No | - | - | パラメータ |
| render |  | No | - | - | パラメータ |
| renderDefaultError |  | No | - | - | パラメータ |

## 3. 出力仕様

| 戻り値 | 型 | 制約 | 説明 |
|--------|------|------|------|
| result | void | - | classの戻り値 |

## 4. 前提条件（Preconditions）

- 入力パラメータが適切に型チェックされていること

## 5. 事後条件（Postconditions）

- 戻り値が定義された型であること

## 6. 不変条件（Invariants）

- なし

## 7. 境界値テストケース

| ID | 入力 | 期待出力 | カテゴリ | 根拠 |
|----|------|----------|----------|------|
| BV-001 | 正常値 | 正常動作 | 正常系 | 標準入力 |
| BV-002 | 最小値 | 正常動作 | 最小境界 | 型の下限 |
| BV-003 | 最大値 | 正常動作 | 最大境界 | 型の上限 |
| BV-004 | 空入力 | エラー | 空入力 | 空コレクション |

## 8. エラーシナリオ

| ID | シナリオ | 入力例 | 期待動作 | 例外型 |
|----|----------|--------|----------|--------|
| ERR-001 | 型不正 | 不正な型 | エラー発生 | TypeError |
| ERR-002 | None入力 | null | エラー発生 | TypeError |
| ERR-003 | 範囲外 | 範囲外の値 | エラー発生 | RangeError |

## 9. 正常系テストケース

| ID | 入力 | 期待出力 | 説明 |
|----|------|----------|------|
| TC-001 | 正常入力 | 正常出力 | 基本動作 |

## 10. 回帰テスト要件

- 変更時に確認すべき既存機能: このclassに依存する全コンポーネント
- 影響範囲: src/components/common/ErrorBoundary.tsxからimportされている箇所

## 11. 既存テスト対応

| テストファイル | テスト関数 | 対応ケース |
|--------------|-----------|-----------|
| (該当なし) | - | - |
