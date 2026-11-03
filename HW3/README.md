# CrateMate Studio

React + Vite + Tailwind CSS 黑膠收藏、混音排歌與硬體監控工作台。
以 HW3 根目錄的 cratemate_studio.tsx 為來源，整合至 JavaScript / JSX 專案。

## 啟動

從 HW3 資料夾進入主要專案後執行（建議 Node.js 24 LTS）：

```sh
cd cratemate-studio
npm install
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

預覽：http://127.0.0.1:5173/

以下指令同樣在 `cratemate-studio/` 資料夾執行：

```sh
npm run lint       # 靜態檢查
npm run build      # 產生 dist/
npm run preview    # 預覽正式建置
npm run test:smoke # 四個分頁與新增表單的渲染檢查
npm test           # 邏輯與資料保存回歸測試
```

## 程式結構

以下路徑皆相對於 `HW3/cratemate-studio/`：

```text
src/
  main.jsx                       # React 掛載入口，引入 index.css
  index.css                      # Tailwind 三層指令
  App.jsx                        # 共用狀態、操作處理與分頁組合
  data/records.js                # Excel 收藏資料入口
  data/vinylCollection.json      # 41 張收藏與來源列
  data/demoRecords.js            # 原示範資料（回歸測試用）
  utils/harmonic.js              # Camelot 調性配對
  utils/mixing.js                # 對拍、半音偏移與調速後和聲估算
  utils/records.js               # 表單驗證、24 調性與增減值格式
  utils/storage.js               # 本機保存與資料格式驗證
  utils/io.js                    # 剪貼簿與 JSON 檔案下載
  components/
    AppHeader.jsx                # 品牌、資產摘要與分頁導覽
    CrateList.jsx                # 唱片搜尋、篩選與清單
    CrateTab/
      CrateStats.jsx             # 收藏統計
      RecordCard.jsx             # 播放、清潔、載入唱盤與加入歌單
      AddRecordForm.jsx          # 新增唱片表單
      TrackEditor.jsx            # 每張唱片底下的歌曲新增與編輯
    MixerDeck.jsx                # 雙唱盤、Pitch 計算與排歌清單
    HardwareMonitor.jsx          # 唱針時數、電壓與房間聲學
    ProjectBlueprint.jsx         # 專案藍圖、JSON 快照與腳本複製
scripts/
  smoke.mjs                      # 渲染回歸檢查
