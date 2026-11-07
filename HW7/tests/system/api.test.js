import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { request as httpRequest } from 'node:http';
import { createApp } from '../../server/app.js';

// 每個案例啟動獨立 HTTP server，使用作業系統分配的 port，無 mock。
async function withServer(run) {
  const server = createApp(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (path, method = 'GET', payload) => fetch(`${base}${path}`, {
    method, headers: { 'Content-Type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload)
  });
  try { await run(request, base); }
  finally { await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
}

test('GET /api/health 回應 200', () => withServer(async request => {
  const response = await request('/api/health'); assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
}));
test('GET /api/tasks 初始為空清單', () => withServer(async request => {
  const response = await request('/api/tasks'); assert.equal(response.status, 200); assert.deepEqual(await response.json(), []);
}));
test('完整 API 流程：新增 → 查詢 → 修改 → 刪除', () => withServer(async request => {
  const created = await request('/api/tasks', 'POST', { title: ' API 作業 ' }); assert.equal(created.status, 201);
  const task = await created.json(); assert.deepEqual(task, { id: 1, title: 'API 作業', completed: false });
  assert.deepEqual(await (await request('/api/tasks')).json(), [task]);
  const updated = await request('/api/tasks/1', 'PATCH', { completed: true, title: '已完成' });
  assert.equal(updated.status, 200); assert.deepEqual(await updated.json(), { id: 1, title: '已完成', completed: true });
  const deleted = await request('/api/tasks/1', 'DELETE'); assert.equal(deleted.status, 204); assert.equal(await deleted.text(), '');
  assert.deepEqual(await (await request('/api/tasks')).json(), []);
}));
test('POST 非法名稱回應 400 且不新增資料', () => withServer(async request => {
  for (const title of ['', '  ', 42, 'a'.repeat(101)]) {
    const response = await request('/api/tasks', 'POST', { title }); assert.equal(response.status, 400); assert.ok((await response.json()).error);
  }
  assert.deepEqual(await (await request('/api/tasks')).json(), []);
}));
test('無效 JSON 回應 400', () => withServer(async (_, base) => {
  const response = await fetch(`${base}/api/tasks`, { method: 'POST', body: '{broken' }); assert.equal(response.status, 400);
}));
test('分段傳送的 UTF-8 中文請求保持完整', () => withServer(async (_, base) => {
  const bytes = Buffer.from(JSON.stringify({ title: '中文任務' }));
  const split = bytes.indexOf(Buffer.from('中')) + 1;
  const result = await new Promise((resolve, reject) => {
    const req = httpRequest(`${base}/api/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
      const chunks = []; res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(Buffer.concat(chunks).toString()) }));
    });
    req.on('error', reject); req.write(bytes.subarray(0, split));
    setTimeout(() => req.end(bytes.subarray(split)), 10);
  });
  assert.equal(result.status, 201); assert.equal(result.data.title, '中文任務');
}));
test('JSON null 回應 400', () => withServer(async request => {
  assert.equal((await request('/api/tasks', 'POST', null)).status, 400);
}));
test('PATCH 非布林狀態、未知欄位、空物件皆回應 400', () => withServer(async request => {
  await request('/api/tasks', 'POST', { title: 'A' });
  for (const change of [{ completed: 'true' }, { unknown: 1 }, {}, { title: '' }])
    assert.equal((await request('/api/tasks/1', 'PATCH', change)).status, 400);
  assert.deepEqual(await (await request('/api/tasks')).json(), [{ id: 1, title: 'A', completed: false }]);
}));
test('不存在的任務回應 404', () => withServer(async request => {
  assert.equal((await request('/api/tasks/99', 'PATCH', { completed: true })).status, 404);
  assert.equal((await request('/api/tasks/99', 'DELETE')).status, 404);
}));
test('未知路徑與不支援方法有明確狀態碼', () => withServer(async request => {
  assert.equal((await request('/api/missing')).status, 404);
  assert.equal((await request('/api/tasks', 'PUT', {})).status, 405);
  assert.equal((await request('/api/tasks/1', 'POST', {})).status, 405);
}));
test('過大請求回應 413', () => withServer(async request => {
  assert.equal((await request('/api/tasks', 'POST', { title: 'x'.repeat(20000) })).status, 413);
}));
test('前端 HTML、JS、CSS 均可由 server 正常提供', () => withServer(async request => {
  for (const [path, type] of [['/', 'text/html'], ['/app.js', 'text/javascript'], ['/style.css', 'text/css']]) {
    const response = await request(path); assert.equal(response.status, 200);
    assert.ok(response.headers.get('content-type').includes(type)); assert.ok((await response.text()).length > 0);
  }
}));
