Version: 1.0.0
Last Updated: 2026-03-30
# SPEC: ComponentCard

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
- **モジュール**: src/components/common/ComponentCard.tsx
- **責務**: A reusable card wrapper component that displays a title, optional description, and child content within a styled container
- **関連する不変条件**:
  - INV-ARCH-001: Single_Responsibility_Enforcement (component only renders layout, no business logic)
  - INV-UI-001: Chart_Loading_State_Priority (component used in dashboard layouts)

## 入力契約
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|------------|
| title | string | Required, non-empty | - |
| children | React.ReactNode | Required | - |
| className | string | Optional CSS class names | "" |
| desc | string | Optional description text | "" |

## 出力契約
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| JSX Element | JSX.Element | Renders a div with rounded-2xl border, title section, and children section |

## レンダリング構造
```tsx
<div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
  <div className="px-6 py-5">
    <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
      {title}
    </h3>
    {desc && (
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {desc}
      </p>
    )}
  </div>
  <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
    <div className="space-y-6">{children}</div>
  </div>
</div>
```

## エラー契約
| 条件 | 例外/レスポンス | HTTPステータス |
|------|----------------|---------------|
| title is undefined | Renders with empty title | N/A (React component) |
| children is undefined | Renders with empty children area | N/A (React component) |

## 境界値
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| Empty string title | Renders h3 with no text | Valid React rendering |
| Empty string desc | Does not render p element | Conditional rendering falsy |
| No className prop | Applies only default classes | "" string concatenation |
| No desc prop | Does not render description paragraph | Conditional && operator |
| Multiple children | Renders all children in space-y-6 container | React.Children behavior |

## 不変条件チェック
- [x] INV-ARCH-001: Component has single responsibility (layout only, no business logic)
- [x] INV-ARCH-001: File line count < 300 (currently 36 lines)
- [ ] INV-TEST-001: Test coverage >= 90% (to be implemented)

## メモ化
- Component is wrapped in React.memo for performance optimization
- Prevents unnecessary re-renders when props haven't changed

## ダークモード対応
- Component supports dark mode through Tailwind dark: classes
- Border colors adjust: border-gray-200 → dark:border-gray-800
- Background adjusts: bg-white → dark:bg-white/[0.03]
- Text colors adjust: text-gray-800 → dark:text-white/90, text-gray-500 → dark:text-gray-400

## アクセシビリティ
- Component uses semantic HTML (h3 for title, p for description)
- No ARIA labels required (presentational layout component)
- Headings provide document structure for screen readers

## 使用例
```tsx
// Basic usage
<ComponentCard title="Statistics">
  <p>Content here</p>
</ComponentCard>

// With description
<ComponentCard
  title="Student Records"
  desc="View and manage student emotion records"
>
  <StatsTable />
</ComponentCard>

// with custom className
<ComponentCard
  title="Analytics"
  className="mt-4"
>
  <Charts />
</ComponentCard>
```


## 10. 回帰テスト要件

- 変更時に確認すべき既存機能: (このSPECに関連する機能)
- 影響範囲: (このSPECを使用しているモジュール)
- 回帰テストケース: (変更時の挙動確認)


## 11. 既存テスト対応

| テストファイル | テスト関数 | 対応ケース |
|--------------|-----------|-----------|
