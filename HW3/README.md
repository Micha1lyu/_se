# CrateMate Studio

CrateMate Studio 是一個黑膠收藏與 DJ 排歌工作台。你可以記錄唱片的版本、品相、購入價與清潔紀錄，也可以把歌曲載入兩台虛擬唱盤，估算接歌所需的轉速調整和調性相容性。

## 快速啟動

建議使用 Node.js 24 LTS。下載或複製儲存庫後，從儲存庫根目錄執行：

```sh
cd HW3/cratemate-studio
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

在瀏覽器開啟 [http://127.0.0.1:5173/](http://127.0.0.1:5173/)。如果你已經在 `HW3/`，第一行改成 `cd cratemate-studio`。

## 網站操作

1. **黑膠唱片櫃**：用搜尋與曲風、調性篩選找到唱片。點選「新增黑膠入庫」建立唱片，再展開卡片的「管理歌曲：新增／編輯」加入曲目。價格與品相記在唱片層，BPM、調性、碟面、曲序與時長記在歌曲層。
2. **混音排歌與轉速計算**：在 Deck A／B 各自先選專輯，再選歌曲。也可以從唱片卡片選歌後直接「載入 Deck A／B」或「排入歌單」。兩首歌資料齊全且可在實體唱盤上同時播放時，工作台會估算 Pitch 調整與調性相容性。
3. **硬體校準與唱頭壽命**：記錄唱針使用時數，並依手動輸入的電壓與房間尺寸查看估算結果。
4. **專案藍圖與備份**：下載目前收藏及設定的 JSON 快照，也可以下載匯入前或清理前的收藏備份（該瀏覽器曾建立備份時）。

每筆唱片收藏代表一份實體版本。多碟專輯請填寫實體碟片編號，例如「第 2 碟／C 面」。同一份收藏的同一張實體碟片無法同時放上兩台唱盤。缺少 BPM 或調性時，系統會提示資料不足。

## 收藏資料與保存方式

原始 Excel 資料包含 **41 張唱片**。目前網站預設顯示已補入曲目的 **6 張唱片、62 首歌曲**。

| 唱片 | 曲目數 | 碟面 |
| --- | ---: | --- |
| Skrillex《Kora》 | 3 | A |
| Daft Punk《Discovery》 | 14 | A–D |
| Silk Sonic《An Evening With Silk Sonic》 | 10 | A–B |
| Zedd《Telos》 | 10 | A–B |
| Knock2《NoLimit》 | 17 | A–D |
| ISOKNOCK《4EVR》 | 8 | A–B |

曲序與碟面依提供的黑膠曲目表及確認資訊登錄。BPM、調性及曲風取自提供的 Beatport 數位版本截圖，供排歌參考。《Discovery》的顯示時長採黑膠曲目表，數位時長另存於曲目資料。

收藏、歌單、唱盤選擇、Pitch 與硬體設定保存在目前瀏覽器的 `cratemate-studio:v3`。使用同一瀏覽器與網址重新整理即可讀回資料。切換瀏覽器或連接埠會使用不同的儲存空間。

舊收藏第一次套用清理時，網站會先備份，再移除當時沒有歌曲的唱片。備份可在「專案價值與 AI 商業藍圖」點選「下載清理前收藏備份」。JSON 目前支援下載，網頁尚未提供匯入功能。

此專案為前端工作台。混音結果和硬體數值來自公式與輸入資料，網站尚未串接即時唱片行情、AI 服務或實體感測器。

## 目錄與檢查指令

- `cratemate-studio/` 是實際執行的網站，使用 React、Vite 和 Tailwind CSS。入口在 `src/main.jsx`，分頁在 `src/components/`，收藏資料在 `src/data/`，混音與本機儲存邏輯在 `src/utils/`。
- `vite-react-ts-starter/` 是獨立的 Vite React TypeScript 起始範本。
- `cratemate_studio.tsx` 是早期單檔原型。

在 `cratemate-studio/` 可執行：

```sh
npm test           # 邏輯及資料保存測試
npm run test:smoke # 分頁和表單的渲染檢查
npm run lint       # 靜態檢查
npm run build      # 產生 dist/
npm run preview    # 預覽建置結果
```
