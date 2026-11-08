import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const target=path.join(root,'web');mkdirSync(target,{recursive:true});
for(const name of ['app.js','teacher.js','styles.css','demo.js']){
  let content=readFileSync(path.join(root,'public',name),'utf8');
  if(name.endsWith('.js'))content=content.replaceAll('href="/"','href="./"').replaceAll('本機 SQLite 資料庫','目前瀏覽器儲存空間').replaceAll('本機資料庫','目前瀏覽器儲存空間').replaceAll('教學示範環境','瀏覽器展示模式').replaceAll('本機教學展示','GitHub Pages 教學展示').replaceAll('請確認已執行 npm start','請允許瀏覽器儲存空間後重新整理');
  if(name==='app.js'){
    const original="const res=await fetch(url,{...options,headers:{'Content-Type':'application/json',...options.headers}});";
    if(!content.includes(original))throw new Error('API adapter anchor not found');
    content=content.replace(original,"const res=await window.CampusDemo.fetch(url,options);");
  }
  if(name==='styles.css')content+='\n.demo-banner{position:sticky;top:0;z-index:30;min-height:54px;background:#efe5cc;border-bottom:1px solid #d9cbaa;display:flex;align-items:center;justify-content:center;gap:18px;padding:10px 20px;font-size:11px;color:#5a573f}.demo-banner strong{white-space:nowrap}.demo-banner button{border:1px solid #b9ad8c;border-radius:5px;background:#fff9e8;padding:6px 9px;color:#5a573f;white-space:nowrap;font-size:10px}.demo-mode .sidebar{top:54px}.demo-mode .shell,.demo-mode .login-layout{min-height:calc(100vh - 54px)}@media(max-width:680px){.demo-banner{flex-wrap:wrap;gap:7px 12px;min-height:80px;padding:10px 14px;font-size:10px}.demo-banner span{flex-basis:100%;order:3;text-align:center}.demo-mode .sidebar{top:auto}.demo-mode .login-layout{min-height:calc(100vh - 80px)}}@media print{.demo-banner{display:none}}\n';
  writeFileSync(path.join(target,name),content);
}
let html=readFileSync(path.join(root,'public','index.html'),'utf8');
html=html.replace('href="/styles.css"','href="./web/styles.css"').replace('src="/teacher.js"','src="./web/teacher.js"').replace('src="/app.js"','src="./web/app.js"').replace('<script src="./web/teacher.js"','<script src="./web/demo.js" defer></script><script src="./web/teacher.js"');
html=html.replace('<body>','<body class="demo-mode"><div class="demo-banner"><strong>GitHub Pages 展示版</strong><span id="demo-storage-note">資料僅保存在此瀏覽器，登入為模擬操作；請勿輸入真實個資。</span><button id="reset-demo" type="button">重設示範資料</button></div>');
html=html.replace('</body>','<dialog id="demo-reset-dialog" aria-labelledby="demo-reset-title"><h2 id="demo-reset-title">重設示範資料</h2><p>將清除此瀏覽器的展示選課、成績與聯絡資訊，回到初始資料。確定重設嗎？</p><form method="dialog"><button class="button outline" value="cancel">取消</button> <button class="button primary" value="reset">確認重設</button></form></dialog></body>');
writeFileSync(path.join(root,'index.html'),html);
console.log('GitHub Pages build ready: index.html + web/');
