# 動物過馬路 · Animal Hop

使用 HTML、CSS、JavaScript Canvas 製作的網頁遊戲，搭配 Worker 與 D1 資料庫保存排行榜。

## 遊戲功能

- 六種動物：兔子、小狗、熊貓、水獺、倉鼠與青蛙。
- 簡單／困難兩種難度，各自保存排行榜。
- 三顆愛心結束後，可輸入暱稱記錄成績或跳過。
- 過關速度獎勵、死亡過場、暫停與重新開始。
- 手機方向鍵與滑動操作；鍵盤方向鍵／WASD 移動、空白鍵暫停。
- 手機主要操作區採單一螢幕布局，動物在左右兩側各三種。
- 排行榜與說明預設收合；首次瀏覽以 cookie 展開說明。
- 身體一半或以上在水面才判定落水。

## 專案結構

- `web/`：遊戲介面、樣式與遊戲邏輯。
- `worker/index.js`：靜態資源服務及排行榜 API。
- `db/schema.ts`：排行榜資料表定義。
- `drizzle/`：資料庫 migration 與版本記錄。
- `scripts/build.mjs`：產生可部署的 Worker 與資源。
- `.openai/hosting.json`：原有 Sites 專案的部署設定。

## 建置

需要 Node.js（建議 20 或以上）。

```sh
npm ci
npm run build
```

建置輸出為 `dist/server/index.js`，其中已嵌入 `web/` 資源。部署時需提供名為 `DB` 的 D1 binding，並依序套用 `drizzle/` 中的 SQL migration。

此版本沿用原有 Sites 的部署流程；若改用其他 Worker 託管平台，需設定該平台的部署配置與資料庫 binding。單純以 GitHub Pages 託管前端不會啟用伺服器排行榜。

資料庫 schema 變更後可使用 `npm run db:generate` 產生新 migration。請保留已套用的 migration。

## 排行榜 API

- `GET /api/scores?difficulty=easy` 或 `hard`：取得該難度前 20 名。
- `POST /api/scores`：提交暱稱與遊戲成績。

此儲存庫保存程式碼與資料庫結構；不包含既有排行榜玩家資料或部署憑證。
