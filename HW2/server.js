import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.join(root, 'data');
mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'campus.sqlite'));
db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS students(id TEXT PRIMARY KEY,name TEXT NOT NULL,department TEXT NOT NULL,year INTEGER NOT NULL,email TEXT NOT NULL,phone TEXT NOT NULL,salt TEXT NOT NULL,password_hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS courses(id TEXT PRIMARY KEY,name TEXT NOT NULL,teacher TEXT NOT NULL,credits INTEGER NOT NULL,day INTEGER NOT NULL,period INTEGER NOT NULL,duration INTEGER NOT NULL,room TEXT NOT NULL,category TEXT NOT NULL,capacity INTEGER NOT NULL,occupied INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS enrollments(student_id TEXT REFERENCES students(id),course_id TEXT REFERENCES courses(id),PRIMARY KEY(student_id,course_id));
CREATE TABLE IF NOT EXISTS grades(student_id TEXT REFERENCES students(id),term TEXT NOT NULL,name TEXT NOT NULL,credits INTEGER NOT NULL,score INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,student_id TEXT REFERENCES students(id),expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS announcements(id INTEGER PRIMARY KEY,title TEXT NOT NULL,category TEXT NOT NULL,date TEXT NOT NULL,body TEXT NOT NULL);`);

if (!db.prepare('SELECT id FROM students LIMIT 1').get()) {
  const salt = randomBytes(16).toString('hex');
  db.prepare('INSERT INTO students VALUES(?,?,?,?,?,?,?,?)').run('s113001','陳以安','資訊工程學系',2,'s113001@example.edu.tw','0912-345-678',salt,scryptSync('Demo1234!',salt,64).toString('hex'));
  const insert = db.prepare('INSERT INTO courses VALUES(?,?,?,?,?,?,?,?,?,?,?)');
  const courses = [
    ['CS201','資料結構','林志遠',3,1,2,3,'理工大樓 E201','必修',45,31],
    ['CS202','現代軟體工程','王思涵',3,2,2,3,'理工大樓 E305','必修',45,29],
    ['CS203','資料庫系統','許明哲',3,3,6,3,'理工大樓 E202','必修',45,34],
    ['GE201','金門文化與島嶼生活','李雅文',2,4,3,2,'綜合大樓 A102','通識',60,42],
    ['PE201','體育：羽球','陳建宏',1,5,7,2,'體育館 2F','體育',35,21],
    ['CS204','網頁程式設計','張育誠',3,1,6,3,'電腦教室 E401','選修',40,28],
    ['CS205','人工智慧概論','黃柏翰',3,2,2,3,'理工大樓 E302','選修',40,22],
    ['GE202','海洋與永續發展','蔡佳穎',2,3,2,2,'綜合大樓 A203','通識',50,50],
    ['EN201','實用英語溝通','吳佩珊',2,4,6,2,'語言中心 L102','選修',35,24],
    ['CS206','計算機網路','劉冠廷',3,5,2,3,'理工大樓 E203','選修',40,26]
  ];
  for (const course of courses) insert.run(...course);
  for (const id of ['CS201','CS202','CS203','GE201','PE201']) db.prepare('INSERT INTO enrollments VALUES(?,?)').run('s113001',id);
  for (const [term,name,credits,score] of [['113-2','程式設計（二）',3,92],['113-2','離散數學',3,86],['113-2','線性代數',3,88],['113-2','大學英文（二）',2,90],['113-2','體育（一）',1,95],['113-1','計算機概論',3,89],['113-1','程式設計（一）',3,94],['113-1','微積分',3,83]]) db.prepare('INSERT INTO grades VALUES(?,?,?,?,?)').run('s113001',term,name,credits,score);
  const announcements = [
    ['114 學年度第 1 學期加退選開放說明','教務公告','2025-09-08','本教學系統開放示範加退選。請至「選課作業」查看課程名額與上課時間，確認後送出。系統會檢查衝堂、重複選課與 25 學分上限。所有內容均為虛構示範，非學校正式公告。'],
    ['圖書館週末開館時間調整','校園生活','2025-09-05','示範公告：圖書館週末開放時間為 09:00–17:00。實際開放時間請以學校正式網站為準。'],
    ['校園資訊安全：保護你的帳號','資訊服務','2025-09-03','請勿與他人共用帳號或在公用電腦儲存密碼。離開前請登出系統。本專案只供本機教學示範，請勿輸入真實校務帳號。'],
    ['本學期學習資源與諮詢服務','學習資源','2025-09-01','示範服務：同學可透過系辦取得課業輔導、學習資源與課程諮詢資訊。']
  ];
  for (const a of announcements) db.prepare('INSERT INTO announcements(title,category,date,body) VALUES(?,?,?,?)').run(...a);
}
// Additive migration: preserve existing student accounts, enrollments and grades.
db.exec(`CREATE TABLE IF NOT EXISTS teachers(id TEXT PRIMARY KEY,name TEXT NOT NULL,department TEXT NOT NULL,title TEXT NOT NULL,email TEXT NOT NULL,phone TEXT NOT NULL,salt TEXT NOT NULL,password_hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS teacher_courses(teacher_id TEXT REFERENCES teachers(id),course_id TEXT REFERENCES courses(id),PRIMARY KEY(teacher_id,course_id));
CREATE TABLE IF NOT EXISTS teacher_sessions(token TEXT PRIMARY KEY,teacher_id TEXT REFERENCES teachers(id),expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS course_grades(course_id TEXT REFERENCES courses(id),student_id TEXT REFERENCES students(id),term TEXT NOT NULL,score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100),published_score INTEGER CHECK(published_score BETWEEN 0 AND 100),PRIMARY KEY(course_id,student_id,term));`);
db.exec('BEGIN IMMEDIATE');
try {
  for(const [id,name,courseId] of [['t001','王思涵','CS202'],['t002','林志遠','CS201']]) {
    if(!db.prepare('SELECT id FROM teachers WHERE id=?').get(id)) {
      const salt=randomBytes(16).toString('hex');
      db.prepare('INSERT INTO teachers VALUES(?,?,?,?,?,?,?,?)').run(id,name,'資訊工程學系','助理教授',`${id}@example.edu.tw`,'082-313-000',salt,scryptSync('Teacher1234!',salt,64).toString('hex'));
    }
    db.prepare('INSERT OR IGNORE INTO teacher_courses VALUES(?,?)').run(id,courseId);
  }
  db.exec('COMMIT');
} catch(error) {db.exec('ROLLBACK');throw error;}
const teacherProfile=id=>db.prepare('SELECT id,name,department,title,email,phone FROM teachers WHERE id=?').get(id);
const teaching=id=>db.prepare(`SELECT c.*,
  (SELECT COUNT(*) FROM enrollments e WHERE e.course_id=c.id) AS student_count,
  (SELECT COUNT(*) FROM enrollments e LEFT JOIN course_grades g ON g.course_id=e.course_id AND g.student_id=e.student_id AND g.term='114-1' WHERE e.course_id=c.id AND (g.published_score IS NULL OR g.score!=g.published_score)) AS pending_count,
  (SELECT COUNT(*) FROM course_grades g JOIN enrollments e ON e.course_id=g.course_id AND e.student_id=g.student_id WHERE g.course_id=c.id AND g.term='114-1' AND g.published_score IS NOT NULL) AS published_count
  FROM courses c JOIN teacher_courses tc ON tc.course_id=c.id WHERE tc.teacher_id=? ORDER BY c.day,c.period`).all(id);
const roster=courseId=>db.prepare(`SELECT s.id,s.name,s.department,s.year,g.score,g.published_score
  FROM students s JOIN enrollments e ON e.student_id=s.id
  LEFT JOIN course_grades g ON g.course_id=e.course_id AND g.student_id=s.id AND g.term='114-1'
  WHERE e.course_id=? ORDER BY s.id`).all(courseId);
const profile = id => db.prepare('SELECT id,name,department,year,email,phone FROM students WHERE id=?').get(id);
const enrolled = id => db.prepare('SELECT c.* FROM courses c JOIN enrollments e ON c.id=e.course_id WHERE e.student_id=? ORDER BY c.day,c.period').all(id);
const fail = (status,message) => { throw Object.assign(new Error(message),{status}); };
async function body(req) {
  let text='';
  for await (const chunk of req) { text+=chunk; if(Buffer.byteLength(text)>8192) fail(413,'資料過大'); }
  try { const data=JSON.parse(text || '{}');if(!data || typeof data!=='object' || Array.isArray(data)) fail(400,'請提供 JSON 物件');return data; } catch(error) { if(error.status)throw error;fail(400,'JSON 格式不正確'); }
}
function json(res,status,data,headers={}) {res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});res.end(JSON.stringify(data));}
const attempts = new Map();
export const server = http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  try {
    const url=new URL(req.url,'http://localhost');
    if(!url.pathname.startsWith('/api/')) {
      if(req.method!=='GET') fail(405,'不支援的操作');
      const files={'/':['index.html','text/html'],'/app.js':['app.js','text/javascript'],'/teacher.js':['teacher.js','text/javascript'],'/styles.css':['styles.css','text/css']};
      const file=files[url.pathname]; if(!file) fail(404,'找不到頁面');
      res.writeHead(200,{'Content-Type':file[1]+'; charset=utf-8'});res.end(readFileSync(path.join(root,'public',file[0])));return;
    }
    if(['POST','PUT','DELETE'].includes(req.method)) {
      if(req.headers['sec-fetch-site']==='cross-site') fail(403,'不允許跨站操作');
      if(req.headers.origin && req.headers.origin!==`http://${req.headers.host}`) fail(403,'來源不符');
      if(req.method!=='DELETE' && !req.headers['content-type']?.startsWith('application/json')) fail(415,'請使用 JSON 格式');
    }
    if(url.pathname==='/api/login' && req.method==='POST') {
      const key=req.socket.remoteAddress;const now=Date.now();let limit=attempts.get(key);
      if(!limit || limit.until<now) {limit={count:0,until:now+60000};attempts.set(key,limit);}
      if(++limit.count>15) fail(429,'嘗試次數過多，請一分鐘後再試');
      const {id,password,role='student'}=await body(req);
      if(!['student','teacher'].includes(role)) fail(400,'請選擇學生或教師身分');
      const account=typeof id==='string' && db.prepare(role==='teacher'?'SELECT * FROM teachers WHERE id=?':'SELECT * FROM students WHERE id=?').get(id);
      if(typeof password!=='string' || password.length>128 || !account || !timingSafeEqual(Buffer.from(account.password_hash,'hex'),scryptSync(password,account.salt,64))) fail(401,'帳號或密碼不正確，請確認登入身分');
      const token=randomBytes(32).toString('hex');
      db.prepare('DELETE FROM sessions WHERE expires<?').run(now);
      db.prepare('DELETE FROM teacher_sessions WHERE expires<?').run(now);
      const previous=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('session='))?.slice(8);
      if(previous){db.prepare('DELETE FROM sessions WHERE token=?').run(previous);db.prepare('DELETE FROM teacher_sessions WHERE token=?').run(previous);}
      db.prepare(role==='teacher'?'INSERT INTO teacher_sessions VALUES(?,?,?)':'INSERT INTO sessions VALUES(?,?,?)').run(token,id,now+8*60*60*1000);
      json(res,200,{role,...(role==='teacher'?{teacher:teacherProfile(id)}:{student:profile(id)})},{'Set-Cookie':`session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`});return;
    }
    const token=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('session='))?.slice(8);
    const session=token && db.prepare("SELECT student_id AS id,'student' AS role FROM sessions WHERE token=? AND expires>? UNION ALL SELECT teacher_id AS id,'teacher' AS role FROM teacher_sessions WHERE token=? AND expires>?").get(token,Date.now(),token,Date.now());
    if(!session) fail(401,'請先登入系統');const {id,role}=session;
    if(url.pathname==='/api/logout' && req.method==='POST') {db.prepare('DELETE FROM sessions WHERE token=?').run(token);db.prepare('DELETE FROM teacher_sessions WHERE token=?').run(token);json(res,200,{ok:true},{'Set-Cookie':'session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});return;}
    if(url.pathname.startsWith('/api/teacher/')) {
      if(role!=='teacher') fail(403,'此功能僅限教師使用');
      const route=url.pathname.match(/^\/api\/teacher\/courses\/([A-Z0-9]+)\/(roster|grades|publish)$/);
      if(!route) fail(404,'找不到此功能');
      const [,courseId,action]=route;
      if(!db.prepare('SELECT 1 FROM teacher_courses WHERE teacher_id=? AND course_id=?').get(id,courseId)) fail(403,'只能管理本人授課的課程');
      if(action==='roster' && req.method==='GET') {json(res,200,{students:roster(courseId)});return;}
      if(action==='grades' && req.method==='PUT') {
        const {grades}=await body(req);
        if(!Array.isArray(grades)||!grades.length||grades.length>100) fail(400,'請至少輸入一筆成績，單次最多 100 筆');
        db.exec('BEGIN IMMEDIATE');
        try {
          const students=roster(courseId);const seen=new Set();
          for(const row of grades) {
            if(!row || typeof row.studentId!=='string' || !students.some(s=>s.id===row.studentId)) fail(400,'成績包含非本課程學生');
            if(seen.has(row.studentId)) fail(400,'同一學生不可重複送出');seen.add(row.studentId);
            if(!Number.isInteger(row.score)||row.score<0||row.score>100) fail(400,'成績必須為 0 至 100 的整數');
            db.prepare(`INSERT INTO course_grades(course_id,student_id,term,score) VALUES(?,?,'114-1',?) ON CONFLICT(course_id,student_id,term) DO UPDATE SET score=excluded.score`).run(courseId,row.studentId,row.score);
          }
          db.exec('COMMIT');
        } catch(error){db.exec('ROLLBACK');throw error;}
        json(res,200,{ok:true,students:roster(courseId)});return;
      }
      if(action==='publish' && req.method==='POST') {
        db.exec('BEGIN IMMEDIATE');
        try {
          const students=roster(courseId);
          if(!students.length) fail(409,'本課程沒有可公布成績的學生');
          if(students.some(s=>s.score===null)) fail(409,'請先儲存所有修課學生的成績');
          db.prepare("UPDATE course_grades SET published_score=score WHERE course_id=? AND term='114-1' AND student_id IN (SELECT student_id FROM enrollments WHERE course_id=?)").run(courseId,courseId);
          db.exec('COMMIT');
        } catch(error){db.exec('ROLLBACK');throw error;}
        json(res,200,{ok:true,students:roster(courseId)});return;
      }
      fail(405,'不支援的操作');
    }
    if(url.pathname==='/api/dashboard' && req.method==='GET') {
      const common={role,term:'114 學年度 第 1 學期',announcements:db.prepare('SELECT * FROM announcements ORDER BY date DESC').all()};
      if(role==='teacher'){json(res,200,{...common,teacher:teacherProfile(id),courses:teaching(id)});return;}
      json(res,200,{...common,student:profile(id),courses:enrolled(id),catalog:db.prepare('SELECT c.*,c.occupied+(SELECT COUNT(*) FROM enrollments e WHERE e.course_id=c.id) AS taken FROM courses c ORDER BY c.id').all(),grades:db.prepare("SELECT term,name,credits,score FROM grades WHERE student_id=? UNION ALL SELECT g.term,c.name,c.credits,g.published_score AS score FROM course_grades g JOIN courses c ON c.id=g.course_id WHERE g.student_id=? AND g.published_score IS NOT NULL ORDER BY term DESC").all(id,id)});return;
    }
    if(url.pathname==='/api/profile' && req.method==='PUT') {
      const {email,phone}=await body(req);
      if(typeof email!=='string' || email.length>100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof phone!=='string' || !/^[0-9+()\s-]{8,25}$/.test(phone)) fail(400,'請填寫有效的電子郵件與電話');
      db.prepare(role==='teacher'?'UPDATE teachers SET email=?,phone=? WHERE id=?':'UPDATE students SET email=?,phone=? WHERE id=?').run(email,phone,id);json(res,200,role==='teacher'?{teacher:teacherProfile(id)}:{student:profile(id)});return;
    }
    const match=url.pathname.match(/^\/api\/enrollments\/([A-Z0-9]+)$/);
    if(match && ['POST','DELETE'].includes(req.method)) {
      if(role!=='student') fail(403,'選課與退選僅限學生操作');
      const course=db.prepare('SELECT * FROM courses WHERE id=?').get(match[1]);if(!course) fail(404,'查無此課程');
      db.exec('BEGIN IMMEDIATE');
      try {
        const current=enrolled(id);const exists=current.some(c=>c.id===course.id);
        if(req.method==='POST') {
          if(exists) fail(409,'你已選修此課程');
          const count=db.prepare('SELECT COUNT(*) AS n FROM enrollments WHERE course_id=?').get(course.id).n;
          if(course.occupied+count>=course.capacity) fail(409,'此課程名額已滿');
          if(current.some(c=>c.day===course.day && c.period<course.period+course.duration && course.period<c.period+c.duration)) fail(409,'此課程與已選課程衝堂');
          if(current.reduce((s,c)=>s+c.credits,0)+course.credits>25) fail(409,'超過本學期 25 學分上限');
          db.prepare('INSERT INTO enrollments VALUES(?,?)').run(id,course.id);
        } else {if(!exists) fail(404,'尚未選修此課程');if(db.prepare("SELECT 1 FROM course_grades WHERE course_id=? AND student_id=? AND term='114-1' AND published_score IS NOT NULL").get(course.id,id)) fail(409,'此課程已公布成績，無法退選');db.prepare('DELETE FROM enrollments WHERE student_id=? AND course_id=?').run(id,course.id);db.prepare("DELETE FROM course_grades WHERE student_id=? AND course_id=? AND term='114-1'").run(id,course.id);}
        db.exec('COMMIT');
      } catch(error) {db.exec('ROLLBACK');throw error;}
      json(res,200,{ok:true});return;
    }
    fail(404,'找不到此功能');
  } catch(error) {if(!error.status) console.error(error);json(res,error.status||500,{error:error.status?error.message:'系統暫時無法處理，請稍後再試'});}
});
server.on('close',()=>db.close());
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'連接埠已被使用，請關閉其他伺服器或設定 PORT。':error.message);process.exitCode=1;});
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  server.listen(Number(process.env.PORT||3000),'127.0.0.1',()=>console.log(`校務系統已啟動：http://localhost:${server.address().port}\n學生：s113001 / Demo1234!\n教師：t001 / Teacher1234!\n按 Ctrl+C 結束`));
}
