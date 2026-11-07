import {STORAGE_KEY, localDate, validateTask, readTasks, selectTasks} from './model.js';
const $ = selector => document.querySelector(selector);
let tasks = [], view='all', filter='all', editingId=null, storageReadable=true, toastTimer;
const dialog=$('#task-dialog'), form=$('#task-form');
function notify(message) { $('#toast').textContent=message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4500); }
try { tasks=readTasks(localStorage.getItem(STORAGE_KEY)); } catch { storageReadable=false; notify('無法讀取原有資料，請先備份瀏覽器資料。為避免覆寫，暫停儲存。'); }
function commit(next, message) {
  if(!storageReadable) { notify('原有資料無法讀取，尚未儲存變更。'); return false; }
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(next)); } catch { notify('無法儲存，請確認瀏覽器允許網站儲存資料。'); return false; }
  tasks=next; render(); notify(message); return true;
}
function element(tag,className,text) { const el=document.createElement(tag); if(className)el.className=className; if(text!==undefined)el.textContent=text; return el; }
function render() {
  const today=localDate();
  $('#today-date').textContent=new Intl.DateTimeFormat('zh-TW',{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(new Date());
  const completed=tasks.filter(t=>t.completed).length, percentage=tasks.length?Math.round(completed/tasks.length*100):0;
  $('#nav-total').textContent=tasks.length;
  $('#active-count').textContent=tasks.length-completed;
  $('#overdue-count').textContent=tasks.filter(t=>!t.completed&&t.due&&t.due<today).length;
  $('#progress-number').textContent=percentage;
  $('#progress-ring').style.background=`conic-gradient(#c7e99a ${percentage}%,#3e6b58 0)`;
  $('#progress-caption').textContent=tasks.length?`已完成 ${completed} / ${tasks.length} 件任務，繼續保持你的節奏。`:'準備好開始第一個任務了嗎？';
  const titles={all:'所有任務',today:'今日到期',completed:'已完成'};
  $('#breadcrumb').textContent=titles[view]; $('#list-heading').firstChild.textContent=titles[view]+' ';
  $('#page-title').textContent=view==='all'?'把學習，整理成日常。':view==='today'?'留一點專注，給今天。':'每一步努力，都算數。';
  document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('selected',b.dataset.filter===filter);b.setAttribute('aria-pressed',String(b.dataset.filter===filter));});
  const visible=selectTasks(tasks,{view,filter,query:$('#search').value,sort:$('#sort').value,today});
  $('#visible-count').textContent=visible.length; $('#list-summary').textContent=`顯示 ${visible.length} 件 · 共 ${tasks.length} 件任務`;
  $('#task-list').replaceChildren(...visible.map(task=>{
    const row=element('li',`task-row${task.completed?' done':''}`),main=element('div','task-main');
    const check=element('input','task-check'); check.type='checkbox';check.checked=task.completed;check.setAttribute('aria-label',`完成：${task.title}`);
    check.addEventListener('change',()=>{if(!commit(tasks.map(t=>t.id===task.id?{...t,completed:check.checked}:t),check.checked?'又完成了一件，做得很好！':'已恢復為待完成'))check.checked=task.completed;});
    const copy=element('div','task-copy');copy.append(element('p','task-name',task.title));
    if(task.subject)copy.append(element('span','task-subject',task.subject));
    if(task.notes)copy.append(element('p','task-notes',task.notes));
    main.append(check,copy);
    const overdue=!task.completed&&task.due&&task.due<today;
    const due=element('span',`task-date${overdue?' overdue':''}`,task.due?`${task.due.slice(5).replace('-',' / ')}${overdue?' · 已逾期':task.due===today?' · 今天':''}`:'未設期限');if(task.due)due.title=task.due;
    const priority=element('span',`priority ${task.priority}`,{high:'高優先',medium:'中優先',low:'低優先'}[task.priority]);
    const actions=element('div','row-actions'),edit=element('button','icon-button','✎'),remove=element('button','icon-button','×');
    edit.setAttribute('aria-label',`編輯：${task.title}`);edit.title='編輯任務';edit.onclick=()=>openForm(task);
    remove.setAttribute('aria-label',`刪除：${task.title}`);remove.title='刪除任務';remove.onclick=()=>{if(confirm(`確定刪除「${task.title}」？`))commit(tasks.filter(t=>t.id!==task.id),'已刪除任務');};
    actions.append(edit,remove);row.append(main,due,priority,actions);return row;
  }));
  $('#empty-state').hidden=visible.length>0;
  $('#empty-state h3').textContent=tasks.length?'這裡暫時沒有符合的任務。':'為下一個目標，留個位置。';
  $('#empty-state p').textContent=tasks.length?'試試其他篩選條件，或新增一件任務。':'新增第一件學習任務，從小小的一步開始。';
  $('#empty-add').textContent=tasks.length?'＋ 新增任務':'＋ 新增第一件任務';
  $('#load-demo').hidden=tasks.length>0;
}
function openForm(task=null) {
  editingId=task?.id??null;form.reset();$('#form-error').textContent='';
  $('#dialog-title').textContent=task?'編輯學習任務':'新增學習任務';
  if(task)for(const field of ['title','subject','due','priority','notes'])form.elements[field].value=task[field];
  dialog.showModal();$('#task-title').focus();
}
form.addEventListener('submit',event=>{
  event.preventDefault();let data;
  try{data=validateTask(Object.fromEntries(new FormData(form)));}catch(error){$('#form-error').textContent=error.message;return;}
  const next=editingId?tasks.map(t=>t.id===editingId?{...t,...data}:t):[...tasks,{...data,id:crypto.randomUUID(),completed:false,createdAt:Date.now()}];
  if(commit(next,editingId?'已更新任務':'已新增任務，開始你的小小進步！'))dialog.close();
});
$('#new-task').onclick=()=>openForm();$('#empty-add').onclick=()=>openForm();
$('#close-dialog').onclick=()=>dialog.close();$('#cancel-dialog').onclick=()=>dialog.close();
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;filter='all';render();});
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;render();});
$('#search').addEventListener('input',render);$('#sort').addEventListener('change',render);
$('#load-demo').onclick=()=>{
  if(tasks.length)return;
  const now=Date.now(),today=localDate(),tomorrow=localDate(new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()+1));
  commit([
    {title:'完成第九次作業：部署網站',subject:'現代軟體工程',due:today,priority:'high',notes:'確認 Cloudflare 網址可以正常開啟。',completed:false},
    {title:'整理本週課堂筆記',subject:'資料結構',due:tomorrow,priority:'medium',notes:'複習樹與圖的走訪方式。',completed:false},
    {title:'閱讀英文文章 20 分鐘',subject:'自主學習',due:today,priority:'low',notes:'',completed:true}
  ].map((t,i)=>({...t,id:crypto.randomUUID(),createdAt:now-i})),'已載入 3 件範例任務，可自由編輯或刪除');
};
window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY||event.key===null){try{tasks=readTasks(localStorage.getItem(STORAGE_KEY));storageReadable=true;render();}catch{storageReadable=false;notify('其他分頁的資料無法讀取，已暫停儲存。');}}});
window.addEventListener('focus',render);
render();
