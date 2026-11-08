@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo 請先安裝 Node.js 22.13 以上版本，然後重新執行。
  pause
  exit /b 1
)
echo 啟動後請開啟 http://localhost:3000
node server.js
pause
