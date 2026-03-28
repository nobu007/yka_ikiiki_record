# SPEC: PageBreadcrumb

## 概要
- **モジュール**: src/components/common/PageBreadCrumb.tsx
- **責務**: ページタイトルとパンくずリストを表示する
- **関連する不変条件**:
  - INV-ARCH-001: Single_Responsibility_Enforcement

## 入力契約

| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| pageTitle | string | 必須、空文字列可能 | - |

## 出力契約

| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| JSX.Element | React.FC | nullを返さない、常に有効なJSXを返す |

## 境界値

| 入力 | 期待出力 | 備考 |
|------|---------|------|
| pageTitle="Test Page" | h2に"Test Page"、パンくずの最後の項目が"Test Page" | - |
| pageTitle="" | h2に""、パンくずの最後の項目が"" | 空文字列も許容 |
| pageTitle="日本語タイトル" | 日本語が正しく表示される | - |

## 不変条件チェック

- [ ] INV-ARCH-001: ファイル行数が300行以下である（現在65行）
- [ ] React.memoによる最適化: pageTitleが変更された場合のみ再レンダリング
- [ ] useMemoによる最適化: breadcrumbItemsはpageTitle依存でのみ再計算
- [ ] パンくずリストは常に2項目: [HOME, pageTitle]
- [ ] 最後の項目（現在のページ）はリンクなしでspan要素

## 副作用

なし（純粋な表示コンポーネント）

## アクセシビリティ

1. **nav要素**: パンくずナビゲーションをnav要素でマークアップ
2. **ol要素**: 順序付きリストでパンくず項目を構造化
3. **セパレーター**: SVGアイコンで項目間の区切りを視覚的に表現
4. **現在のページ**: 最後の項目はspan要素（リンクなし）で現在位置を示す

## パフォーマンス要件

1. **React.memo**: pageTitle propが変更された場合のみ再レンダリング
2. **useMemo**: breadcrumbItems配列はpageTitle依存でのみ再計算

## スタイリング

1. **レスポンシブ**: flex-wrapで小さい画面に対応
2. **ダークモード**: dark:クラスでダークモード対応
3. **gap設定**: items-center justify-between gap-3で適切な間隔

## ルーティング

1. **Homeリンク**: 最初の項目は常に"/"へのリンク
2. **Next.js Link**: next/linkのLinkコンポーネントを使用
