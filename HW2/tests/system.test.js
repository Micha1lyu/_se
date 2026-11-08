import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

test('校務系統 HTTP 與資料庫整合流程',async t=>{
  const temp=mkdtempSync(path.join(os.tmpdir(),'hw2-campus-test-'));
  process.env.DATA_DIR=temp;
  const {server}=await import('../server.js');
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  let cookie='';
  async function request(route,method='GET',data,headers={}) {
    const response=await fetch(base+route,{method,headers:{'Content-Type':'application/json',Cookie:cookie,...headers},body:data===undefined?undefined:JSON.stringify(data)});
    return {status:response.status,data:await response.json(),response};
  }
  try {
    await t.test('未登入無法取得學生資料',async()=>assert.equal((await request('/api/dashboard')).status,401));
    await t.test('錯誤密碼不會建立登入狀態',async()=>assert.equal((await request('/api/login','POST',{id:'s113001',password:'wrong'})).status,401));
    await t.test('登入取得 HttpOnly Session 並讀取示範課表',async()=>{
      const login=await request('/api/login','POST',{id:'s113001',password:'Demo1234!'});
      assert.equal(login.status,200);assert.match(login.response.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
      cookie=login.response.headers.get('set-cookie').split(';')[0];
      const dash=await request('/api/dashboard');assert.equal(dash.data.courses.length,5);assert.equal(dash.data.grades.length,8);
      assert.equal(dash.data.student.password_hash,undefined);
    });
    await t.test('阻擋重複、衝堂與額滿課程',async()=>{
      for(const [id,message] of [['CS201','已選修'],['CS205','衝堂'],['GE202','名額已滿']]){
        const result=await request('/api/enrollments/'+id,'POST',{});assert.equal(result.status,409);assert.match(result.data.error,new RegExp(message));
      }
      assert.equal((await request('/api/dashboard')).data.courses.length,5);
    });
    await t.test('加選儲存課程並更新名額，退選釋出名額',async()=>{
      assert.equal((await request('/api/enrollments/CS204','POST',{})).status,200);
      let dash=(await request('/api/dashboard')).data;
      assert.equal(dash.courses.length,6);assert.equal(dash.catalog.find(c=>c.id==='CS204').taken,29);
      assert.equal((await request('/api/enrollments/CS204','DELETE')).status,200);
      dash=(await request('/api/dashboard')).data;assert.equal(dash.courses.length,5);assert.equal(dash.catalog.find(c=>c.id==='CS204').taken,28);
    });
    await t.test('不可退選未選修課程',async()=>assert.equal((await request('/api/enrollments/CS204','DELETE')).status,404));
    await t.test('拒絕無效聯絡資料並儲存有效資料',async()=>{
      assert.equal((await request('/api/profile','PUT',{email:'invalid',phone:'x'})).status,400);
      assert.equal((await request('/api/profile','PUT',{email:'demo@example.com',phone:'0988-123-456'})).status,200);
      assert.equal((await request('/api/dashboard')).data.student.email,'demo@example.com');
    });
    await t.test('跨站請求與 SQL 注入無法修改資料',async()=>{
      assert.equal((await request('/api/enrollments/CS204','POST',{}, {Origin:'https://other.example'})).status,403);
      assert.equal((await request('/api/login','POST',{id:"' OR 1=1 --",password:'x'})).status,401);
    });
    await t.test('靜態頁面與安全標頭可正常載入',async()=>{
      const res=await fetch(base+'/');assert.equal(res.status,200);assert.match(await res.text(),/lang="zh-Hant"/);
      assert.match(res.headers.get('content-security-policy'),/frame-ancestors 'none'/);
      assert.equal((await fetch(base+'/server.js')).status,404);
    });
    await t.test('登出後舊 Session 失效',async()=>{
      assert.equal((await request('/api/logout','POST',{})).status,200);
      assert.equal((await request('/api/dashboard')).status,401);
    });
  } finally {
    await new Promise(resolve=>server.close(resolve));
    assert.equal(path.dirname(temp),os.tmpdir());
    assert.ok(path.basename(temp).startsWith('hw2-campus-test-'));
    rmSync(temp,{recursive:true,force:true});
  }
});
