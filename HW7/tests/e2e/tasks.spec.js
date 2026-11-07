import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request, page }) => {
  // 只用 API 清理測試資料；功能驗證均經由瀏覽器 UI 操作。
  const tasks = await (await request.get('/api/tasks')).json();
  for (const task of tasks) await request.delete(`/api/tasks/${task.id}`);
  await page.goto('/');
  await expect(page.locator('#count')).toHaveText('0 件待完成');
});
async function add(page, title) {
  await page.getByLabel('新增任務', { exact: true }).fill(title);
  await page.getByRole('button', { name: '＋ 新增' }).click();
  await expect(page.getByRole('status')).toHaveText('已新增任務');
  await expect(page.locator('.task-title').filter({ hasText: title })).toHaveCount(1);
}
test('初次進入顯示空狀態', async ({ page }) => {
  await expect(page.getByRole('heading', { name: '今日待辦' })).toBeVisible();
  await expect(page.locator('#empty')).toBeVisible();
});
test('新增任務後重新整理仍存在', async ({ page }) => {
  await add(page, '完成 HW7'); await page.reload();
  await expect(page.locator('.task-title')).toHaveText('完成 HW7');
  await expect(page.locator('#count')).toHaveText('1 件待完成');
});
test('勾選、篩選與取消完成', async ({ page }, testInfo) => {
  await add(page, '完成測試'); await add(page, '整理文件');
  await page.getByRole('checkbox', { name: '完成：完成測試', exact: true }).check();
  await expect(page.locator('#progress-label')).toHaveText('今日進度 50%');
  await page.screenshot({ path: testInfo.outputPath('taskboard.png'), fullPage: true });
  await page.getByRole('button', { name: '已完成', exact: true }).click();
  await expect(page.locator('.task-title')).toHaveText(['完成測試']);
  await page.getByRole('button', { name: '未完成', exact: true }).click();
  await expect(page.locator('.task-title')).toHaveText(['整理文件']);
  await page.getByRole('button', { name: '全部', exact: true }).click();
  await page.getByRole('checkbox', { name: '完成：完成測試', exact: true }).uncheck();
  await expect(page.locator('#count')).toHaveText('2 件待完成');
  await expect(page.locator('#progress-label')).toHaveText('今日進度 0%');
});
test('刪除任務並回到空狀態', async ({ page }) => {
  await add(page, '刪除我'); await page.getByRole('button', { name: '刪除：刪除我' }).click();
  await expect(page.locator('#tasks li')).toHaveCount(0);
  await expect(page.locator('#empty')).toBeVisible();
  await page.reload(); await expect(page.locator('#tasks li')).toHaveCount(0);
});
test('只有空白的名稱不會被送出', async ({ page }) => {
  await page.getByLabel('新增任務', { exact: true }).fill('   ');
  await page.getByRole('button', { name: '＋ 新增' }).click();
  await expect(page.getByRole('status')).toHaveText('請輸入任務名稱');
  await expect(page.locator('#tasks li')).toHaveCount(0);
});
test('HTML 字串以純文字顯示，防止 XSS', async ({ page }) => {
  await add(page, '<img src=x onerror=alert(1)>');
  await expect(page.locator('#tasks img')).toHaveCount(0);
});
test('手機寬度可新增任務且沒有水平溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await add(page, '手機上的任務');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
