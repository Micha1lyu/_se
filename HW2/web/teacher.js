let teacherCourseId='', teacherRoster=[], teacherRequest=0;
const teacherTitles={home:'教學總覽',teaching:'我的授課',roster:'修課學生',grading:'成績登錄',courses:'授課課表',profile:'教師資料',announcements:'校園公告'};
function renderRoleLogin(role='student') {
  const teacher=role==='teacher';
  app.innerHTML=`<main class="login-layout"><section class="login-story"><a class="brand" href="./"><span class="seal">金</span><span>金門・校園入口<small>CAMPUS INFORMATION SYSTEM</small></span></a><div><p class="eyebrow light">${teacher?'INSPIRE. TEACH. CONNECT.':'YOUR CAMPUS, CONNECTED.'}</p><h1>${teacher?'讓教學的每一步，<br>都更從容。':'島嶼上的日常，<br>從這裡開始。'}</h1><p>${teacher?'授課、學生名單與成績登錄，<br>專屬教師的校務工作空間。':'課程、成績與校園大小事，<br>在一個地方，輕鬆掌握。'}</p></div><footer>大學校務系統設計 · GitHub Pages 教學展示</footer><div class="island-art" aria-hidden="true"><span>◒</span><i></i><b></b></div></section><section class="login-form"><div class="login-box"><span class="pill">${teacher?'FACULTY':'STUDENT'} PORTAL</span><h2>${teacher?'歡迎回來，老師':'歡迎回到校園'}</h2><p class="muted">${teacher?'登入教師校務系統，管理你的教學日常。':'登入學生校務系統，開啟你的學習日常。'}</p><form id="login"><label for="login-role">登入身分</label><select id="login-role" name="role" class="full"><option value="student" ${!teacher?'selected':''}>學生專區</option><option value="teacher" ${teacher?'selected':''}>教師專區</option></select><label for="student-id">${teacher?'教師帳號':'學號'}</label><input id="student-id" name="id" autocomplete="username" placeholder="${teacher?'請輸入教師帳號':'請輸入學號'}" required maxlength="30"><label for="password">密碼</label><input id="password" name="password" type="password" autocomplete="current-password" placeholder="請輸入密碼" required maxlength="128"><p id="login-error" class="form-error" role="alert"></p><button class="button primary full" type="submit">登入${teacher?'教師':'學生'}系統 <span>→</span></button></form><div class="demo-box"><strong>${teacher?'教師':'學生'}示範帳號</strong><p>帳號 <code>${teacher?'t001':'s113001'}</code>　密碼 <code>${teacher?'Teacher1234!':'Demo1234!'}</code></p><button id="fill-demo" class="text-button" type="button">帶入示範帳號 →</button></div><p class="fine">此為金門大學風格之原創課堂專案，非官方系統。<br>請勿輸入真實校務帳號或個人敏感資料。</p></div></section></main>`;
  document.querySelector('#login-role').onchange=e=>renderRoleLogin(e.target.value);
  document.querySelector('#fill-demo').onclick=()=>{document.querySelector('#student-id').value=teacher?'t001':'s113001';document.querySelector('#password').value=teacher?'Teacher1234!':'Demo1234!';};
  document.querySelector('#login').onsubmit=async event=>{
    event.preventDefault();const button=event.target.querySelector('button');button.disabled=true;button.textContent='登入中…';
    try{await api('/api/login',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(event.target)))});await refresh();page='home';teacherCourseId='';teacherRoster=[];render();}
    catch(error){const box=document.querySelector('#login-error');if(box)box.textContent=error.message;}
    finally{button.disabled=false;button.textContent=`登入${teacher?'教師':'學生'}系統 →`;}
  };
}
function teacherNavigate(target,courseId){if(courseId)teacherCourseId=courseId;page=target;render();document.querySelector('#main').focus();window.scrollTo(0,0);}
function renderTeacher(){
  const user=state.teacher;const marks={home:'⌂',teaching:'▦',roster:'◎',grading:'▤',courses:'▦',profile:'◎',announcements:'☷'};
  if(!teacherTitles[page])page='home';
  app.innerHTML=`<div class="shell faculty"><aside class="sidebar"><a class="brand" href="./" aria-label="校務系統首頁"><span class="seal">金</span><span>金門・校園入口<small>FACULTY PORTAL</small></span></a><div class="semester"><span class="status-dot"></span>${esc(state.term)}<small>FACULTY INFORMATION SYSTEM</small></div><p class="nav-label">教學與校務</p><nav aria-label="教師主要導覽">${Object.entries(teacherTitles).map(([key,title])=>`<button data-teacher-nav="${key}" class="nav-item ${page===key?'active':''}" ${page===key?'aria-current="page"':''}><span class="nav-icon" aria-hidden="true">${marks[key]}</span>${title}</button>`).join('')}</nav><div class="sidebar-bottom"><div class="help-card"><span>教師工作空間</span><p>先儲存草稿，再公布成績</p><button class="text-button" id="teacher-help">查看操作說明 ↗</button></div><div class="sidebar-user"><span class="avatar">${esc(user.name.slice(-2))}</span><div><strong>${esc(user.name)}</strong><small>${esc(user.id)} · 教師</small></div><button data-teacher-logout aria-label="登出">↪</button></div></div></aside><div class="workspace"><header class="topbar"><div><span class="muted">教師專區</span><span class="breadcrumb">/</span>${teacherTitles[page]}</div><div class="topbar-right"><span class="demo-indicator">瀏覽器展示模式</span><span class="avatar small">${esc(user.name.slice(-1))}</span><button class="mobile-logout text-button" data-teacher-logout>登出</button></div></header><main id="main" tabindex="-1">${teacherContent()}</main><footer class="page-footer"><span>金門大學風格校務系統 · 教師專區</span><span>示範資料，非官方校務服務</span></footer></div></div>`;
  document.querySelectorAll('[data-teacher-nav]').forEach(b=>b.onclick=()=>teacherNavigate(b.dataset.teacherNav));
  document.querySelectorAll('[data-teacher-go]').forEach(b=>b.onclick=()=>teacherNavigate(b.dataset.teacherGo,b.dataset.courseId));
  document.querySelectorAll('[data-teacher-logout]').forEach(b=>b.onclick=async()=>{try{await api('/api/logout',{method:'POST',body:'{}'});++teacherRequest;state=null;renderRoleLogin('teacher');toast('已安全登出');}catch(error){toast(error.message,true);}});
  document.querySelector('#teacher-help').onclick=()=>modal('教師操作說明','<p>從「我的授課」進入修課名單或成績登錄，教師只能管理本人授課。</p><p>輸入 0–100 整數並儲存草稿；全班登錄完成後，按「公布已儲存成績」並確認，學生才能查到分數。再次修改草稿不會立刻改變學生看見的成績。</p><p>名單只列出資料庫中實際選課的帳號；既有課程的虛擬占用名額不代表具名學生。</p>');
  document.querySelectorAll('[data-notice]').forEach(b=>b.onclick=()=>{const a=state.announcements.find(a=>a.id===Number(b.dataset.notice));modal(a.title,`<p class="muted">${esc(a.date)} · ${esc(a.category)}</p><p>${esc(a.body)}</p>`);});
  if(page==='courses')document.querySelector('#print').onclick=()=>window.print();
  if(page==='profile')bindProfile();
  if(page==='roster'||page==='grading'){
    document.querySelector('#teacher-course').onchange=e=>{teacherCourseId=e.target.value;loadTeacherRoster();};loadTeacherRoster();
  }
}
function teacherContent(){
  switch(page){
    case 'home':return teacherHome();case 'teaching':return teacherCourses();
    case 'roster':case 'grading':return teacherStudentsPage();
    case 'courses':return timetable();case 'profile':return profile();case 'announcements':return notices();
  }
}
function teacherHome(){
  const students=state.courses.reduce((sum,c)=>sum+c.student_count,0),published=state.courses.reduce((sum,c)=>sum+c.published_count,0),pending=state.courses.reduce((sum,c)=>sum+c.pending_count,0);
  return `${heading('FACULTY WORKSPACE',`${esc(state.teacher.name)}老師，您好 <span class="greeting-dot">✦</span>`,'用更清楚的安排，陪伴每一段學習。')}<section class="hero"><div><span class="hero-label">114 / FACULTY PORTAL</span><h2>專注教學，<br>讓校務更簡單。</h2><p>授課安排、修課名單與成績登錄，<br>在專屬工作空間，從容完成。</p><button class="button cream" data-teacher-go="grading">開始登錄成績 ↗</button></div><div class="hero-illustration" aria-hidden="true"><div class="sun"></div><div class="hill hill-back"></div><div class="campus-building"><div class="roof"></div><div class="building-body"><i></i><i></i><i></i><i></i><i></i><i></i><b></b></div><div class="steps"></div></div><div class="hill hill-front"></div></div></section><section class="stats"><article class="stat-card"><span class="stat-icon green">▦</span><div><p>本學期授課</p><strong>${state.courses.length}<small>門</small></strong><span>合計 ${credits()} 授課學分</span></div></article><article class="stat-card"><span class="stat-icon blue">◎</span><div><p>實際修課人次</p><strong>${students}<small>人次</small></strong><span>依資料庫實際選課帳號計算</span></div></article><article class="stat-card"><span class="stat-icon gold">▤</span><div><p>待公布成績</p><strong>${pending}<small>筆</small></strong><span>已公布 ${published} 筆成績</span></div></article></section><section class="panel"><div class="panel-heading"><div><h2>本學期授課</h2><p>快速查看修課名單與成績作業</p></div><button class="text-button" data-teacher-go="courses">授課課表 →</button></div>${teacherCourseRows()}</section><div class="info-strip"><span class="info-icon">i</span><div><strong>成績公布提醒</strong><span>草稿僅教師可見。儲存完整名單後，確認公布，學生端的學期成績才會更新。</span></div></div>`;
}
function teacherCourses(){return `${heading('MY TEACHING','我的授課',`${esc(state.term)} · ${state.courses.length} 門授課課程`)}<section class="panel">${teacherCourseRows()}</section><p class="fine">實際修課人數為具名學生帳號；虛擬占用名額只用於學生端的選課容量展示。</p>`;}
function teacherCourseRows(){return `<div class="table-scroll"><table><thead><tr><th>課程</th><th>時間 / 教室</th><th>學分</th><th>實際修課</th><th>成績已公布</th><th>教學作業</th></tr></thead><tbody>${state.courses.map(c=>`<tr><td><span class="course-code">${c.id}</span><strong class="course-name">${esc(c.name)}</strong><small>${c.category}</small></td><td>${schedule(c)}<small>${esc(c.room)}</small></td><td>${c.credits}</td><td>${c.student_count} 人</td><td>${c.published_count} / ${c.student_count}</td><td><div class="teacher-actions"><button class="button outline small-button" data-teacher-go="roster" data-course-id="${c.id}">學生名單</button><button class="button primary small-button" data-teacher-go="grading" data-course-id="${c.id}">登錄成績</button></div></td></tr>`).join('')}</tbody></table></div>${!state.courses.length?'<p class="empty">本學期尚無授課。</p>':''}`;}
function teacherStudentsPage(){
  if(!state.courses.some(c=>c.id===teacherCourseId))teacherCourseId=state.courses[0]?.id||'';
  return `${heading(page==='grading'?'GRADE MANAGEMENT':'CLASS ROSTER',page==='grading'?'成績登錄':'修課學生',page==='grading'?'先儲存草稿，確認後再公布給學生。':'即時查看目前選修授課課程的學生。')}<div class="note">僅列出具名學生的實際選課紀錄。草稿不會出現在學生端；已公布成績的課程無法由學生自行退選。</div><section class="panel"><div class="panel-heading"><h2>${page==='grading'?'課程成績':'修課名單'}</h2><label class="inline-label">授課課程<select id="teacher-course" ${state.courses.length?'':'disabled'}>${state.courses.map(c=>`<option value="${c.id}" ${c.id===teacherCourseId?'selected':''}>${c.id} ${esc(c.name)}</option>`).join('')}</select></label></div><div id="teacher-students"><p class="empty">正在載入學生名單…</p></div></section>`;
}
async function loadTeacherRoster(){
  const request=++teacherRequest;const target=document.querySelector('#teacher-students');const requestedPage=page;
  if(!teacherCourseId){target.innerHTML='<p class="empty">本學期尚無授課。</p>';return;}
  target.innerHTML='<p class="empty">正在載入學生名單…</p>';
  try{
    const result=await api(`/api/teacher/courses/${teacherCourseId}/roster`);
    if(request!==teacherRequest || page!==requestedPage || !target.isConnected)return;
    teacherRoster=result.students;target.innerHTML=teacherRosterHtml();bindTeacherGrades();
  }catch(error){if(target.isConnected){target.innerHTML='<p class="empty">無法載入學生名單，請重新選擇課程或稍後再試。</p>';toast(error.message,true);}}
}
function teacherRosterHtml(){
  if(!teacherRoster.length)return '<p class="empty">目前沒有具名學生選修此課程。</p>';
  const grading=page==='grading';
  return `<form id="teacher-grades-form"><div class="table-scroll"><table><thead><tr><th>學號</th><th>學生姓名</th><th>學系 / 年級</th>${grading?'<th>草稿成績（0–100）</th><th>已公布分數</th><th>狀態</th>':''}</tr></thead><tbody>${teacherRoster.map(s=>`<tr><td>${esc(s.id)}</td><td class="strong">${esc(s.name)}</td><td>${esc(s.department)}<small>${s.year} 年級</small></td>${grading?`<td><input class="grade-input" type="number" min="0" max="100" step="1" name="${esc(s.id)}" value="${s.score??''}" aria-label="${esc(s.name)}的成績" placeholder="未登錄"></td><td>${s.published_score??'尚未公布'}</td><td><span class="tag ${s.published_score===null||s.score!==s.published_score?'gold-tag':''}">${s.score===null?'未登錄':s.published_score===null?'草稿':s.score!==s.published_score?'待重新公布':'已公布'}</span></td>`:''}</tr>`).join('')}</tbody></table></div>${grading?'<div class="grade-toolbar"><p class="fine">可分次儲存草稿。公布時所有修課學生都必須已有成績。<br>更改後請先儲存；公布只採用已儲存的草稿。</p><div class="teacher-actions"><button class="button outline" type="submit">儲存草稿</button><button class="button primary" type="button" id="publish-grades">公布已儲存成績</button></div></div><p class="form-error grade-error" id="teacher-grade-error" role="alert"></p>':''}</form>`;
}
function confirmPublish(){return new Promise(resolve=>{const dialog=document.querySelector('#confirm-dialog');document.querySelector('#confirm-title').textContent='確認公布成績';document.querySelector('#confirm-message').textContent='公布後，修課學生即可查看已儲存的成績。確定公布本課程的成績嗎？';dialog.querySelector('[value="confirm"]').textContent='確認公布';dialog.returnValue='cancel';dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true});dialog.showModal();});}
function bindTeacherGrades(){
  if(page!=='grading'||!teacherRoster.length)return;
  const form=document.querySelector('#teacher-grades-form');let dirty=false,working=false;
  form.oninput=()=>{dirty=true;};
  async function perform(action){
    if(working)return;
    const errorBox=document.querySelector('#teacher-grade-error');errorBox.textContent='';
    if(action==='publish'&&dirty){errorBox.textContent='有尚未儲存的修改，請先按「儲存草稿」再公布。';return;}
    working=true;form.querySelectorAll('button').forEach(b=>b.disabled=true);
    try{
      if(action==='publish'&&!await confirmPublish())return;
      const grades=Array.from(new FormData(form)).filter(([,score])=>score!=='').map(([studentId,score])=>({studentId,score:Number(score)}));
      await api(`/api/teacher/courses/${teacherCourseId}/${action==='save'?'grades':'publish'}`,{method:action==='save'?'PUT':'POST',body:JSON.stringify(action==='save'?{grades}:{})});
      await refresh();render();toast(action==='save'?'成績草稿已儲存，學生尚不會看到新分數':'成績已公布，學生現在可以查詢');
    }catch(error){if(errorBox.isConnected)errorBox.textContent=error.message;else toast(error.message,true);}
    finally{working=false;form.querySelectorAll('button').forEach(b=>b.disabled=false);}
  }
  form.onsubmit=e=>{e.preventDefault();perform('save');};
  document.querySelector('#publish-grades').onclick=()=>perform('publish');
}
