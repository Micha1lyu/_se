# Git 實作操作指令與步驟紀錄

本文件詳細記錄在完成「Fork、分支（Branch）、Pull Request（PR）、合併（Merge）」過程中所執行的所有終端機指令與 GitHub 平台操作流程。
專案環境與路徑配置
母專案來源：git@github.com:se-tset-examples/git-examples.git

個人子專案（Fork）：git@github.com:Micha1lyu/git-examples.git

本機工作目錄：現代軟體工程\test\git-examples

一、操作流程與下達指令
1. 專案副本建立（Fork）與本機複製（Clone）
GitHub 網頁操作：
進入母專案網址 https://github.com/se-test-examples/git-examples。

點擊右上角 Fork 按鈕，將專案複製到個人帳號 Micha1lyu 底下。

終端機指令（Clone 專案）：
# 1. 複製個人 Fork 的子專案至本機 test 資料夾
cd C:\Users\user\Desktop\現代軟體工程\test
git clone git@github.com:Micha1lyu/git-examples.git

# 2. 進入子專案版本庫目錄
cd git-examples
2. 建立並切換新分支（Branch）
為了不直接修改主分支，建立功能分支 developGitBranch 進行作業：

# 建立並同時切換到 developGitBranch 分支
git checkout -b developGitBranch

# 確認目前所在分支（會標示 * 於 developGitBranch）
git branch

3. 修改檔案、建立提交與推送（Commit & Push）
在 VS Code 中完成 README.md 文件的編寫與存檔後，執行以下指令將變更提交並推送到個人 GitHub 遠端儲存庫：

# 1. 將修改過的 README.md 加入暫存區
git add README.md

# 2. 建立提交紀錄並附上說明訊息
git commit -m "docs: 完成分支、合併、fork與PR教學說明"

# 3. 將 developGitBranch 推送至遠端，並設定 upstream 追蹤
git push -u origin developGitBranch

# 1. 將修改過的 README.md 加入暫存區
git add README.md

# 2. 建立提交紀錄並附上說明訊息
git commit -m "docs: 完成分支、合併、fork與PR教學說明"

# 3. 將 developGitBranch 推送至遠端，並設定 upstream 追蹤
git push -u origin developGitBranch

4. 發起拉取請求（Pull Request）GitHub 網頁操作：瀏覽器開啟個人專案頁面：https://github.com/Micha1lyu/git-examples。點擊頂端黃色提示條的 【Compare & pull request】。比對設定：base: main $\leftarrow$ compare: developGitBranch檢查狀態顯示 Able to merge 後，確認標題並點擊 【Create pull request】 送出。5. 線上與本機合併（Merge）GitHub 網頁端線上合併：在建立好的 Pull Request 頁面中，點擊綠色 【Merge pull request】。點選 【Confirm merge】 確認合併，狀態轉變為紫色的 Merged。本機終端機同步最新狀態：遠端合併完成後，將雲端最新的 main 分支拉回本機更新：

5. # 1. 切換回本機主分支
git checkout main

# 2. 從遠端拉取已合併的最新進度
git pull origin main

# （可選）刪除已合併完成的本地與遠端功能分支
git branch -d developGitBranch
git push origin --delete developGitBranch

二、終端機執行指令清單總覽
以下為整套流程中在 VS Code 終端機內依序執行的完整指令集：

# === 1. 目錄切換 ===
cd ..\test\git-examples

# === 2. 建立並切換分支 ===
git checkout -b developGitBranch

# === 3. 暫存、提交與推送分支 ===
git add README.md
git commit -m "docs: 完成分支、合併、fork與PR教學說明"
git push -u origin developGitBranch

# === 4. GitHub 線上 Merge PR 完畢後，本地同步 ===
git checkout main
git pull origin main

