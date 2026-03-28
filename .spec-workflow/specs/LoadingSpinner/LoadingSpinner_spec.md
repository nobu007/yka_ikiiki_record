# SPEC: LoadingSpinner, LoadingOverlay, LoadingCard

## 概要
- **モジュール**: src/components/common/LoadingSpinner.tsx
- **責務**: Provides reusable loading indicator components for displaying loading states across the application
- **関連する不変条件**:
  - INV-ARCH-001: Single_Responsibility_Enforcement (components only render loading UI, no business logic)
  - INV-UI-001: Chart_Loading_State_Priority (loading states take priority)

## Exports

### 1. LoadingSpinner
A customizable loading spinner component with accessibility support.

#### 入力契約
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|------------|
| size | "sm" \| "md" \| "lg" | Optional size variant | "md" |
| color | "primary" \| "secondary" \| "white" | Optional color scheme | "primary" |
| className | string | Optional CSS classes | "" |
| label | string | Accessibility label for screen readers | LOADING_MESSAGES.DEFAULT |

#### 出力契約
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| JSX Element | JSX.Element | Renders an animated SVG spinner with ARIA attributes |

#### サイズマッピング
| size | クラス |
|------|--------|
| sm | UI_CONSTANTS.LOADING_SPINNER.SIZE.SM |
| md | UI_CONSTANTS.LOADING_SPINNER.SIZE.MD |
| lg | UI_CONSTANTS.LOADING_SPINNER.SIZE.LG |

#### カラーマッピング
| color | クラス |
|-------|--------|
| primary | UI_CONSTANTS.COLOR.PRIMARY |
| secondary | UI_CONSTANTS.COLOR.SECONDARY |
| white | UI_CONSTANTS.COLOR.WHITE |

#### アクセシビリティ
- `role="status"` on container div
- `aria-label={label}` for screen readers
- `aria-hidden="true"` on SVG (decorative)
- `<span className="sr-only">{label}</span>` for screen-only text

#### レンダリング構造
```tsx
<div role="status" aria-label={label} className="flex justify-center items-center">
  <svg className="animate-spin {size} {color}" aria-hidden="true">
    <circle className="opacity-25" />
    <path className="opacity-75" />
  </svg>
  <span className="sr-only">{label}</span>
</div>
```

### 2. LoadingOverlay
A full-screen modal overlay with centered loading spinner.

#### 入力契約
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|------------|
| isLoading | boolean | Required, controls visibility | - |
| message | string | Optional message text | LOADING_MESSAGES.OVERLAY |

#### 出力契約
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| JSX.Element \| null | JSX.Element \| null | Returns null when isLoading=false, renders overlay when true |

#### 境界値
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| isLoading=false | null | No DOM rendering |
| isLoading=true | Full overlay div | Renders modal overlay |

#### レンダリング構造 (when isLoading=true)
```tsx
<div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
  <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
    <div className="flex flex-col items-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-700 text-center">{message}</p>
    </div>
  </div>
</div>
```

### 3. LoadingCard
A card component containing a loading spinner and message.

#### 入力契約
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|------------|
| message | string | Optional message text | LOADING_MESSAGES.CARD |

#### 出力契約
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| JSX Element | JSX.Element | Always renders a card with spinner |

#### レンダリング構造
```tsx
<div className="bg-white p-6 rounded-lg shadow-md">
  <div className="flex flex-col items-center justify-center py-8">
    <LoadingSpinner size="md" />
    <p className="mt-4 text-gray-600 text-sm">{message}</p>
  </div>
</div>
```

## エラー契約
All components are error-free - no exception scenarios beyond React rendering errors.

## 共通プロパティ
- **メモ化**: All components wrapped in React.memo
- **displayName**: Set to component name for debugging
- **ダークモード**: LoadingOverlay and LoadingCard use neutral colors compatible with dark mode

## 不変条件チェック
- [x] INV-ARCH-001: Components have single responsibility (loading UI only)
- [x] INV-ARCH-001: File line count < 300 (currently 175 lines)
- [ ] INV-TEST-001: Test coverage >= 90% (to be implemented)

## 使用例

### LoadingSpinner
```tsx
// Default spinner
<LoadingSpinner />

// Small white spinner
<LoadingSpinner size="sm" color="white" />

// Large spinner with custom label
<LoadingSpinner size="lg" label="Loading your data..." />
```

### LoadingOverlay
```tsx
// Basic usage
<LoadingOverlay isLoading={true} />

// With custom message
<LoadingOverlay isLoading={true} message="Generating seed data..." />

// Conditional rendering
<LoadingOverlay isLoading={isGenerating} message="Processing..." />
```

### LoadingCard
```tsx
// Default usage
<LoadingCard />

// With custom message
<LoadingCard message="Loading statistics..." />

// In a grid or layout
<div className="grid grid-cols-2 gap-4">
  <DataCard />
  <LoadingCard message="Loading..." />
</div>
```

## アニメーション
- SVG spinner uses Tailwind's `animate-spin` utility
- Animation rotates SVG element continuously
- No custom CSS animations required

## レスポンシブデザイン
- LoadingOverlay: `max-w-sm w-full mx-4` for mobile responsiveness
- LoadingCard: Fixed padding, inherits parent width
- LoadingSpinner: Responsive sizing through Tailwind classes
