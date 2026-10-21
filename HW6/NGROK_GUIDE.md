> 本次作業網站使用 ngrok 將本機 Docker 服務透過公開網址對外開放。由於免費版 ngrok 的 URL 會在每次重啟後隨機改變，無法提供永久固定網址，故撰寫本 `NGROK_GUIDE.md` 說明啟動流程，並於繳交時現場展示網站運作。
# 🌐 ngrok 外部存取說明

本文件說明如何使用 ngrok 將本機的 Docker 微服務公開給外部存取。

---

## 📋 前置需求

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 已安裝並啟動
- [ngrok](https://ngrok.com/) 帳號（免費）
- ngrok CLI 已安裝（`winget install ngrok.ngrok`）

---

## 🚀 啟動步驟

### Step 1：啟動 Docker 服務

```powershell
cd "c:\Users\user\Desktop\現代軟體工程\HW6"
docker compose up -d
```

確認 4 個容器皆為 Running：

```powershell
docker compose ps
```

預期輸出：

```
NAME             IMAGE                SERVICE      STATUS
db-postgres      postgres:16-alpine   db           Up (healthy)
gateway-nginx    nginx:1.27-alpine    nginx        Up
service-node     hw6-node-api         node-api     Up
service-python   hw6-python-api       python-api   Up
```

---

### Step 2：設定 ngrok Authtoken（首次使用才需要）

前往 https://dashboard.ngrok.com/get-started/your-authtoken 複製你的 Token，執行：

```powershell
ngrok config add-authtoken <你的_TOKEN>
```

---

### Step 3：啟動 ngrok 穿透

```powershell
ngrok http 8080
```

終端機成功後會顯示：

```
Session Status    online
Account           Micha1lyu (Plan: Free)
Forwarding        https://xxxx-xxxx.ngrok-free.app -> http://localhost:8080
```

`https://xxxx-xxxx.ngrok-free.app` 即為**外部可存取的公開網址**。

---

## 🔗 可用的 API 端點

| 端點 | 方法 | 說明 |
|------|------|------|
| `/` | GET | 微服務監控主頁面 |
| `/api/node/health` | GET | Node.js 服務健康狀態 |
| `/api/node/logs` | GET | 取得所有資料庫紀錄 |
| `/api/node/logs` | POST | 新增一筆紀錄到資料庫 |
| `/api/python/stats` | GET | Python 服務統計資料 |

---

## 🛠️ 本地管理介面

ngrok 提供本地 Web UI 可查看即時流量：

```
http://127.0.0.1:4040
```

---

## ⚠️ 注意事項

1. **終端機不能關閉**：關掉跑 `ngrok http 8080` 的視窗，穿透就會中斷
2. **URL 每次重啟都會改變**：免費版無固定 URL，重新啟動 ngrok 後需重新分享新網址
3. **第一次訪問有警告頁**：ngrok 免費版會顯示警告頁，點「Visit Site」即可繼續
4. **Demo 完記得關閉**：Ctrl+C 停止 ngrok，避免不必要的服務暴露

---

## 🛑 關閉服務

```powershell
# 停止 ngrok（在跑 ngrok 的終端機按）
Ctrl+C

# 停止所有 Docker 容器
docker compose down
```

---

## 🔄 系統架構

```
外部使用者
    │
    ▼
https://xxxx.ngrok-free.app  ← ngrok 穿透
    │
    ▼
localhost:8080
    │
    ▼
┌─────────────────────────┐
│     Nginx Gateway       │  ← 反向代理 + 靜態頁面
└──────────┬──────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
Node.js API   Python API
  :3000          :8000
    └──────┬──────┘
           ▼
      PostgreSQL
        :5432
```

---

## 🔁 關閉 PowerShell 後如何重新啟動

每次重新開機或關閉終端機後，需重新執行以下步驟：

### 1. 開啟新的 PowerShell，啟動 Docker 容器

```powershell
cd "c:\Users\user\Desktop\現代軟體工程\HW6"
docker compose up -d
```

> 如果容器還在跑（沒有執行過 `docker compose down`），這步可跳過，用 `docker compose ps` 確認狀態就好。

### 2. 再開一個新的 PowerShell，啟動 ngrok

```powershell
ngrok http 8080
```

### 3. 從畫面上複製新的網址

```
Forwarding  https://新的隨機網址.ngrok-free.app -> http://localhost:8080
```

> ⚠️ 免費版每次重啟 URL 都會換，要重新把新網址分享給對方。

---

### 快速重啟一鍵腳本（存成 start.ps1 可直接執行）

```powershell
# start.ps1
Set-Location "c:\Users\user\Desktop\現代軟體工程\HW6"
docker compose up -d
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 8080"
```

把上面內容存成 `start.ps1`，之後在 PowerShell 執行 `.\start.ps1` 就會自動啟動 Docker + ngrok，並在新視窗顯示網址。

---

### 📌 如何使用腳本（下次要啟動直接跑這兩行）

開啟 PowerShell，執行：

```powershell
cd "c:\Users\user\Desktop\現代軟體工程\HW6"
.\start.ps1
```

執行後：
1. 當前視窗會啟動 Docker 容器
2. 自動彈出一個**新的 PowerShell 視窗**跑 ngrok
3. 在新視窗找到 `Forwarding` 那行，複製 `https://xxxx.ngrok-free.app` 分享給對方即可
