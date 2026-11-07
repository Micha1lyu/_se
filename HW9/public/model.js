export const STORAGE_KEY = 'studyflow.hw9.v1';
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function validateTask(input) {
  const title = String(input.title ?? '').trim();
  const subject = String(input.subject ?? '').trim();
  const notes = String(input.notes ?? '').trim();
  if (!title || title.length > 100) throw new Error('任務名稱需為 1–100 個字元。');
  if (subject.length > 30 || notes.length > 500) throw new Error('科目最多 30 字，備註最多 500 字。');
  if (!['high','medium','low'].includes(input.priority)) throw new Error('請選擇有效的優先程度。');
  const due = String(input.due ?? '');
  if (due && (!/^\d{4}-\d{2}-\d{2}$/.test(due) || Number.isNaN(Date.parse(due)) || new Date(due).toISOString().slice(0,10) !== due)) throw new Error('請輸入有效的到期日。');
  return { title, subject, notes, due, priority: input.priority };
}
export function readTasks(raw) {
  const parsed = JSON.parse(raw ?? '[]');
  if (!Array.isArray(parsed)) throw new Error('儲存的資料格式有誤。');
  const ids = new Set();
  return parsed.map(item => {
    if (!item || typeof item.id !== 'string' || ids.has(item.id) || typeof item.completed !== 'boolean' || !Number.isFinite(item.createdAt)) throw new Error('儲存的任務資料有誤。');
    ids.add(item.id);
    return { ...validateTask(item), id:item.id, completed:item.completed, createdAt:item.createdAt };
  });
}
export function selectTasks(tasks, {view='all', filter='all', query='', sort='created', today=localDate()}={}) {
  const term = query.trim().toLocaleLowerCase();
  const ranks = {high:0,medium:1,low:2};
  return tasks.filter(task =>
    (view !== 'today' || task.due === today) &&
    (view !== 'completed' || task.completed) &&
    (filter !== 'active' || !task.completed) &&
    (filter !== 'completed' || task.completed) &&
    (!term || `${task.title} ${task.subject}`.toLocaleLowerCase().includes(term))
  ).sort((a,b) => {
    if (sort === 'due') return (a.due || '9999').localeCompare(b.due || '9999') || b.createdAt-a.createdAt;
    if (sort === 'priority') return ranks[a.priority]-ranks[b.priority] || b.createdAt-a.createdAt;
    return b.createdAt-a.createdAt;
  });
}
