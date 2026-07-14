# 下次對話接手指南（NEXT_SESSION）

> **用途：** 換裝置、新開 Cursor 對話時先讀本檔。  
> **最後更新：** 2026-07-14  
> **Repo：** https://github.com/Aiden4939/karaoke-checker  
> **Visibility：** Private（GitHub Template 已啟用）

---

## A. 專案在做什麼

YouTube playlist karaoke checker：以 pnpm workspace 將 Vue 3 前端與 Hono API 放在同一 repo，可獨立 build/deploy，並附 AI Agent 規範、測試與初始化腳本。

目前第一版功能方向：

- 輸入 YouTube playlist URL。
- API 端匯入 playlist videos。
- 解析 YouTube title 為候選 song title / artist name。
- 查詢 JOYSOUND / DAM 並產生 found / not_found / ambiguous / error。
- 前端顯示進度、結果表格、手動修正、單首重查、JSON / CSV 匯出。

技術棧：Vue 3 + Vite + Tailwind + shadcn-vue + Hono + Zod + Hono RPC + Vitest + Playwright

---

## B. 2026-07-14 Karaoke Checker 第一版

### Issue #15 Research / Implementation

| 項目            | 狀態 | 說明                                                                                     |
| --------------- | ---- | ---------------------------------------------------------------------------------------- |
| 實作規劃文件    | 完成 | `docs/requirements/playlist-karaoke-checker.md`                                          |
| Shared contract | 完成 | `packages/contracts/src/playlist-check.ts`                                               |
| API routes      | 完成 | `POST /playlist-checks`、查詢、更新 item、單首 recheck、JSON / CSV export                |
| YouTube 匯入    | 完成 | `YOUTUBE_API_KEY` 設定後使用 YouTube Data API 匯入 public playlist                       |
| Title parser    | 完成 | rule-based parser，回傳 `songTitle`、`artistName`、`confidence`、`reasons`               |
| Provider layer  | 完成 | JOYSOUND / DAM provider interface 與基礎 HTML search detection                           |
| Matching        | 完成 | deterministic scoring，輸出 `found` / `not_found` / `ambiguous` / `error`                |
| Local store     | 完成 | API 端 JSON file store；預設 `data/playlist-checks.json`                                 |
| Frontend        | 完成 | 首頁改為 Karaoke Checker 工具頁，支援進度、表格、編輯、重查、JSON / CSV export           |
| Demo cleanup    | 完成 | 移除不再使用的 health demo、card、alert、skeleton 相關前端檔案，讓 `knip` 無 unused file |

### Code Review 修正

- `POST /playlist-checks` 現在會驗證 playlist URL 必須是 YouTube URL 且包含 `list` query parameter，避免缺 `list` 時變成 500。
- `PATCH /playlist-checks/:checkId/items/:itemId` 現在會確認 item 存在；不存在時回傳 404，不再誤回成功。
- E2E selector 改成 exact match，避免 `Checker` 同時匹配 `Karaoke Checker` 與 nav link。

### 驗證紀錄

- `CI=true corepack pnpm verify`：通過
- `CI=true corepack pnpm knip`：通過；只剩既有 configuration hints，無 unused file failure
- Playwright E2E：通過，desktop Chromium 4 項 + mobile Chromium 4 項，共 8 項

### 注意事項

- 本機 shell 先使用 `nvm use 24.18.0`。
- 若直接 `pnpm` 仍受本機 `~/Library/pnpm/pnpm` 影響，使用 `corepack pnpm ...`。
- Playwright 需要安裝 Chromium；本機已安裝 `chromium_headless_shell-1228`。
- 標準 E2E 若 `localhost:3000` 已有 API 佔用，使用既有 API + 手動啟 web server：

```bash
E2E_SKIP_WEBSERVER=1 E2E_WEB_URL=http://127.0.0.1:5173 E2E_API_URL=http://localhost:3000 corepack pnpm --filter @app/e2e test
```

### 剩餘風險 / 下一步

- JOYSOUND / DAM 目前是基礎搜尋頁 detection，不是穩定的官方 API parser；需要用實際 playlist 驗證命中率。
- `YOUTUBE_API_KEY` 未設定時，playlist check job 會失敗並顯示設定錯誤。
- JSON file store 適合本機第一版；若要長期保存與併發查詢，後續再替換 SQLite。

---

## C. 2026-06-30 已完成

### Bootstrap（已合併至 `main`）

| 項目                | 狀態   | 說明                                                                             |
| ------------------- | ------ | -------------------------------------------------------------------------------- |
| Monorepo 骨架       | 完成   | `apps/web`、`apps/api`、`packages/contracts`、`packages/api-client`、`tests/e2e` |
| 前端 Demo           | 完成   | Health 卡片（loading/success/error）、404、響應式                                |
| 後端 `/health`      | 完成   | 統一錯誤格式、middleware、Zod env                                                |
| 測試                | 完成   | 單元 16 項 + E2E 10 項（含 axe）                                                 |
| CI                  | 完成   | GitHub Actions `verify` + e2e                                                    |
| Docker              | 已建立 | `compose.yaml` + 前後端 Dockerfile（本機需 Docker Desktop 驗證）                 |
| Agent 規範          | 完成   | `AGENTS.md`、`.cursor/rules`、skills、subagents                                  |
| `pnpm init:project` | 完成   | 非互動參數 + 測試                                                                |

### 重新命名（本日）

| 項目               | 變更                                                             |
| ------------------ | ---------------------------------------------------------------- |
| GitHub repo        | `aiden-fullstack-template` → `inwanding-fullstack-template`      |
| 本機目錄           | `aiden-fullstack-template/` → `inwanding-fullstack-template/`    |
| `origin`           | `git@github-personal:Aiden4939/inwanding-fullstack-template.git` |
| 專案內 placeholder | `package.json`、README、UI 標題、`init-project` 預設值已同步     |

### 驗證紀錄（bootstrap 當日）

- `pnpm verify:full`：通過
- Template smoke test（`template-smoke-test`，5174/3001）：通過
- GitHub Actions PR #1：通過

---

## D. 待辦 / 人工步驟

- [x] **Template repository**：已啟用
- [ ] 本機 Docker 驗證：`docker compose up --build` + `curl http://localhost:3000/health`
- [ ] 若需 public template：於 Settings 調整 Visibility（目前為 private）

---

## E. 常用指令

```bash
corepack enable
nvm use 24.18.0
pnpm install
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
pnpm dev
pnpm verify          # 一般修改後
pnpm verify:full     # 流程 / contract / 重大重構後
pnpm init:project    # 從 template 建立新專案後執行
```

---

## F. 刻意不包含（Base Template）

- 資料庫 / ORM
- 登入 / Session
- Queue / WebSocket
- Pinia（除非出現跨頁全域狀態需求）

擴充指南：`docs/extension-guides/`

---

## G. 新對話建議起手式

1. 先讀 `AGENTS.md` 與 `.cursor/rules/architecture.mdc`
2. 確認在 `inwanding-fullstack-template` 目錄（非舊路徑 `aiden-fullstack-template`）
3. 修改完成後執行 `pnpm verify` 或 `pnpm verify:full`
