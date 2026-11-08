import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import os from 'node:os';
import path from 'node:path';

test('教師權限與成績公布整合流程',async t=>{
  const temp=mkdtempSync(path.join(os.tmpdir(),'hw2-teacher-test-'));process.env.DATA_DIR=temp;
  const {server}=await import('../server.js');await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;let teacherCookie='',studentCookie='',otherCookie='';
  async function request(route,method='GET',data,cookie=teacherCookie){const response=await fetch(base+route,{method,headers:{'Content-Type':'application/json',Cookie:cookie},body:data===undefined?undefined:JSON.stringify(data)});return {status:response.status,data:await response.json(),response};}
  async function login(id,password,role){const result=await request('/api/login','POST',{id,password,role},'');assert.equal(result.status,200);return result.response.headers.get('set-cookie').split(';')[0];}
  try{
    await t.test('教師入口需登入，角色不可冒用',async()=>{
      assert.equal((await request('/api/teacher/courses/CS202/roster')).status,401);
      assert.equal((await request('/api/login','POST',{id:'t001',password:'Teacher1234!',role:'student'})).status,401);
      assert.equal((await request('/api/login','POST',{id:'t001',password:'Teacher1234!',role:'admin'})).status,400);
      teacherCookie=await login('t001','Teacher1234!','teacher');studentCookie=await login('s113001','Demo1234!','student');otherCookie=await login('t002','Teacher1234!','teacher');
    });
    await t.test('教師取得自己的授課與學生名單，不洩漏帳號雜湊',async()=>{
      const dash=(await request('/api/dashboard')).data;assert.equal(dash.role,'teacher');assert.equal(dash.teacher.name,'王思涵');assert.deepEqual(dash.courses.map(c=>c.id),['CS202']);assert.equal(dash.teacher.password_hash,undefined);assert.equal(dash.catalog,undefined);
      const roster=(await request('/api/teacher/courses/CS202/roster')).data.students;assert.equal(roster.length,1);assert.equal(roster[0].id,'s113001');assert.equal(roster[0].score,null);
    });
    await t.test('伺服器阻擋學生管理成績、教師選課與跨教師管理',async()=>{
      assert.equal((await request('/api/teacher/courses/CS202/roster','GET',undefined,studentCookie)).status,403);
      assert.equal((await request('/api/teacher/courses/CS202/grades','PUT',{grades:[{studentId:'s113001',score:100}]},studentCookie)).status,403);
      assert.equal((await request('/api/enrollments/CS204','POST',{})).status,403);
      for(const [action,method,data] of [['roster','GET',undefined],['grades','PUT',{grades:[{studentId:'s113001',score:100}]}],['publish','POST',{}]]) assert.equal((await request(`/api/teacher/courses/CS202/${action}`,method,data,otherCookie)).status,403);
    });
    await t.test('成績未登錄完成不可公布',async()=>assert.equal((await request('/api/teacher/courses/CS202/publish','POST',{})).status,409));
    await t.test('草稿儲存後學生看不到，公布後學生可查詢',async()=>{
      assert.equal((await request('/api/teacher/courses/CS202/grades','PUT',{grades:[{studentId:'s113001',score:92}]})).status,200);
      assert.equal((await request('/api/dashboard','GET',undefined,studentCookie)).data.grades.some(g=>g.term==='114-1'),false);
      assert.equal((await request('/api/teacher/courses/CS202/publish','POST',{})).status,200);
      const grades=(await request('/api/dashboard','GET',undefined,studentCookie)).data.grades.filter(g=>g.term==='114-1');assert.equal(grades.length,1);assert.equal(grades[0].score,92);assert.equal(grades[0].name,'現代軟體工程');
    });
    await t.test('修改草稿保留舊公布分數，再公布不產生重複成績',async()=>{
      await request('/api/teacher/courses/CS202/grades','PUT',{grades:[{studentId:'s113001',score:88}]});
      assert.equal((await request('/api/dashboard','GET',undefined,studentCookie)).data.grades.find(g=>g.term==='114-1').score,92);
      await request('/api/teacher/courses/CS202/publish','POST',{});
      const grades=(await request('/api/dashboard','GET',undefined,studentCookie)).data.grades.filter(g=>g.term==='114-1');assert.equal(grades.length,1);assert.equal(grades[0].score,88);
    });
    await t.test('不合法分數、外班學生與重複學生不能寫入；整批回滾',async()=>{
      for(const grades of [[{studentId:'s113001',score:101}],[{studentId:'s113001',score:-1}],[{studentId:'s113001',score:89.5}],[{studentId:'s113001',score:'90'}],[{studentId:'s113001',score:70},{studentId:'unknown',score:90}],[{studentId:'s113001',score:80},{studentId:'s113001',score:81}]])assert.equal((await request('/api/teacher/courses/CS202/grades','PUT',{grades})).status,400);
      const row=(await request('/api/teacher/courses/CS202/roster')).data.students[0];assert.equal(row.score,88);assert.equal(row.published_score,88);
    });
    await t.test('已公布成績不能退選；未公布草稿隨退選清除',async()=>{
      assert.equal((await request('/api/enrollments/CS202','DELETE',undefined,studentCookie)).status,409);
      assert.equal((await request('/api/teacher/courses/CS201/grades','PUT',{grades:[{studentId:'s113001',score:0}]},otherCookie)).status,200);
      assert.equal((await request('/api/enrollments/CS201','DELETE',undefined,studentCookie)).status,200);
      assert.equal((await request('/api/teacher/courses/CS201/roster','GET',undefined,otherCookie)).data.students.length,0);
      assert.equal((await request('/api/teacher/courses/CS201/publish','POST',{},otherCookie)).status,409);
      await request('/api/enrollments/CS201','POST',{},studentCookie);
      assert.equal((await request('/api/teacher/courses/CS201/roster','GET',undefined,otherCookie)).data.students[0].score,null);
    });
    await t.test('教師聯絡資料可更新並以教師身分維持登入',async()=>{
      assert.equal((await request('/api/profile','PUT',{email:'faculty@example.com',phone:'082-123-456'})).status,200);
      assert.equal((await request('/api/dashboard')).data.teacher.email,'faculty@example.com');
    });
    await t.test('教師登出後 Session 失效',async()=>{await request('/api/logout','POST',{});assert.equal((await request('/api/dashboard')).status,401);});
  }finally{
    await new Promise(resolve=>server.close(resolve));
    const stored=new DatabaseSync(path.join(temp,'campus.sqlite'));try{assert.equal(stored.prepare("SELECT published_score FROM course_grades WHERE course_id='CS202'").get().published_score,88);}finally{stored.close();}
    assert.equal(path.dirname(temp),os.tmpdir());assert.ok(path.basename(temp).startsWith('hw2-teacher-test-'));rmSync(temp,{recursive:true,force:true});
  }
});
