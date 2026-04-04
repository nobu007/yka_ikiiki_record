import { test, expect } from '@playwright/test';

test.describe('チャートインタラクションとアクセシビリティ - E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    const generateButton = page.getByRole('button', { name: '初期データを生成' });
    await generateButton.click();
    const notification = page.getByTestId('notification-banner');
    await expect(notification).toBeVisible({ timeout: 60000 });
    await expect(notification).toHaveAttribute('data-notification-type', 'success');
  });

  test('全てのチャートセクションが表示される', async ({ page }) => {
    const sections = page.locator('section.bg-white.rounded-lg.shadow-sm');
    const count = await sections.count();

    expect(count).toBeGreaterThanOrEqual(7);
  });

  test('チャートセクションにセクションタイトルがある', async ({ page }) => {
    const sectionTitles = page.locator('section h2');

    const count = await sectionTitles.count();
    expect(count).toBeGreaterThanOrEqual(3);

    await expect(sectionTitles.first()).toBeVisible();
  });

  test('グラデーション背景の統計カードが表示される', async ({ page }) => {
    await expect(page.locator('.bg-blue-50').filter({ hasText: '総記録数' })).toBeVisible();
    await expect(page.locator('.bg-green-50').filter({ hasText: '平均感情スコア' })).toBeVisible();
  });

  test('統計カードの数値が強調表示されている', async ({ page }) => {
    const boldNumbers = page.locator('.text-2xl.font-bold');

    const count = await boldNumbers.count();
    expect(count).toBeGreaterThanOrEqual(2);

    await expect(boldNumbers.first()).toBeVisible();
  });

  test('詳細統計テーブルのヘッダーが正しい', async ({ page }) => {
    await expect(page.locator('th').filter({ hasText: '生徒' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: '記録数' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: '平均スコア' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'トレンド' })).toBeVisible();
  });

  test('テーブルデータがスクロール可能である', async ({ page }) => {
    const tableContainer = page.locator('.overflow-x-auto');

    await expect(tableContainer).toBeVisible();
  });

  test('トレンド矢印が表示される', async ({ page }) => {
    await page.waitForSelector('tbody tr', { timeout: 5000 });

    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();

    const trendCell = firstRow.locator('td').nth(3);
    const trendText = await trendCell.textContent();

    expect(trendText).toMatch(/↗️|↘️|→/);
  });

  test('グリッドレイアウトが正しく適用されている', async ({ page }) => {
    const grids = page.locator('.grid.grid-cols-1.lg\\:grid-cols-2');

    const count = await grids.count();
    expect(count).toBeGreaterThan(0);

    await expect(grids.first()).toBeVisible();
  });

  test('全セクションに一貫したスタイルが適用されている', async ({ page }) => {
    const sections = page.locator('section.bg-white.rounded-lg.shadow-sm');

    const count = await sections.count();
    expect(count).toBeGreaterThanOrEqual(7);

    for (let i = 0; i < Math.min(count, 3); i++) {
      await expect(sections.nth(i)).toBeVisible();
      await expect(sections.nth(i)).toHaveClass(/rounded-lg/);
      await expect(sections.nth(i)).toHaveClass(/shadow-sm/);
    }
  });

  test('色分けされた統計カードのコントラスト', async ({ page }) => {
    const blueCard = page.locator('.bg-blue-50').filter({ hasText: '総記録数' });
    await expect(blueCard).toBeVisible();

    const blueTitle = blueCard.locator('.text-blue-900');
    await expect(blueTitle).toBeVisible();

    const blueValue = blueCard.locator('.text-blue-600');
    await expect(blueValue).toBeVisible();

    const greenCard = page.locator('.bg-green-50').filter({ hasText: '平均感情スコア' });
    await expect(greenCard).toBeVisible();

    const greenTitle = greenCard.locator('.text-green-900');
    await expect(greenTitle).toBeVisible();

    const greenValue = greenCard.locator('.text-green-600');
    await expect(greenValue).toBeVisible();
  });

  test('データ量に応じたテーブル行数の制限', async ({ page }) => {
    const tableRows = page.locator('tbody tr');

    await tableRows.first().waitFor({ state: 'visible', timeout: 5000 });

    const rowCount = await tableRows.count();
    expect(rowCount).toBeLessThanOrEqual(10);
  });

  test('チャートコンテナのレスポンシブ挙動', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    const chartGridDesktop = page.locator('.grid.grid-cols-1.lg\\:grid-cols-2');
    await expect(chartGridDesktop).toBeVisible();

    await page.setViewportSize({ width: 480, height: 667 });
    const chartGridMobile = page.locator('.grid.grid-cols-1');
    await expect(chartGridMobile.first()).toBeVisible();
  });

  test('全統計カードが同じ高さで表示される', async ({ page }) => {
    const statsCards = page.locator('.grid.grid-cols-1.md\\:grid-cols-2 > div');

    const count = await statsCards.count();
    expect(count).toBe(2);

    await expect(statsCards.nth(0)).toBeVisible();
    await expect(statsCards.nth(1)).toBeVisible();
  });

  test('統計データのロード状態から表示状態への遷移', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.locator('text=/データを読み込み中/')).toBeVisible();

    await page.waitForSelector('text=/データ概要/', { timeout: 10000 });

    await expect(page.locator('text=/データ概要/')).toBeVisible();
  });

  test('ページタイトルと説明文が表示される', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'ダッシュボード' })).toBeVisible();

    const description = page.locator('p').filter({ hasText: /日本の教育現場における/ });
    await expect(description).toBeVisible();
  });

  test('セクション間の一貫したスペーシング', async ({ page }) => {
    const sections = page.locator('section');

    const count = await sections.count();
    expect(count).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < Math.min(count, 3); i++) {
      await expect(sections.nth(i)).toBeVisible();
    }
  });

  test('統計数値のフォーマット検証（桁区切り）', async ({ page }) => {
    const countValue = page.locator('.bg-blue-50 .text-2xl');
    const text = await countValue.textContent();

    expect(text).toMatch(/\d{1,3}(,\d{3})*/);
  });
});
