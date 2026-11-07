let tasks = [];
let filter = 'all';
const list = document.querySelector('#tasks');
const message = document.querySelector('#message');
async function api(path = '', options = {}) {
  const response = await fetch(`/api/tasks${path}`, { ...options, headers: { 'Content-Type': 'application/json' } });
  if (!response.ok) throw new Error((await response.json()).error);
  return response.status === 204 ? null : response.json();
}
function render() {
  list.replaceChildren();
  const visible = tasks.filter(t => filter === 'all' || t.completed === (filter === 'completed'));
  for (const task of visible) {
    const row = document.createElement('li');
    row.classList.toggle('done', task.completed);
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox'; checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `完成：${task.title}`);
    checkbox.addEventListener('change', async () => {
      checkbox.disabled = true;
      try { await api(`/${task.id}`, { method: 'PATCH', body: JSON.stringify({ completed: checkbox.checked }) }); await refresh(); }
      catch (error) { message.textContent = error.message; checkbox.checked = task.completed; checkbox.disabled = false; }
    });
    const title = document.createElement('span'); title.className = 'task-title'; title.textContent = task.title;
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'delete'; remove.textContent = '刪除'; remove.setAttribute('aria-label', `刪除：${task.title}`);
    remove.addEventListener('click', async () => {
      remove.disabled = true;
      try { await api(`/${task.id}`, { method: 'DELETE' }); await refresh(); }
      catch (error) { message.textContent = error.message; remove.disabled = false; }
    });
    row.append(checkbox, title, remove); list.append(row);
  }
  document.querySelector('#empty').hidden = visible.length > 0;
  const done = tasks.filter(t => t.completed).length;
  document.querySelector('#count').textContent = `${tasks.length - done} 件待完成`;
  const percent = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  document.querySelector('#progress-label').textContent = `今日進度 ${percent}%`;
  document.querySelector('#progress-bar').style.width = `${percent}%`;
}
async function refresh() { tasks = await api(); render(); }
document.querySelector('#task-form').addEventListener('submit', async event => {
  event.preventDefault();
  const input = document.querySelector('#title');
  if (!input.value.trim()) { message.textContent = '請輸入任務名稱'; return; }
  const button = event.submitter; button.disabled = true;
  try { await api('', { method: 'POST', body: JSON.stringify({ title: input.value }) }); input.value = ''; await refresh(); message.textContent = '已新增任務'; input.focus(); }
  catch (error) { message.textContent = error.message; }
  finally { button.disabled = false; }
});
for (const button of document.querySelectorAll('[data-filter]')) button.addEventListener('click', () => {
  filter = button.dataset.filter;
  for (const tab of document.querySelectorAll('[data-filter]')) tab.setAttribute('aria-pressed', String(tab === button));
  render();
});
refresh().catch(error => { message.textContent = `無法載入任務：${error.message}`; });