```

Tailwind 3 由 tailwind.config.js 掃描 src，由 postcss.config.js 接入建置。
lucide-react 提供圖示。跨分頁狀態集中在 App，切換分頁會保留本次操作；
唱片、歌單、唱盤選擇、Pitch 設定及硬體設定會保存至瀏覽器 localStorage，
重新整理後自動還原。同一瀏覽器、同一網站來源才共用資料；切換瀏覽器或連接埠不會共用。
若儲存空間不足或權限被拒絕，畫面會提示匯出備份。保存資料損壞時會載入預設資料並停止覆寫原資料。

目前是前端示範：估值、AI 建議與硬體數值依預設資料、公式和手動輸入呈現；
未連接 Discogs、AI 服務或實體感測器。硬體頁的電壓為固定變比估算，磨損提示為時數門檻；
均不是實際量測。混音採未鎖調的轉速比計算半音偏移，超出推桿範圍或有明顯音準偏差時不顯示和聲分數；
接近半音時使用近似調性評估，仍需試聽確認。

「下載完整 JSON 備份」會下載包含版本、唱片、歌單、唱盤與硬體設定的 JSON 檔。
目前沒有備份檔匯入功能；Python 腳本為展示文字，可複製，不會在瀏覽器執行或產生 Pickle。

## 唱片與歌曲

收藏採兩層結構：每張唱片保存專輯、藝人、壓片版本、轉速、品相、價格、播放與清潔紀錄；
`tracks` 保存該唱片的多首歌曲，各自有曲名、藝人、版本、曲風、BPM、Camelot 調性、能量、實體碟片編號、面別與曲序。
面別支援 A、B、C、D 面；多碟收藏請另外填寫實體碟片編號，例如「碟 2／C 面」，供混音台判斷實體碟片衝突。

先用「新增黑膠入庫」建立收藏，再展開該卡片的「管理歌曲：新增／編輯」。
填妥歌曲後，從卡片的歌曲選單選取欲載入 Deck A／B 或加入歌單的歌曲。
混音台依專輯分組選歌，收藏估值仍按唱片計算，不會因曲目變多而重複加總。
未知的歌曲資料留白；缺少 BPM 或調性時不產生混音分數。

每筆收藏視為一份實體版本。同一份收藏、相同碟片編號的歌曲無法同時用在兩台唱盤；
碟片編號未知時會提示先確認。已確認是不同實體碟片時可進行計算。另有第二份實體收藏時，請建立另一筆收藏。

本機保存與匯出使用版本 2。首次讀取版本 1 時，自動保留收藏與硬體資訊，將舊主打曲目摘要分成待核對的歌曲，
並將舊唱盤／歌單接續至原收藏的第一首歌曲。原本共用的 BPM／調性只保留在 `legacyMixMetadata`，不冒充各首歌的資料。
舊版 `cratemate-studio:v1` 保存值保持不動，新內容寫入 `cratemate-studio:v2`。
目前既有歌曲只是舊摘要的遷移結果，不代表完整或已核對的黑膠曲目表；尚未匯入 Excel 收藏或查詢 Beatport。

## Excel 收藏匯入（版本 3）

目前預設資料為 41 張 Excel 收藏，所有轉速均為 33⅓ RPM。購入價以新臺幣儲存，40 筆已知金額合計 NT$59,671。
「鬼否－本體」購入價未知；Skrillex 的 Fuck U Skrillex… 購入價由使用者確認為 NT$2,499。
品相、發行年份、市值與曲目未由 Excel 提供，保留未知；購買日期不作為發行年份，款式／顏色保存至壓片版本。

版本 3 寫入 cratemate-studio:v3，首次載入舊資料時會先備份原收藏與歌單，再替換為 Excel 收藏；
原硬體設定保留，歌單與唱盤選曲清空。可在專案藍圖頁下載匯入前收藏備份。
若備份或讀取失敗，不會覆寫原資料。重新整理後不會重複匯入或覆蓋後續新增的歌曲。
目前尚未查詢 Beatport 或核對實體版本曲目；請先在唱片卡片管理歌曲。

## NoLimit 曲目補充

Knock2《NoLimit》已依使用者提供的 Discogs 曲目表與 Beatport 截圖加入 17 首歌曲（A1–D4），總時長 55:30。
A／B 面對應第 1 碟，C／D 面對應第 2 碟。BPM、曲風與音名依截圖登錄，Camelot 由音名換算；能量保留未知。
截圖上的 2025-01-17 保存為歌曲數位來源日期，不當成該實體壓片的發行年份；數位資料未經黑膠音訊實測。
既有本機收藏第一次載入此補充時會備份到 cratemate-studio:backup:before-nolimit-tracks，並只補上缺少的資料。
手動資料與既有歌曲 ID 保留，後續重新整理不會重複新增或覆蓋修改。

## Telos 曲目補充

Zedd《Telos》依使用者提供的 Discogs 曲目表及 Beatport 截圖加入 10 首歌曲，A 面 6 首、B 面 4 首，對應第 1 碟，總時長 37:43。
BPM、調性、曲風與時長取自截圖，碟面、曲序及合作藝人取自曲目表；能量保留未知，數位資料未經黑膠音訊實測。
2024-08-30 僅保存為數位來源日期。既有收藏載入時先備份至 `cratemate-studio:backup:before-track-patch:zedd-telos-user-reference-v1`，再補上缺少的曲目資料。
其他專輯、價格、品相、歌單及手動填寫內容保留；補充只執行一次。

## Kora 曲目補充

Skrillex《Kora》依使用者提供的曲目表及 Beatport 截圖加入 A1–A3 三首歌曲（第 1 碟），總時長 8:28。
〈Yo Yan〉使用使用者確認的 2:00，〈Someone Said〉2:48、〈Kora〉3:40。BPM、調性與曲風取自截圖，能量保留未知。
2026-01-15 僅作為數位來源日期，數位資料未經黑膠音訊實測。
既有收藏補充前會備份至 `cratemate-studio:backup:before-track-patch:skrillex-kora-user-reference-v1`，並保留其他專輯與手動填寫內容；補充只執行一次。

## An Evening With Silk Sonic 曲目補充

依使用者確認匯入包含〈Love's Train〉的 10 首版本，碟面曲序為 A1–A5、B6–B10（第 1 碟），總時長 36:24。
BPM、調性、曲風及時長依使用者提供的 Beatport 截圖登錄，能量保留未知；截圖日期 2021-03-04 僅作為數位來源日期，不作為實體壓片發行年份。
既有收藏補充前會備份至 `cratemate-studio:backup:before-track-patch:silk-sonic-evening-user-reference-v1`，其他專輯及手動編輯資料保留，後續不重複匯入。
