import { readFileSync, mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { dirname } from 'node:path';

export class AppError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

export function validateTitle(value) {
  if (typeof value !== 'string' || !value.trim()) throw new AppError('請輸入任務名稱');
  const title = value.trim();
  if (title.length > 100) throw new AppError('任務名稱最多 100 個字元');
  return title;
}

export class TaskStore {
  constructor(file = null) {
    this.file = file;
    this.tasks = [];
    if (file) {
      try { this.tasks = JSON.parse(readFileSync(file, 'utf8')); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    this.nextId = Math.max(0, ...this.tasks.map(task => task.id)) + 1;
  }
  save() {
    if (!this.file) return;
    mkdirSync(dirname(this.file), { recursive: true });
    writeFileSync(`${this.file}.tmp`, JSON.stringify(this.tasks, null, 2));
    renameSync(`${this.file}.tmp`, this.file);
  }
  list() { return structuredClone(this.tasks); }
  create(title) {
    const task = { id: this.nextId, title: validateTitle(title), completed: false };
    this.tasks.push(task);
    this.nextId++;
    this.save();
    return { ...task };
  }
  update(id, changes) {
    const task = this.tasks.find(task => task.id === id);
    if (!task) throw new AppError('找不到任務', 404);
    if (!changes || typeof changes !== 'object' || Array.isArray(changes)) throw new AppError('更新內容必須是物件');
    const keys = Object.keys(changes);
    if (!keys.length || keys.some(key => !['title', 'completed'].includes(key))) throw new AppError('請提供 title 或 completed');
    const next = { ...task };
    if ('title' in changes) next.title = validateTitle(changes.title);
    if ('completed' in changes) {
      if (typeof changes.completed !== 'boolean') throw new AppError('completed 必須是布林值');
      next.completed = changes.completed;
    }
    Object.assign(task, next);
    this.save();
    return { ...task };
  }
  delete(id) {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index < 0) throw new AppError('找不到任務', 404);
    this.tasks.splice(index, 1);
    this.save();
  }
}
