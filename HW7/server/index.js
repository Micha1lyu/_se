import { createApp } from './app.js';
import { TaskStore } from './store.js';
import { fileURLToPath } from 'node:url';
const port = Number(process.env.PORT || 3000);
const file = process.env.TASK_STORAGE === 'memory' ? null : fileURLToPath(new URL('../data/tasks.json', import.meta.url));
const server = createApp(new TaskStore(file));
server.listen(port, '127.0.0.1', () => console.log(`Taskboard: http://127.0.0.1:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
