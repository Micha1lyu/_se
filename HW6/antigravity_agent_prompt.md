# 給 Antigravity Agent 的一鍵建置與驗證 Prompt

請直接複製以下區塊的內容，貼給 Antigravity 裡面的 Agent 執行。這份 Prompt 已經把所有檔案結構、設定檔與前後端程式碼規格寫清楚，並要求 Agent 自動幫你在本機建置、啟動 Docker 容器與驗證測試。

## 複製以下文字貼給 Antigravity Agent

```markdown
請幫我在目前的工作目錄下建置一個完整的 Docker 微服務展示系統，完成檔案建立、容器建置啟動與 API 驗證。

### 1. 專案需求與架構
我們要建立一個包含 4 個容器的 Docker 微服務系統：
- `nginx` (`nginx:1.27-alpine`)：擔任 Web Server 與 Reverse Proxy，對外暴露 `8080:80`。負責提供 `/` 靜態前端展示頁面，並將 `/api/node/` 轉發給 `node-api:3000`、將 `/api/python/` 轉發給 `python-api:8000`。
- `db` (`postgres:16-alpine`)：PostgreSQL 資料庫，掛載具名 Volume `pg_data` 持久化資料，並透過 `./db/init.sql` 自動建立資料表與初始種子資料，需配置 `pg_isready` healthcheck。
- `node-api`（自訂 `Dockerfile`，使用 `node:20-alpine` + Express + `pg`）：負責核心讀寫 API，連接 PostgreSQL。
- `python-api`（自訂 `Dockerfile`，使用 `python:3.12-slim` + FastAPI + `uvicorn` + `psycopg2-binary`）：負責系統指標與資料庫統計分析 API，連接同一個 PostgreSQL。

### 2. 請依序建立以下目錄與檔案

#### (1) `docker-compose.yml`
- 定義 `db`、`node-api`、`python-api`、`nginx` 四個服務，共用 `microservice-net` (bridge network)。
- `node-api` 與 `python-api` 均設定 `depends_on: db: condition: service_healthy`。
- 預設環境變數：`POSTGRES_USER=dockeruser`、`POSTGRES_PASSWORD=dockerpass`、`POSTGRES_DB=microdb`。

#### (2) `db/init.sql`
建立 `service_logs` 資料表並插入 3 筆初始紀錄：
```sql
CREATE TABLE IF NOT EXISTS service_logs (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL,
    author VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO service_logs (service_name, author, message) VALUES
('System Init', 'PostgreSQL', '資料庫容器初始化完成，資料表建立成功！'),
('Node.js Service', 'Express API', 'Node.js 微服務已連線至 PostgreSQL cluster。'),
('Python Service', 'FastAPI Worker', 'Python 分析微服務已就緒，開始監控容器指標。');
```

#### (3) `services/node-api/`
- `Dockerfile`：使用 `node:20-alpine`，安裝套件並啟動 `node server.js`，EXPOSE 3000。
- `package.json`：包含 `express` 與 `pg` 依賴。
- `server.js`：
  - `GET /api/node/health`：執行 `SELECT NOW() AS db_time` 驗證資料庫連線，回傳 `{ status: "healthy", service: "Node.js Express API", container_id: os.hostname(), node_version: process.version, db_time }`。
  - `GET /api/node/logs`：從 PostgreSQL 查詢最新 20 筆 `service_logs`（依 `id DESC` 排序）並回傳 JSON。
  - `POST /api/node/logs`：接收 `{ author, message }`，寫入 `service_logs`（`service_name` 設為 `'Web UI (via Node.js)'`），並回傳新增後的紀錄。

#### (4) `services/python-api/`
- `Dockerfile`：使用 `python:3.12-slim`，安裝套件並執行 `uvicorn main:app --host 0.0.0.0 --port 8000`，EXPOSE 8000。
- `requirements.txt`：包含 `fastapi`、`uvicorn`、`psycopg2-binary`。
- `main.py`：
  - `GET /api/python/stats`：連線至 PostgreSQL 查詢 `SELECT COUNT(*) FROM service_logs` 以及各 `service_name` 的筆數統計，回傳 `{ status: "healthy", service: "Python FastAPI Analytics", container_id: socket.gethostname(), python_version: platform.python_version(), total_records, breakdown }`。

#### (5) `nginx/nginx.conf`
配置 Nginx：
- `location /` 指向 `/usr/share/nginx/html/index.html`。
- `location /api/node/` 反向代理至 `http://node-api:3000/api/node/`（附上 `Host`、`X-Real-IP`、`X-Forwarded-For` headers）。
- `location /api/python/` 反向代理至 `http://python-api:8000/api/python/`。

#### (6) `nginx/html/index.html`
設計一個現代深色科技感（Tailwind CSS CDN 或精緻原生 CSS）的「Docker 多語言微服務監控與展示介面」：
- 頂部顯示系統架構拓撲狀態列（Nginx Gateway -> Node.js / Python -> PostgreSQL）。
- 卡片 1（Node.js 微服務狀態）：即時呼叫 `/api/node/health`，展示 Container ID (Hostname)、Node 版本、資料庫連線時間與健康燈號。
- 卡片 2（Python 微服務狀態）：即時呼叫 `/api/python/stats`，展示 Container ID (Hostname)、Python 版本、資料庫總筆數與各服務寫入統計。
- 互動區塊（PostgreSQL 資料持久化驗證）：提供「發送測試訊息到資料庫」表單（輸入姓名與訊息，呼叫 `POST /api/node/logs`），下方即時列出 `/api/node/logs` 的資料表內容，並附上「重新整理狀態」按鈕。

### 3. 自動執行與驗證任務
檔案建立完成後，請直接在終端機幫我執行以下步驟：
1. 執行 `docker compose up -d --build` 啟動所有服務（若 8080 port 被佔用，請自動改為可用 port 並告知我）。
2. 執行 `docker compose ps` 確認 4 個容器皆為 Running / Healthy。
3. 使用 `curl` 測試 `http://localhost:8080/api/node/health`、`http://localhost:8080/api/python/stats` 與 `http://localhost:8080/api/node/logs` 確保反向代理與資料庫讀寫完全正常；若有錯誤請自動檢視 `docker compose logs` 並修復。
4. 若目錄下已有 `README.md`，請將你實際執行 `docker compose ps`、`docker images` 與 API 測試的真實終端機輸出補充進 `README.md` 的「實機執行驗證紀錄」區塊；若無則建立完整的 `README.md`。
```
