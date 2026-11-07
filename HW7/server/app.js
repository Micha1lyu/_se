import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { AppError, TaskStore } from './store.js';

const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']]
]);
function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}
async function body(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16384) throw new AppError('請求內容過大', 413);
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new AppError('無效的 JSON'); }
}
export function createApp(store = new TaskStore()) {
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    try {
      const path = new URL(req.url, 'http://localhost').pathname;
      if (path === '/api/health' && req.method === 'GET') return json(res, 200, { status: 'ok' });
      if (path === '/api/tasks') {
        if (req.method === 'GET') return json(res, 200, store.list());
        if (req.method === 'POST') {
          const data = await body(req);
          return json(res, 201, store.create(data?.title));
        }
        return json(res, 405, { error: '不支援的方法' });
      }
      const match = path.match(/^\/api\/tasks\/([1-9]\d*)$/);
      if (match) {
        const id = Number(match[1]);
        if (req.method === 'PATCH') return json(res, 200, store.update(id, await body(req)));
        if (req.method === 'DELETE') { store.delete(id); res.writeHead(204); return res.end(); }
        return json(res, 405, { error: '不支援的方法' });
      }
      const asset = assets.get(path);
      if (req.method === 'GET' && asset) {
        const content = await readFile(new URL(`../public/${asset[0]}`, import.meta.url));
        res.writeHead(200, { 'Content-Type': asset[1] });
        return res.end(content);
      }
      json(res, 404, { error: '找不到資源' });
    } catch (error) {
      if (!(error instanceof AppError)) console.error(error);
      json(res, error instanceof AppError ? error.status : 500,
        { error: error instanceof AppError ? error.message : '伺服器錯誤' });
    }
  });
}
