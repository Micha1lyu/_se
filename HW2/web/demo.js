/* Browser-only classroom demo. Accounts and permissions are simulated, not security boundaries. */
(function(root){
  'use strict';
  const dataKey='nqu-hw2-pages-data-v1',sessionKey='nqu-hw2-pages-session-v1';
  function seed(){
    const rows=[
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
    const keys=['id','name','teacher','credits','day','period','duration','room','category','capacity','occupied'];
    return {version:1,
      student:{id:'s113001',name:'陳以安',department:'資訊工程學系',year:2,email:'s113001@example.edu.tw',phone:'0912-345-678'},
      teachers:[{id:'t001',name:'王思涵',department:'資訊工程學系',title:'助理教授',email:'t001@example.edu.tw',phone:'082-313-000'},{id:'t002',name:'林志遠',department:'資訊工程學系',title:'助理教授',email:'t002@example.edu.tw',phone:'082-313-000'}],
      assignments:{t001:['CS202'],t002:['CS201']},
      courses:rows.map(row=>Object.fromEntries(keys.map((key,i)=>[key,row[i]]))),
      enrollments:['CS201','CS202','CS203','GE201','PE201'],courseGrades:[],
      grades:[['113-2','程式設計（二）',3,92],['113-2','離散數學',3,86],['113-2','線性代數',3,88],['113-2','大學英文（二）',2,90],['113-2','體育（一）',1,95],['113-1','計算機概論',3,89],['113-1','程式設計（一）',3,94],['113-1','微積分',3,83]].map(([term,name,credits,score])=>({term,name,credits,score})),
      announcements:[
        {id:1,title:'114 學年度第 1 學期加退選開放說明',category:'教務公告',date:'2025-09-08',body:'本展示版可模擬加退選，系統會檢查衝堂、重複選課與 25 學分上限。所有紀錄只存在目前瀏覽器，非學校正式公告。'},
        {id:2,title:'圖書館週末開館時間調整',category:'校園生活',date:'2025-09-05',body:'教學示範公告：圖書館週末開放時間為 09:00–17:00。實際時間請以學校正式網站為準。'},
        {id:3,title:'校園資訊安全：保護你的帳號',category:'資訊服務',date:'2025-09-03',body:'此網站為公開作業展示，登入僅模擬身分切換，請勿輸入真實帳號、密碼或個人資料。'},
        {id:4,title:'本學期學習資源與諮詢服務',category:'學習資源',date:'2025-09-01',body:'教學示範：同學可透過系辦取得課業輔導與學習資源。'}
      ]
    };
  }
  function createCampusDemo(storage,sessions,now=()=>Date.now()){
    const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
    const save=db=>{try{storage.setItem(dataKey,JSON.stringify(db));}catch{fail(503,'瀏覽器無法儲存資料，請允許網站儲存空間後再試');}};
    function read(){
      let stored;try{stored=storage.getItem(dataKey);}catch{fail(503,'無法讀取瀏覽器儲存空間');}
      if(!stored){const db=seed();save(db);return db;}
      try{const db=JSON.parse(stored);if(db.version!==1||!db.student||!Array.isArray(db.enrollments)||!Array.isArray(db.courseGrades)||!Array.isArray(db.courses))throw new Error();return db;}
      catch{fail(503,'展示資料無法讀取，請按頁面上方「重設示範資料」');}
    }
    function session(){
      let value;try{value=JSON.parse(sessions.getItem(sessionKey)||'null');}catch{fail(503,'瀏覽器無法讀取登入狀態');}
      if(!value||value.expires<=now())fail(401,'請先登入系統');return value;
    }
    const roster=(db,courseId)=>db.enrollments.includes(courseId)?[{id:db.student.id,name:db.student.name,department:db.student.department,year:db.student.year,score:null,published_score:null,...db.courseGrades.find(g=>g.courseId===courseId)}]:[];
    function route(url,method,input){
      const db=read();
      if(url==='/api/login'&&method==='POST'){
        const {id,password,role='student'}=input;
        if(!['student','teacher'].includes(role))fail(400,'請選擇學生或教師身分');
        const user=role==='teacher'?db.teachers.find(t=>t.id===id):id===db.student.id?db.student:null;
        if(!user||password!==(role==='teacher'?'Teacher1234!':'Demo1234!'))fail(401,'帳號或密碼不正確，請確認登入身分');
        try{sessions.setItem(sessionKey,JSON.stringify({id,role,expires:now()+28800000}));}catch{fail(503,'瀏覽器無法儲存登入狀態');}
        return {role,[role==='teacher'?'teacher':'student']:user};
      }
      const userSession=session(),role=userSession.role;
      const user=role==='teacher'?db.teachers.find(t=>t.id===userSession.id):db.student;
      if(!user)fail(401,'請先登入系統');
      if(url==='/api/logout'&&method==='POST'){sessions.removeItem(sessionKey);return {ok:true};}
      if(url==='/api/dashboard'&&method==='GET'){
        const common={role,term:'114 學年度 第 1 學期',announcements:db.announcements};
        if(role==='teacher')return {...common,teacher:user,courses:db.courses.filter(c=>db.assignments[user.id]?.includes(c.id)).map(c=>{const students=roster(db,c.id);return {...c,student_count:students.length,published_count:students.filter(s=>s.published_score!==null).length,pending_count:students.filter(s=>s.published_score===null||s.score!==s.published_score).length};})};
        const published=db.courseGrades.filter(g=>g.published_score!==null).map(g=>{const c=db.courses.find(c=>c.id===g.courseId);return {term:'114-1',name:c.name,credits:c.credits,score:g.published_score};});
        return {...common,student:user,courses:db.courses.filter(c=>db.enrollments.includes(c.id)).sort((a,b)=>a.day-b.day||a.period-b.period),catalog:db.courses.map(c=>({...c,taken:c.occupied+Number(db.enrollments.includes(c.id))})).sort((a,b)=>a.id.localeCompare(b.id)),grades:[...published,...db.grades]};
      }
      if(url==='/api/profile'&&method==='PUT'){
        const {email,phone}=input;
        if(typeof email!=='string'||email.length>100||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof phone!=='string'||!/^[0-9+()\s-]{8,25}$/.test(phone))fail(400,'請填寫有效的電子郵件與電話');
        user.email=email;user.phone=phone;save(db);return {[role==='teacher'?'teacher':'student']:user};
      }
      const teacherRoute=url.match(/^\/api\/teacher\/courses\/([A-Z0-9]+)\/(roster|grades|publish)$/);
      if(teacherRoute){
        if(role!=='teacher')fail(403,'此功能僅限教師使用');
        const [,courseId,action]=teacherRoute;
        if(!db.assignments[user.id]?.includes(courseId))fail(403,'只能管理本人授課的課程');
        const students=roster(db,courseId);
        if(action==='roster'&&method==='GET')return {students};
        if(action==='grades'&&method==='PUT'){
          if(!Array.isArray(input.grades)||!input.grades.length||input.grades.length>100)fail(400,'請至少輸入一筆成績，單次最多 100 筆');
          const seen=new Set();
          for(const row of input.grades){
            if(!row||!students.some(s=>s.id===row.studentId))fail(400,'成績包含非本課程學生');
            if(seen.has(row.studentId))fail(400,'同一學生不可重複送出');seen.add(row.studentId);
            if(!Number.isInteger(row.score)||row.score<0||row.score>100)fail(400,'成績必須為 0 至 100 的整數');
            const grade=db.courseGrades.find(g=>g.courseId===courseId&&g.studentId===row.studentId);
            if(grade)grade.score=row.score;else db.courseGrades.push({courseId,studentId:row.studentId,score:row.score,published_score:null});
          }
          save(db);return {ok:true,students:roster(db,courseId)};
        }
        if(action==='publish'&&method==='POST'){
          if(!students.length)fail(409,'本課程沒有可公布成績的學生');
          if(students.some(s=>s.score===null))fail(409,'請先儲存所有修課學生的成績');
          for(const grade of db.courseGrades.filter(g=>g.courseId===courseId))grade.published_score=grade.score;
          save(db);return {ok:true,students:roster(db,courseId)};
        }
        fail(405,'不支援的操作');
      }
      const enrollment=url.match(/^\/api\/enrollments\/([A-Z0-9]+)$/);
      if(enrollment&&['POST','DELETE'].includes(method)){
        if(role!=='student')fail(403,'選課與退選僅限學生操作');
        const course=db.courses.find(c=>c.id===enrollment[1]);if(!course)fail(404,'查無此課程');
        const exists=db.enrollments.includes(course.id),current=db.courses.filter(c=>db.enrollments.includes(c.id));
        if(method==='POST'){
          if(exists)fail(409,'你已選修此課程');
          if(course.occupied>=course.capacity)fail(409,'此課程名額已滿');
          if(current.some(c=>c.day===course.day&&c.period<course.period+course.duration&&course.period<c.period+c.duration))fail(409,'此課程與已選課程衝堂');
          if(current.reduce((sum,c)=>sum+c.credits,0)+course.credits>25)fail(409,'超過本學期 25 學分上限');
          db.enrollments.push(course.id);
        }else{
          if(!exists)fail(404,'尚未選修此課程');
          if(db.courseGrades.some(g=>g.courseId===course.id&&g.published_score!==null))fail(409,'此課程已公布成績，無法退選');
          db.enrollments=db.enrollments.filter(id=>id!==course.id);db.courseGrades=db.courseGrades.filter(g=>g.courseId!==course.id);
        }
        save(db);return {ok:true};
      }
      fail(404,'找不到此功能');
    }
    return {
      async fetch(url,options={}){
        let status=200,data;
        try{let input={};if(options.body){try{input=JSON.parse(options.body);}catch{fail(400,'JSON 格式不正確');}if(!input||typeof input!=='object'||Array.isArray(input))fail(400,'請提供 JSON 物件');}data=route(url,options.method||'GET',input);}
        catch(error){status=error.status||503;data={error:error.status?error.message:'瀏覽器無法儲存展示資料，請重設資料或調整儲存空間設定'};}
        const snapshot=JSON.stringify(data);return {ok:status>=200&&status<300,status,json:async()=>JSON.parse(snapshot)};
      },
      reset(){storage.removeItem(dataKey);sessions.removeItem(sessionKey);}
    };
  }
  root.createCampusDemo=createCampusDemo;
  if(typeof window!=='undefined'){
    try{root.CampusDemo=createCampusDemo(window.localStorage,window.sessionStorage);}
    catch{root.CampusDemo={fetch:async()=>({ok:false,status:503,json:async()=>({error:'瀏覽器封鎖了網站儲存空間，請允許儲存空間後重新整理'})})};}
    document.querySelector('#reset-demo')?.addEventListener('click',()=>document.querySelector('#demo-reset-dialog').showModal());
    document.querySelector('#demo-reset-dialog')?.addEventListener('close',event=>{
      if(event.target.returnValue==='reset'){try{root.CampusDemo.reset();window.location.reload();}catch{document.querySelector('#demo-storage-note').textContent='無法重設，請允許瀏覽器儲存空間後重試';}}
    });
  }
})(globalThis);
