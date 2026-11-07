import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import { createApp } from '../server/app.js';
import { TaskStore } from '../server/store.js';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= fileURLToPath(new URL('../.browsers', import.meta.url));
const { chromium, expect } = await import('@playwright/test');
const output = new URL('../docs/screenshots/', import.meta.url);
await mkdir(output, { recursive: true });
const server = createApp(new TaskStore());
let browser;
try {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, locale: 'zh-TW', reducedMotion: 'reduce' });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await expect(page.locator('#empty')).toBeVisible();
  async function capture(name) {
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: fileURLToPath(new URL(name, output)), fullPage: true, animations: 'disabled' });
    console.log(`已擷取 docs/screenshots/${name}`);
  }
  async function add(title) {
    await page.getByLabel('新增任務', { exact: true }).fill(title);
    await page.getByRole('button', { name: '＋ 新增' }).click();
    await expect(page.getByText(title, { exact: true })).toBeVisible();
    await expect(page.locator('#title')).toHaveValue('');
  }
  await capture('01-empty.png');
  await add('完成 HW7 後端單元測試');
  await add('驗證 Web API 系統測試');
  await add('執行 Playwright E2E 測試');
  await expect(page.locator('#count')).toHaveText('3 件待完成');
  await capture('02-create.png');
  await page.getByRole('checkbox', { name: '完成：完成 HW7 後端單元測試', exact: true }).check();
  await expect(page.locator('#progress-label')).toHaveText('今日進度 33%');
  await expect(page.locator('#count')).toHaveText('2 件待完成');
  await capture('03-complete.png');
  await page.getByRole('button', { name: '未完成', exact: true }).click();
  await expect(page.locator('#tasks li')).toHaveCount(2);
  await capture('04-filter-active.png');
  await page.getByRole('button', { name: '已完成', exact: true }).click();
  await expect(page.locator('#tasks li')).toHaveCount(1);
  await capture('05-filter-completed.png');
  await page.getByRole('button', { name: '全部', exact: true }).click();
  await page.getByRole('button', { name: '刪除：執行 Playwright E2E 測試', exact: true }).click();
  await expect(page.locator('#tasks li')).toHaveCount(2);
  await expect(page.locator('#progress-label')).toHaveText('今日進度 50%');
  await capture('06-delete.png');
  await page.getByLabel('新增任務', { exact: true }).fill('   ');
  await page.getByRole('button', { name: '＋ 新增' }).click();
  await expect(page.getByRole('status')).toHaveText('請輸入任務名稱');
  await expect(page.locator('#tasks li')).toHaveCount(2);
  await capture('07-validation.png');
  await page.reload();
  await expect(page.locator('#tasks li')).toHaveCount(2);
  await expect(page.getByRole('checkbox', { name: '完成：完成 HW7 後端單元測試', exact: true })).toBeChecked();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await capture('08-mobile.png');
  console.log('8 張實際操作截圖完成；所有操作狀態驗證通過。未讀寫 data/tasks.json。');
} finally {
  if (browser) await browser.close();
  const closed = new Promise(resolve => server.close(resolve));
  server.closeAllConnections();
  await closed;
}
