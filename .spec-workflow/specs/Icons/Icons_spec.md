# SPEC: Icons Component Library

## 概要
- **モジュール**: src/components/common/Icons.tsx
- **責務**: Provides reusable SVG icon components for consistent UI iconography across the application
- **関連する不変条件**:
  - INV-ARCH-001: Single_Responsibility_Enforcement (icons only render SVG, no business logic)
  - INV-TEST-001: Test_Coverage_Floor (90%+ coverage required)

## Exports

### 1. CheckIcon
A checkmark icon for success states and completion indicators.

#### 入力契約
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|------------|
| className | string | Optional CSS classes | "" |
| ariaHidden | boolean | Hide from screen readers | true |

#### 出力契約
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| JSX Element | JSX.Element | Renders green circle with checkmark SVG |

#### レンダリング構造
```tsx
<svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden={ariaHidden}>
  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
</svg>
```

### 2. PlusIcon
A plus icon for adding new items or expand actions.

#### 入力契約
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|------------|
| className | string | Optional CSS classes | "" |
| ariaHidden | boolean | Hide from screen readers | true |

#### 出力契約
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| JSX Element | JSX.Element | Renders plus sign in circle SVG |

#### レンダリング構造
```tsx
<svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden={ariaHidden}>
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
</svg>
```

### 3. ExclamationIcon
An exclamation mark icon for warnings and errors.

#### 入力契約
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|------------|
| className | string | Optional CSS classes | "" |
| ariaHidden | boolean | Hide from screen readers | true |

#### 出力契約
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| JSX Element | JSX.Element | Renders triangle with exclamation SVG |

#### レンダリング構造
```tsx
<svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden={ariaHidden}>
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
</svg>
```

### 4. NotificationIcon
A dynamic notification icon that displays different icons based on notification type.

#### 入力契約
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|------------|
| type | NotificationType | Required: "success" \| "error" \| "warning" \| "info" | - |
| className | string | Optional CSS classes | "" |
| ariaHidden | boolean | Hide from screen readers | true |

#### 出力契約
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| JSX Element | JSX.Element | Renders appropriate icon and color for type |

#### Notification Type Mapping
| type | Color | Icon Path |
|------|-------|-----------|
| success | text-green-500 | Green checkmark circle |
| error | text-red-500 | Red X mark circle |
| warning | text-yellow-500 | Yellow triangle |
| info | text-blue-500 | Blue circle with 'i' |

#### レンダリング構造
```tsx
<svg className={`h-5 w-5 mr-3 flex-shrink-0 ${NOTIFICATION_COLORS[type]}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden={ariaHidden}>
  <path fillRule="evenodd" d={NOTIFICATION_ICONS[type]} clipRule="evenodd" />
</svg>
```

### 5. DownloadIcon
A download icon for exporting and downloading content.

#### 入力契約
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|------------|
| className | string | Optional CSS classes | "" |
| ariaHidden | boolean | Hide from screen readers | true |

#### 出力契約
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| JSX Element | JSX.Element | Renders downward arrow with horizontal bar SVG |

#### レンダリング構造
```tsx
<svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden={ariaHidden}>
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
</svg>
```

## 共通プロパティ
- **メモ化**: All icons wrapped in React.memo for performance
- **displayName**: Set to component name for debugging
- **アクセシビリティ**: All icons support aria-hidden attribute (default: true)

## エラー契約
All components are error-free - no exception scenarios beyond React rendering errors.

## 境界値
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| className="" | Default classes only | No custom classes applied |
| ariaHidden=true | aria-hidden="true" | Hidden from screen readers |
| ariaHidden=false | No aria-hidden attribute | Visible to screen readers |
| NotificationIcon type="success" | Green checkmark | Success icon |
| NotificationIcon type="error" | Red X mark | Error icon |
| NotificationIcon type="warning" | Yellow triangle | Warning icon |
| NotificationIcon type="info" | Blue info circle | Info icon |

## 不変条件チェック
- [x] INV-ARCH-001: Components have single responsibility (render SVG only)
- [x] INV-ARCH-001: File line count < 300 (currently 222 lines)
- [x] INV-TEST-001: Test coverage >= 90% (achieved: 100% coverage, 39 tests passing)

## 使用例

### CheckIcon
```tsx
// Default usage
<CheckIcon />

// With custom size
<CheckIcon className="h-6 w-6" />

// Visible to screen readers
<CheckIcon ariaHidden={false} />
```

### PlusIcon
```tsx
// Default usage
<PlusIcon />

// With custom styling
<PlusIcon className="h-4 w-4 text-blue-500" />
```

### ExclamationIcon
```tsx
// Default usage
<ExclamationIcon />

// Custom color
<ExclamationIcon className="text-red-600" />
```

### NotificationIcon
```tsx
// Success notification
<NotificationIcon type="success" />

// Error notification
<NotificationIcon type="error" />

// Warning notification
<NotificationIcon type="warning" />

// Info notification
<NotificationIcon type="info" />

// Visible to screen readers
<NotificationIcon type="success" ariaHidden={false} />
```

### DownloadIcon
```tsx
// Default usage
<DownloadIcon />

// Custom size
<DownloadIcon className="h-6 w-6" />
```

## レスポンシブデザイン
- Icons use fixed sizing through Tailwind classes (h-4, h-5, h-6, w-4, w-5, w-6)
- Custom sizing can be applied via className prop
- Icons maintain aspect ratio with viewBox attribute

## アクセシビリティ
- All icons have aria-hidden attribute (default: true for decorative icons)
- Icons can be made visible to screen readers by setting ariaHidden={false}
- Icons are purely decorative by default and do not require aria-label when hidden
- When ariaHidden={false}, parent component should provide appropriate aria-label or aria-labelledby

## パフォーマンス
- All icons are memoized with React.memo to prevent unnecessary re-renders
- SVG rendering is lightweight compared to icon fonts or image-based icons
- No external icon library dependencies required
