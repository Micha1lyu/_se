# HW6 快速啟動腳本
Set-Location "c:\Users\user\Desktop\現代軟體工程\HW6"
Write-Host "啟動 Docker 容器..." -ForegroundColor Cyan
docker compose up -d
Start-Sleep -Seconds 3
Write-Host "啟動 ngrok 穿透（新視窗）..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 8080"
Write-Host "完成！請查看新開的視窗取得公開網址。" -ForegroundColor Yellow
