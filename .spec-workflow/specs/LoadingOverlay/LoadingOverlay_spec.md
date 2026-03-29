# SPEC: LoadingOverlay

## 概要
- **モジュール**: `src/components/common/LoadingSpinner.tsx`
- **責務**: フルスクリーンオーバーレイモーダルで、読み込み状態をユーザーに視覚的に伝える
- **関連する不変条件**: UI-001 (ユーザーインターフェースの応答性)

## 入力契約
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| `isLoading` | `boolean` | 必須 | - |
| `message` | `string` | 任意、空文字列不可 | `"読み込み中..."` (LOADING_MESSAGES.OVERLAY) |

## 出力契約
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| JSX Element | `JSX.Element \| null` | `isLoading=false`の場合は`null`を返し、DOMに何も描画しない |
| | | `isLoading=true`の場合は、フルスクリーンオーバーレイと読み込みインジケーターを描画 |

## エラー契約
このコンポーネントはエラーをスローしない。

## 境界値
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| `isLoading=true, message未指定` | デフォルトメッセージ `"読み込み中..."` を表示 | LOADING_MESSAGES.OVERLAYを使用 |
| `isLoading=true, message="Custom"` | カスタムメッセージを表示 | ユーザー指定のメッセージ |
| `isLoading=false` | `null`を返し、DOMに何も描画しない | 完全に非表示 |

## 表示仕様

### オーバーレイ背景
- CSSクラス: `fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50`
- 全画面を覆うセミトランスペアレントな背景
- z-index: 50（最前面）
- 背景色: グレー600、50%透明度

### モーダルカード
- CSSクラス: `bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4`
- 白色背景、角丸、影付き
- 最大幅: `max-w-sm` (24rem / 384px)
- 左右マージン: `mx-4` (1rem / 16px)
- 水平方向: 中央揃え
- 垂直方向: 中央揃え

### スピナー
- `LoadingSpinner`コンポーネントを使用
- サイズ: `lg` (large)
- アニメーション: 回転する円形

### メッセージテキスト
- CSSクラス: `mt-4 text-gray-700 text-center`
- スピナーの下に配置
- 色: グレー700
- 配置: 中央揃え

## レンダリング条件

### 条件1: `isLoading=true`の場合
```tsx
<div className="fixed inset-0 ...">
  <div className="bg-white p-6 rounded-lg ...">
    <LoadingSpinner size="lg" />
    <p>{message}</p>
  </div>
</div>
```

### 条件2: `isLoading=false`の場合
```tsx
null
```

## アクセシビリティ
- スピナーには`aria-label`や`role="status"`が必要（LoadingSpinner側で対応）
- 読み込み状態をスクリーンリーダーが認識できる必要がある
- オーバーレイ表示中は背景のコンテンツへのアクセスを遮断する

## 使用例

### 基本的な使用
```tsx
<LoadingOverlay isLoading={true} />
```

### カスタムメッセージ
```tsx
<LoadingOverlay isLoading={true} message="データを生成中..." />
```

### 条件付きレンダリング
```tsx
<LoadingOverlay isLoading={isGenerating} message="処理中..." />
```

## パフォーマンス要件
- `React.memo`でラップされ、不必要な再レンダリングを防ぐ
- `isLoading=false`の場合は早期リターンでDOM生成を回避

## 依存関係
- `LoadingSpinner`コンポーネント（同じファイル内で定義）
- `LOADING_MESSAGES.OVERLAY`定数（`@/lib/constants/messages`）

## 不変条件チェック
- [x] UI-001: ユーザーインターフェースの応答性を維持（オーバーレイによる操作ブロックを明示）
- [x] PERF-001: 不必要な再レンダリングを防ぐ（React.memo使用）
