import { once } from 'node:events';
import { createApp } from '../../server/app.js';
import { TaskStore } from '../../server/store.js';

// 在 Playwright runner 中管理真正的 HTTP server，避免 Windows shell
// 子程序樹的關閉差異。瀏覽器仍透過 TCP/HTTP 存取完整前後端，沒有 mock。
export default async function setup() {
  const server = createApp(new TaskStore());
  server.listen(3108, '127.0.0.1');
  await once(server, 'listening');
  return async () => {
    const closed = new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    server.closeAllConnections();
    await closed;
  };
}
