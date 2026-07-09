# 下次對話接手指南（NEXT_SESSION）

> **用途：** 換裝置、新開 Cursor 對話時先讀本檔。  
> **最後更新：** 2026-07-01  
> **Repo：** https://github.com/Aiden4939/inwanding-fullstack-template  
> **Visibility：** Private（GitHub Template 已啟用）

---

## A. 專案在做什麼

inwanding 系列的全端專案 **Template Repository**：以 pnpm workspace 將 Vue 3 前端與 Hono API 放在同一 repo，可獨立 build/deploy，並附 AI Agent 規範、測試與初始化腳本。

技術棧：Vue 3 + Vite + Tailwind + shadcn-vue + Hono + Zod + Hono RPC + Vitest + Playwright

---

## B. 2026-06-30 已完成

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

## C. 待辦 / 人工步驟

- [x] **Template repository**：已啟用
- [ ] 本機 Docker 驗證：`docker compose up --build` + `curl http://localhost:3000/health`
- [ ] 若需 public template：於 Settings 調整 Visibility（目前為 private）

---

## D. 常用指令

```bash
corepack enable
pnpm install
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
pnpm dev
pnpm verify          # 一般修改後
pnpm verify:full     # 流程 / contract / 重大重構後
pnpm init:project    # 從 template 建立新專案後執行
```

---

## E. 刻意不包含（Base Template）

- 資料庫 / ORM
- 登入 / Session
- Queue / WebSocket
- Pinia（除非出現跨頁全域狀態需求）

擴充指南：`docs/extension-guides/`

---

## F. 新對話建議起手式

1. 先讀 `AGENTS.md` 與 `.cursor/rules/architecture.mdc`
2. 確認在 `inwanding-fullstack-template` 目錄（非舊路徑 `aiden-fullstack-template`）
3. 修改完成後執行 `pnpm verify` 或 `pnpm verify:full`
