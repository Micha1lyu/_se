import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { TaskStore, validateTitle } from '../../server/store.js';

test('名稱會移除前後空白', () => assert.equal(validateTitle('  作業  '), '作業'));
test('空白、非文字名稱遭拒絕', () => {
  for (const value of ['', '   ', null, 3, undefined]) assert.throws(() => validateTitle(value), /請輸入/);
});
test('名稱長度邊界為 100 字元', () => {
  assert.equal(validateTitle('a'.repeat(100)).length, 100);
  assert.throws(() => validateTitle('a'.repeat(101)), /100/);
});
test('新增任務預設未完成且 ID 唯一', () => {
  const store = new TaskStore();
  assert.deepEqual(store.create('A'), { id: 1, title: 'A', completed: false });
  assert.equal(store.create('B').id, 2);
});
test('可更新名稱及完成狀態', () => {
  const store = new TaskStore(); store.create('A');
  assert.deepEqual(store.update(1, { title: ' B ', completed: true }), { id: 1, title: 'B', completed: true });
});
test('無效更新不會造成部分修改', () => {
  const store = new TaskStore(); store.create('A');
  assert.throws(() => store.update(1, { title: 'B', completed: 'true' }), /布林/);
  assert.equal(store.list()[0].title, 'A');
});
test('空更新與未知欄位遭拒絕', () => {
  const store = new TaskStore(); store.create('A');
  for (const changes of [{}, { id: 9 }, null, []]) assert.throws(() => store.update(1, changes));
});
test('刪除任務後不重複使用 ID', () => {
  const store = new TaskStore(); store.create('A'); store.delete(1);
  assert.deepEqual(store.list(), []); assert.equal(store.create('B').id, 2);
});
test('不存在的更新和刪除回傳 404 錯誤', () => {
  const store = new TaskStore();
  assert.throws(() => store.update(99, { completed: true }), { status: 404 });
  assert.throws(() => store.delete(99), { status: 404 });
});
test('讀取結果無法從外部修改內部資料', () => {
  const store = new TaskStore(); const created = store.create('A'); created.title = 'X';
  store.list()[0].title = 'Y'; assert.equal(store.list()[0].title, 'A');
});
test('檔案儲存後重新建立 Store 仍保留資料及完成狀態', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hw7-unit-'));
  try {
    const file = join(dir, 'tasks.json'); const store = new TaskStore(file);
    store.create('持久化'); store.update(1, { completed: true });
    const restored = new TaskStore(file);
    assert.deepEqual(restored.list(), [{ id: 1, title: '持久化', completed: true }]);
    assert.equal(restored.create('新任務').id, 2);
    restored.delete(1); assert.equal(new TaskStore(file).list().length, 1);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
