import { test, expect } from '@playwright/test';

test.describe('統計データ表示 - E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('データ生成後に統計概要が表示される', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: '初期データを生成' });
    await generateButton.click();

    await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 30000 });

    await expect(page.getByText('データ概要')).toBeVisible();
    await expect(page.getByText('総記録数')).toBeVisible();
    await expect(page.getByText('平均感情スコア')).toBeVisible();
  });

  test('統計数値が正しく表示される', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: '初期データを生成' });
    await generateButton.click();

    await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 30000 });

    const countElement = page.locator('.bg-blue-50').filter({ hasText: '総記録数' });
    await expect(countElement).toBeVisible();

    const countValue = await countElement.locator('.text-2xl').textContent();
    expect(countValue).not.toBeNull();
    const numericCount = parseInt(countValue?.replace(/,/g, '') || '0');
    expect(numericCount).toBeGreaterThan(0);

    const avgElement = page.locator('.bg-green-50').filter({ hasText: '平均感情スコア' });
    await expect(avgElement).toBeVisible();
    const avgValue = await avgElement.locator('.text-2xl').textContent();
    expect(avgValue).not.toBeNull();
    expect(parseFloat(avgValue || '0')).toBeGreaterThanOrEqual(0);
    expect(parseFloat(avgValue || '0')).toBeLessThanOrEqual(100);
  });

  test('月別感情チャートが表示される', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: '初期データを生成' });
    await generateButton.click();

    await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 30000 });

    await expect(page.locator('text=/月別/i')).toBeVisible({ timeout: 5000 });
  });

  test('曜日別チャートが表示される', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: '初期データを生成' });
    await generateButton.click();

    await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 30000 });

    await expect(page.locator('text=/曜日/i')).toBeVisible({ timeout: 5000 });
  });

  test('感情分布チャートが表示される', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: '初期データを生成' });
    await generateButton.click();

    await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 30000 });

    await expect(page.locator('text=/分布/i')).toBeVisible({ timeout: 5000 });
  });

  test('時間帯別チャートが表示される', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: '初期データを生成' });
    await generateButton.click();

    await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 30000 });

    await expect(page.locator('text=/時間帯/i')).toBeVisible({ timeout: 5000 });
  });

  test('生徒別感情チャートが表示される', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: '初期データを生成' });
    await generateButton.click();

    await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 30000 });

    await expect(page.locator('text=/生徒/i')).toBeVisible({ timeout: 5000 });
  });

  test('トレンドチャートが表示される', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: '初期データを生成' });
    await generateButton.click();

    await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 30000 });

    await expect(page.locator('text=/トレンド/i')).toBeVisible({ timeout: 5000 });
  });

  test('詳細統計テーブルが表示される', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: '初期データを生成' });
    await generateButton.click();

    await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 30000 });

    await expect(page.getByText('詳細統計')).toBeVisible();

    await expect(page.locator('th').filter({ hasText: '生徒' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: '記録数' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: '平均スコア' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'トレンド' })).toBeVisible();
  });

  test('詳細統計テーブルのデータが正しく表示される', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: '初期データを生成' });
    await generateButton.click();

    await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 30000 });

    const tableRows = page.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible();

    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
    expect(rowCount).toBeLessThanOrEqual(10);
  });

  test('データ生成前は空状態が表示される', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText('データがありません')).toBeVisible();
    await expect(page.getByText('上のボタンをクリックしてテストデータを生成してください')).toBeVisible();
  });

  test('全チャートがグリッドレイアウトで表示される', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: '初期データを生成' });
    await generateButton.click();

    await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 30000 });

    const chartSections = page.locator('section.bg-white.rounded-lg').filter({ hasText: /^$/ });
    const sectionCount = await chartSections.count();
    expect(sectionCount).toBeGreaterThanOrEqual(6);
  });

  test('レスポンシブ: モバイルで統計が縦積み表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const generateButton = page.getByRole('button', { name: '初期データを生成' });
    await generateButton.click();

    await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 30000 });

    await expect(page.getByText('データ概要')).toBeVisible();

    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2');
    await expect(statsGrid).toBeVisible();
  });

  test('統計データの更新後に再読み込みが機能する', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: '初期データを生成' });
    await generateButton.click();

    await expect(page.getByText('テストデータの生成が完了しました')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('データ概要')).toBeVisible();

    await page.reload();

    await expect(page.getByText('データ概要')).toBeVisible({ timeout: 5000 });
  });
});
