import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {scryptSync} from 'node:crypto';
import {mkdtempSync,rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

test('既有學生資料庫升級後保留聯絡資料、選課與歷年成績',async()=>{
  const temp=mkdtempSync(path.join(os.tmpdir(),'hw2-migration-test-'));process.env.DATA_DIR=temp;
  const db=new DatabaseSync(path.join(temp,'campus.sqlite'));
  db.exec(`CREATE TABLE students(id TEXT PRIMARY KEY,name TEXT NOT NULL,department TEXT NOT NULL,year INTEGER NOT NULL,email TEXT NOT NULL,phone TEXT NOT NULL,salt TEXT NOT NULL,password_hash TEXT NOT NULL);
    CREATE TABLE courses(id TEXT PRIMARY KEY,name TEXT NOT NULL,teacher TEXT NOT NULL,credits INTEGER NOT NULL,day INTEGER NOT NULL,period INTEGER NOT NULL,duration INTEGER NOT NULL,room TEXT NOT NULL,category TEXT NOT NULL,capacity INTEGER NOT NULL,occupied INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE enrollments(student_id TEXT REFERENCES students(id),course_id TEXT REFERENCES courses(id),PRIMARY KEY(student_id,course_id));
    CREATE TABLE grades(student_id TEXT REFERENCES students(id),term TEXT NOT NULL,name TEXT NOT NULL,credits INTEGER NOT NULL,score INTEGER NOT NULL);
    CREATE TABLE sessions(token TEXT PRIMARY KEY,student_id TEXT REFERENCES students(id),expires INTEGER NOT NULL);
    CREATE TABLE announcements(id INTEGER PRIMARY KEY,title TEXT NOT NULL,category TEXT NOT NULL,date TEXT NOT NULL,body TEXT NOT NULL);`);
  db.prepare('INSERT INTO students VALUES(?,?,?,?,?,?,?,?)').run('s113001','保留學生','資訊工程學系',2,'keep@example.com','0911-111-111','test-salt',scryptSync('Demo1234!','test-salt',64).toString('hex'));
  for(const [id,name,teacher] of [['CS201','資料結構','林志遠'],['CS202','現代軟體工程','王思涵']])db.prepare('INSERT INTO courses VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(id,name,teacher,3,1,2,3,'E201','必修',45,0);
  db.exec("INSERT INTO enrollments VALUES('s113001','CS202'); INSERT INTO grades VALUES('s113001','113-2','保留課程',3,97);");db.close();
  const {server}=await import('../server.js');await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  try{
    const login=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'s113001',password:'Demo1234!'})});assert.equal(login.status,200);
    const response=await fetch(base+'/api/dashboard',{headers:{Cookie:login.headers.get('set-cookie').split(';')[0]}});const data=await response.json();
    assert.equal(data.student.name,'保留學生');assert.equal(data.student.email,'keep@example.com');assert.equal(data.courses.length,1);assert.equal(data.grades[0].score,97);
    const teacherLogin=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'t001',password:'Teacher1234!',role:'teacher'})});assert.equal(teacherLogin.status,200);
  }finally{await new Promise(resolve=>server.close(resolve));assert.equal(path.dirname(temp),os.tmpdir());assert.ok(path.basename(temp).startsWith('hw2-migration-test-'));rmSync(temp,{recursive:true,force:true});}
});
