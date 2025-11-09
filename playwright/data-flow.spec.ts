import { test, expect } from '@playwright/test';

test.describe('イキイキレコード デモ - E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ランディングページからダッシュボードへの遷移', async ({ page }) => {
    // ランディングページの確認
    await expect(page.getByText('イキイキレコード デモ')).toBeVisible();
    await expect(page.getByRole('link', { name: '教師ダッシュボードを見る' })).toBeVisible();
    
    // ダッシュボードへの遷移
    await page.getByRole('link', { name: '教師ダッシュボードを見る' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('データ生成フローの完全テスト', async ({ page }) => {
    // ダッシュボードに直接アクセス
    await page.goto('/dashboard');
    
    // ページタイトルの確認
    await expect(page.getByText('ダッシュボード')).toBeVisible();
    await expect(page.getByText('データ管理')).toBeVisible();
    await expect(page.getByText('初期データを生成')).toBeVisible();
    
    // データ生成ボタンのクリック
    await page.getByRole('button', { name: '初期データを生成' }).click();
    
    // ローディング状態の確認
    await expect(page.getByText('データ生成中...')).toBeVisible();
    
    // 成功通知の確認
    await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 10000 });
    
    // ローディング完了の確認
    await expect(page.getByText('データ生成中...')).toBeHidden();
  });

  test('使い方セクションの表示確認', async ({ page }) => {
    await page.goto('/dashboard');
    
    // 使い方セクションの確認
    await expect(page.getByText('使い方')).toBeVisible();
    await expect(page.getByText('「初期データを生成」ボタンをクリックしてテストデータを作成します')).toBeVisible();
    await expect(page.getByText('生成には数秒かかる場合があります')).toBeVisible();
    await expect(page.getByText('データが生成されると、統計情報がダッシュボードに表示されます')).toBeVisible();
  });

  test('ボタンの状態変化', async ({ page }) => {
    await page.goto('/dashboard');
    
    const generateButton = page.getByRole('button', { name: '初期データを生成' });
    
    // 初期状態では有効
    await expect(generateButton).toBeEnabled();
    
    // クリックして無効化を確認
    await generateButton.click();
    await expect(generateButton).toBeDisabled();
    await expect(generateButton).toHaveText('データ生成中...');
    
    // 完了後に再度有効化を確認
    await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 10000 });
    await expect(generateButton).toBeEnabled();
    await expect(generateButton).toHaveText('初期データを生成');
  });

  test('レスポンシブデザインの確認', async ({ page }) => {
    await page.goto('/dashboard');
    
    // デスクトップサイズ
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.getByText('ダッシュボード')).toBeVisible();
    
    // タブレットサイズ
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('ダッシュボード')).toBeVisible();
    
    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('ダッシュボード')).toBeVisible();
  });

  test('キーボードナビゲーション', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Tabキーでボタンにフォーカス
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: '初期データを生成' })).toBeFocused();
    
    // Enterキーで実行
    await page.keyboard.press('Enter');
    await expect(page.getByText('データ生成中...')).toBeVisible();
  });

  test('ページリロード時の状態保持', async ({ page }) => {
    await page.goto('/dashboard');
    
    // データを生成
    await page.getByRole('button', { name: '初期データを生成' }).click();
    await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 10000 });
    
    // ページをリロード
    await page.reload();
    await expect(page.getByText('ダッシュボード')).toBeVisible();
    await expect(page.getByRole('button', { name: '初期データを生成' })).toBeVisible();
  });

  test('エラーハンドリングのシミュレーション', async ({ page }) => {
    await page.goto('/dashboard');
    
    // ネットワークエラーをシミュレート
    await page.route('**/api/seed', route => route.abort());
    
    // データ生成を試行
    await page.getByRole('button', { name: '初期データを生成' }).click();
    
    // エラー通知が表示されることを確認
    await expect(page.getByText(/エラーが発生しました|ネットワーク接続を確認してください/)).toBeVisible({ timeout: 5000 });
  });
});