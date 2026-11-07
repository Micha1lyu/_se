# HW7 測試報告

執行日期：2026-11-07（Asia/Taipei）

## 最終結果

實際執行 `npm.cmd test`，退出碼 **0**，共 **30 項測試全部通過**，無跳過、無重試。

| 測試層級 | 通過 | 失敗 | 執行工具 |
| --- | ---: | ---: | --- |
| 後端單元測試 | 11 | 0 | Node.js `node:test` + `assert` |
| 系統／Web API 測試 | 12 | 0 | 真正 HTTP server + `fetch`／`http.request` |
| E2E 測試 | 7 | 0 | Playwright 1.65.0 + Chromium Headless Shell |
| 合計 | 30 | 0 | |

環境：Windows、Node.js v24.14.0、npm 11.9.0。E2E 最終執行耗時約 6.2 秒，設定 `headless: true`、單一 worker。

## 驗證內容

### 1. 後端單元測試

針對 `server/store.js` 直接驗證業務邏輯：

1. 名稱去除前後空白。
2. 拒絕空白及非文字名稱。
3. 100 字元長度邊界。
4. 新增預設狀態及唯一 ID。
5. 修改名稱與完成狀態。
6. 無效更新不產生部分修改。
7. 拒絕空更新與未知欄位。
8. 刪除與同一 Store 內 ID 不重複使用。
9. 不存在任務的 404 錯誤。
10. 對外資料副本無法修改內部狀態。
11. 檔案儲存、重新載入及完成狀態持久化。

### 2. 系統／Web API 測試

每例啟動獨立 server，使用隨機 port 發送真正 HTTP 請求，不使用 API mock：

1. 健康檢查。
2. 初始空清單。
3. 新增、查詢、修改、刪除完整流程與狀態碼。
4. 非法名稱回傳 400，且不新增資料。
5. 無效 JSON 回傳 400。
6. 分段傳送 UTF-8 中文仍保持完整。
7. JSON null 回傳 400。
8. 非法更新回傳 400，且資料維持原狀。
9. 不存在的任務回傳 404。
10. 未知路徑 404 與不支援方法 405。
11. 超過 16 KiB 的請求回傳 413。
12. HTML、JavaScript、CSS 資源正常回傳與 MIME 類型。

### 3. E2E 測試

使用無頭 Chromium 透過 UI 操作；API 只用於每例開始前清理測試資料：

1. 首頁標題與空狀態。
2. 新增任務後重新整理仍存在。
3. 勾選完成、進度計算、三種篩選與取消完成。
4. 刪除任務，重新整理後仍為空清單。
5. 空白名稱驗證。
6. HTML 字串以純文字顯示，防止輸入被解析成 HTML。
7. 390 × 844 手機尺寸可新增任務且無水平溢出。

E2E 使用 `globalSetup` 管理 port 3108 的獨立記憶體 HTTP server，測試後關閉，不讀寫使用者任務檔。桌面版測試截圖另經人工視覺檢查：標題、輸入框、任務、篩選及進度顯示正常。

## 證據與重現

- 完整終端輸出：`reports/final-test-run.log`。
- E2E HTML 報告：`playwright-report/index.html`；可用 `npm.cmd run test:report` 開啟。
- 桌面截圖：`test-results/tasks-勾選、篩選與取消完成-chromium/taskboard.png`。
- 重現方式：先 `npm.cmd ci`、`npm.cmd run test:install`，再 `npm.cmd test`。

本次結果證明上述測試案例通過；未進行負載、多人並發或多程序檔案儲存測試。
