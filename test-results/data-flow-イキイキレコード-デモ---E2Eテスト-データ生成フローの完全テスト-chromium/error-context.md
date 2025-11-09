# Test info

- Name: イキイキレコード デモ - E2Eテスト >> データ生成フローの完全テスト
- Location: /home/jinno/yka_ikiiki_record/playwright/data-flow.spec.ts:18:7

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

    at /home/jinno/yka_ikiiki_record/playwright/data-flow.spec.ts:5:16
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('イキイキレコード デモ - E2Eテスト', () => {
   4 |   test.beforeEach(async ({ page }) => {
>  5 |     await page.goto('/');
     |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
   6 |   });
   7 |
   8 |   test('ランディングページからダッシュボードへの遷移', async ({ page }) => {
   9 |     // ランディングページの確認
   10 |     await expect(page.getByText('イキイキレコード デモ')).toBeVisible();
   11 |     await expect(page.getByRole('link', { name: '教師ダッシュボードを見る' })).toBeVisible();
   12 |     
   13 |     // ダッシュボードへの遷移
   14 |     await page.getByRole('link', { name: '教師ダッシュボードを見る' }).click();
   15 |     await expect(page).toHaveURL('/dashboard');
   16 |   });
   17 |
   18 |   test('データ生成フローの完全テスト', async ({ page }) => {
   19 |     // ダッシュボードに直接アクセス
   20 |     await page.goto('/dashboard');
   21 |     
   22 |     // ページタイトルの確認
   23 |     await expect(page.getByText('ダッシュボード')).toBeVisible();
   24 |     await expect(page.getByText('データ管理')).toBeVisible();
   25 |     await expect(page.getByText('初期データを生成')).toBeVisible();
   26 |     
   27 |     // データ生成ボタンのクリック
   28 |     await page.getByRole('button', { name: '初期データを生成' }).click();
   29 |     
   30 |     // ローディング状態の確認
   31 |     await expect(page.getByText('データ生成中...')).toBeVisible();
   32 |     
   33 |     // 成功通知の確認
   34 |     await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 10000 });
   35 |     
   36 |     // ローディング完了の確認
   37 |     await expect(page.getByText('データ生成中...')).toBeHidden();
   38 |   });
   39 |
   40 |   test('使い方セクションの表示確認', async ({ page }) => {
   41 |     await page.goto('/dashboard');
   42 |     
   43 |     // 使い方セクションの確認
   44 |     await expect(page.getByText('使い方')).toBeVisible();
   45 |     await expect(page.getByText('「初期データを生成」ボタンをクリックしてテストデータを作成します')).toBeVisible();
   46 |     await expect(page.getByText('生成には数秒かかる場合があります')).toBeVisible();
   47 |     await expect(page.getByText('データが生成されると、統計情報がダッシュボードに表示されます')).toBeVisible();
   48 |   });
   49 |
   50 |   test('ボタンの状態変化', async ({ page }) => {
   51 |     await page.goto('/dashboard');
   52 |     
   53 |     const generateButton = page.getByRole('button', { name: '初期データを生成' });
   54 |     
   55 |     // 初期状態では有効
   56 |     await expect(generateButton).toBeEnabled();
   57 |     
   58 |     // クリックして無効化を確認
   59 |     await generateButton.click();
   60 |     await expect(generateButton).toBeDisabled();
   61 |     await expect(generateButton).toHaveText('データ生成中...');
   62 |     
   63 |     // 完了後に再度有効化を確認
   64 |     await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 10000 });
   65 |     await expect(generateButton).toBeEnabled();
   66 |     await expect(generateButton).toHaveText('初期データを生成');
   67 |   });
   68 |
   69 |   test('レスポンシブデザインの確認', async ({ page }) => {
   70 |     await page.goto('/dashboard');
   71 |     
   72 |     // デスクトップサイズ
   73 |     await page.setViewportSize({ width: 1200, height: 800 });
   74 |     await expect(page.getByText('ダッシュボード')).toBeVisible();
   75 |     
   76 |     // タブレットサイズ
   77 |     await page.setViewportSize({ width: 768, height: 1024 });
   78 |     await expect(page.getByText('ダッシュボード')).toBeVisible();
   79 |     
   80 |     // モバイルサイズ
   81 |     await page.setViewportSize({ width: 375, height: 667 });
   82 |     await expect(page.getByText('ダッシュボード')).toBeVisible();
   83 |   });
   84 |
   85 |   test('キーボードナビゲーション', async ({ page }) => {
   86 |     await page.goto('/dashboard');
   87 |     
   88 |     // Tabキーでボタンにフォーカス
   89 |     await page.keyboard.press('Tab');
   90 |     await expect(page.getByRole('button', { name: '初期データを生成' })).toBeFocused();
   91 |     
   92 |     // Enterキーで実行
   93 |     await page.keyboard.press('Enter');
   94 |     await expect(page.getByText('データ生成中...')).toBeVisible();
   95 |   });
   96 |
   97 |   test('ページリロード時の状態保持', async ({ page }) => {
   98 |     await page.goto('/dashboard');
   99 |     
  100 |     // データを生成
  101 |     await page.getByRole('button', { name: '初期データを生成' }).click();
  102 |     await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 10000 });
  103 |     
  104 |     // ページをリロード
  105 |     await page.reload();
```