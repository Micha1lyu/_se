import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({});
vm.runInContext(readFileSync(new URL('../public/demo.js',import.meta.url),'utf8'),context);
function storage(){const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};}
const make=()=>{const shared=storage(),studentSession=storage(),teacherSession=storage();return {shared,student:context.createCampusDemo(shared,studentSession),teacher:context.createCampusDemo(shared,teacherSession),studentSession};};
async function req(service,url,method='GET',data){const response=await service.fetch(url,{method,body:data===undefined?undefined:JSON.stringify(data)});return {status:response.status,data:await response.json()};}
const loginStudent=service=>req(service,'/api/login','POST',{id:'s113001',password:'Demo1234!',role:'student'});
const loginTeacher=service=>req(service,'/api/login','POST',{id:'t001',password:'Teacher1234!',role:'teacher'});

test('Pages 模擬登入、選課檢查與重新整理後持續保存',async()=>{
  const {shared,student,studentSession}=make();assert.equal((await req(student,'/api/dashboard')).status,401);
  assert.equal((await req(student,'/api/login','POST',{id:'s113001',password:'wrong'})).status,401);
  await loginStudent(student);
  for(const [id,reason] of [['CS201','已選修'],['CS205','衝堂'],['GE202','名額已滿']]){const r=await req(student,'/api/enrollments/'+id,'POST',{});assert.equal(r.status,409);assert.match(r.data.error,new RegExp(reason));}
  await req(student,'/api/enrollments/CS204','POST',{});
  const reloaded=context.createCampusDemo(shared,studentSession);assert.equal((await req(reloaded,'/api/dashboard')).data.courses.length,6);
  await req(reloaded,'/api/enrollments/CS204','DELETE');assert.equal((await req(student,'/api/dashboard')).data.courses.length,5);
});
test('教師草稿與公布在同一瀏覽器不同頁面互通，修改草稿保留公布分數',async()=>{
  const {student,teacher}=make();await loginStudent(student);await loginTeacher(teacher);
  assert.equal((await req(teacher,'/api/teacher/courses/CS202/publish','POST',{})).status,409);
  await req(teacher,'/api/teacher/courses/CS202/grades','PUT',{grades:[{studentId:'s113001',score:92}]});
  assert.equal((await req(student,'/api/dashboard')).data.grades.length,8);
  await req(teacher,'/api/teacher/courses/CS202/publish','POST',{});
  assert.equal((await req(student,'/api/dashboard')).data.grades.find(g=>g.term==='114-1').score,92);
  await req(teacher,'/api/teacher/courses/CS202/grades','PUT',{grades:[{studentId:'s113001',score:88}]});
  assert.equal((await req(student,'/api/dashboard')).data.grades.find(g=>g.term==='114-1').score,92);
  assert.equal((await req(teacher,'/api/dashboard')).data.courses[0].pending_count,1);
  await req(teacher,'/api/teacher/courses/CS202/publish','POST',{});
  assert.equal((await req(student,'/api/dashboard')).data.grades.find(g=>g.term==='114-1').score,88);
  assert.equal((await req(student,'/api/enrollments/CS202','DELETE')).status,409);
});
test('展示版的角色、授課與成績驗證及批次儲存維持原有規則',async()=>{
  const {student,teacher}=make();await loginStudent(student);await loginTeacher(teacher);
  assert.equal((await req(student,'/api/teacher/courses/CS202/roster')).status,403);
  assert.equal((await req(teacher,'/api/teacher/courses/CS201/roster')).status,403);
  assert.equal((await req(teacher,'/api/enrollments/CS204','POST',{})).status,403);
  for(const score of [-1,101,90.5,'92'])assert.equal((await req(teacher,'/api/teacher/courses/CS202/grades','PUT',{grades:[{studentId:'s113001',score}]})).status,400);
  assert.equal((await req(teacher,'/api/teacher/courses/CS202/grades','PUT',{grades:[{studentId:'s113001',score:90},{studentId:'unknown',score:80}]})).status,400);
  assert.equal((await req(teacher,'/api/teacher/courses/CS202/roster')).data.students[0].score,null);
  await req(teacher,'/api/teacher/courses/CS202/grades','PUT',{grades:[{studentId:'s113001',score:0}]});
  assert.equal((await req(teacher,'/api/teacher/courses/CS202/roster')).data.students[0].score,0);
});
test('聯絡資料儲存、登出與重設只影響展示儲存區',async()=>{
  const {student,shared}=make();shared.setItem('unrelated','keep');await loginStudent(student);
  assert.equal((await req(student,'/api/profile','PUT',{email:'bad',phone:'x'})).status,400);
  await req(student,'/api/profile','PUT',{email:'changed@example.com',phone:'0911-222-333'});
  assert.equal((await req(student,'/api/dashboard')).data.student.email,'changed@example.com');
  await req(student,'/api/logout','POST',{});assert.equal((await req(student,'/api/dashboard')).status,401);
  student.reset();await loginStudent(student);assert.equal((await req(student,'/api/dashboard')).data.student.email,'s113001@example.edu.tw');assert.equal(shared.getItem('unrelated'),'keep');
});
test('不同瀏覽器儲存區彼此獨立；禁止儲存時顯示錯誤而非假成功',async()=>{
  const a=make(),b=make();await loginStudent(a.student);await loginStudent(b.student);
  await req(a.student,'/api/enrollments/CS204','POST',{});
  assert.equal((await req(b.student,'/api/dashboard')).data.courses.length,5);
  const denied=context.createCampusDemo({getItem:()=>null,setItem:()=>{throw new Error('denied');}},storage());
  const r=await loginStudent(denied);assert.equal(r.status,503);assert.match(r.data.error,/儲存/);
});
test('Pages 產出使用相對路徑，且不會向不存在的 Node API 連線',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.doesNotMatch(html,/(?:src|href)="\//);assert.match(html,/GitHub Pages 展示版/);
  assert.ok(html.indexOf('./web/demo.js')<html.indexOf('./web/app.js'));
  const app=readFileSync(new URL('../web/app.js',import.meta.url),'utf8');
  assert.match(app,/window\.CampusDemo\.fetch/);assert.doesNotMatch(app,/await fetch\(/);assert.doesNotMatch(app,/href="\/"/);
  for(const asset of ['app.js','teacher.js','demo.js','styles.css'])assert.ok(readFileSync(new URL('../web/'+asset,import.meta.url)).length>0);
});
