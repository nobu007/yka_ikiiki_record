Version: 1.0.0
Last Updated: 2026-03-30
# SPEC: LoadingCard

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
- **モジュール**: `src/components/common/LoadingSpinner.tsx`
- **責務**: カード型コンテナで読み込み状態を表示する。グリッドレイアウトやコンテンツエリア内でのインライン読み込み表示に使用する
- **関連する不変条件**:
  - INV-ARCH-001: Single_Responsibility_Enforcement (ローディング表示のみ、ビジネスロジックなし)
  - INV-TEST-001: Test_Coverage_Floor (90%+ coverage required)

## 入力契約
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|------------|
| `message` | `string` | 任意、空文字列可 | `"データを読み込み中..."` (LOADING_MESSAGES.CARD) |

## 出力契約
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| JSX Element | `JSX.Element` | 常にカードコンテナとスピナーを描画 |

## エラー契約
このコンポーネントはエラーをスローしない。

## 境界値
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| `message未指定` | デフォルトメッセージ `"データを読み込み中..."` を表示 | LOADING_MESSAGES.CARDを使用 |
| `message="Custom"` | カスタムメッセージを表示 | ユーザー指定のメッセージ |
| `message=""` | 空文字列を表示 | 空メッセージも許容 |

## 表示仕様

### カードコンテナ
- CSSクラス: `bg-white p-6 rounded-lg shadow-md`
- 白色背景、角丸、中程度の影
- パディング: `p-6` (1.5rem / 24px)
- 影: `shadow-md` (中程度の影、shadow-xlより小さい)

### 内部コンテナ
- CSSクラス: `flex flex-col items-center justify-center py-8`
- 垂直方向フレックスレイアウト
- 中央揃え（水平・垂直）
- 上下パディング: `py-8` (2rem / 32px)

### スピナー
- `LoadingSpinner`コンポーネントを使用
- サイズ: `md` (medium、h-8 w-8)
- アニメーション: 回転する円形

### メッセージテキスト
- CSSクラス: `mt-4 text-gray-600 text-sm`
- スピナーの下に配置
- 色: グレー600（Overlayのグレー700より少し薄い）
- フォントサイズ: `text-sm` (0.875rem / 14px)

## レンダリング構造

```tsx
<div className="bg-white p-6 rounded-lg shadow-md">
  <div className="flex flex-col items-center justify-center py-8">
    <LoadingSpinner size="md" />
    <p>{message}</p>
  </div>
</div>
```

## アクセシビリティ
- スピナーには`aria-label`や`role="status"`が必要（LoadingSpinner側で対応）
- 読み込み状態をスクリーンリーダーが認識できる必要がある
- オーバーレイではないため、背景コンテンツへのアクセスは遮断しない

## 使用例

### 基本的な使用
```tsx
<LoadingCard />
```

### カスタムメッセージ
```tsx
<LoadingCard message="統計データを読み込み中..." />
```

### グリッドレイアウトでの使用
```tsx
<div className="grid grid-cols-2 gap-4">
  <DataCard title="完了" stats={completeStats} />
  <LoadingCard message="読み込み中..." />
</div>
```

### コンテンツエリアでの使用
```tsx
<div className="space-y-4">
  <StatsCard data={currentData} />
  {isLoadingNext ? (
    <LoadingCard message="次のデータを読み込み中..." />
  ) : (
    <StatsCard data={nextData} />
  )}
</div>
```

## パフォーマンス要件
- `React.memo`でラップされ、不必要な再レンダリングを防ぐ
- 親コンポーネントからの`message` prop変更時のみ再レンダリング

## 依存関係
- `LoadingSpinner`コンポーネント（同じファイル内で定義）
- `LOADING_MESSAGES.CARD`定数（`@/lib/constants/messages`）

## 他コンポーネントとの比較

| コンポーネント | 用途 | 表示位置 | 背景 |
|---------------|------|---------|------|
| `LoadingSpinner` | 最小限の読み込み表示 | インライン | なし |
| `LoadingOverlay` | フルスクリーンオーバーレイ | 全画面固定 | セミトランスペアレント |
| `LoadingCard` | カード型読み込み表示 | インライン/グリッド | なし |

## 不変条件チェック
- [x] INV-ARCH-001: コンポーネントは単一責務を持つ（ローディング表示のみ）
- [x] INV-ARCH-001: ファイル行数 < 300（LoadingSpinner.tsx全体で175行）
- [x] INV-TEST-001: テストカバレッジ >= 90%（達成: 100%カバレッジ、6テスト全件合格）

## レスポンシブデザイン
- カードは親コンテナの幅に適応
- 固定幅を持たないため、グリッドシステムで柔軟に使用可能
- スピナーとメッセージは中央揃えで配置


## 10. 回帰テスト要件

- 変更時に確認すべき既存機能: (このSPECに関連する機能)
- 影響範囲: (このSPECを使用しているモジュール)
- 回帰テストケース: (変更時の挙動確認)


## 11. 既存テスト対応

| テストファイル | テスト関数 | 対応ケース |
|--------------|-----------|-----------|
