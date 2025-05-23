import { test, expect } from '@playwright/test';

test('データ生成から統計表示までのフロー', async ({ page }) => {
  // モックモードを有効化する環境変数を設定
  process.env.NEXT_PUBLIC_MOCK = 'true';

  // ダッシュボードページに移動
  await page.goto('/dashboard');

  // データ生成ボタンをクリック
  const generateButton = page.getByRole('button', { name: 'データを生成' });
  await generateButton.click();

  // グラフが表示されるまで待機
  await page.waitForSelector('text="月別平均感情スコア"');

  // 必要なグラフ要素が表示されていることを確認
  await expect(page.getByText('月別平均感情スコア')).toBeVisible();
  await expect(page.getByText('曜日別平均感情スコア')).toBeVisible();
  await expect(page.getByText('時間帯別平均感情スコア')).toBeVisible();

  // グラフのSVG要素が存在することを確認
  const charts = await page.locator('svg').all();
  expect(charts.length).toBeGreaterThanOrEqual(3); // 少なくとも3つのグラフ

  // 概要統計が表示されていることを確認
  await expect(page.getByText('総記録数')).toBeVisible();
  await expect(page.getByText('平均感情スコア')).toBeVisible();
});