# inwanding-fullstack-template

AI-agent-friendly fullstack template with a separated Vue frontend and Hono API in one pnpm monorepo.

**Repository:** https://github.com/Aiden4939/inwanding-fullstack-template

Use this repository as a GitHub Template to bootstrap small independent products such as AI tools, query services, or content utilities.

## Tech stack

| Area       | Choice                                            |
| ---------- | ------------------------------------------------- |
| Monorepo   | pnpm workspace                                    |
| Frontend   | Vue 3, Vite, TypeScript, Tailwind CSS, shadcn-vue |
| Backend    | Hono on Node.js                                   |
| Contracts  | Zod in `@app/contracts`                           |
| API access | Hono RPC via `@app/api-client`                    |
| Unit tests | Vitest, Vue Test Utils, MSW                       |
| E2E        | Playwright, `@axe-core/playwright`                |
| Quality    | ESLint, Prettier, Knip, GitHub Actions            |

## Repository layout

```text
apps/
  web/                 Vue frontend (@app/web)
  api/                 Hono API (@app/api)
packages/
  contracts/           Shared Zod schemas (@app/contracts)
  api-client/          Typed API client (@app/api-client)
tests/
  e2e/                 Playwright tests (@app/e2e)
scripts/               Project automation
docs/                  Architecture and agent guidance
.cursor/               Cursor rules, skills, and subagents
```

## Requirements

- Node.js `24.18.0`
- pnpm `11.9.0` via Corepack
- Docker, for container workflows

```bash
node --version
corepack enable
pnpm --version
```

## Quick start

```bash
corepack enable
pnpm install
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
pnpm dev
```

- Web: http://localhost:5173
- API health: http://localhost:3000/health

## Create a new project from this template

1. Click **Use this template** on GitHub and create a new repository.
2. Clone the new repository locally.
3. Run the initializer:

```bash
corepack enable
pnpm install
pnpm init:project
```

Non-interactive example:

```bash
pnpm init:project \
  --name demo-app \
  --display-name "Demo App" \
  --description "Demo application" \
  --web-port 5173 \
  --api-port 3000
```

The initializer updates package name, page title, README, ports, and local `.env` files. It does not change git remotes.

## Development commands

```bash
pnpm dev              # Start web + API together
pnpm build            # Build all packages
pnpm lint             # Lint frontend
pnpm format           # Format repository
pnpm format:check     # Check formatting
pnpm typecheck        # Typecheck all TypeScript projects
pnpm test             # Run workspace unit tests
pnpm test:coverage    # Run unit tests with coverage
pnpm test:e2e         # Run Playwright E2E tests
pnpm knip             # Find unused files and dependencies
pnpm verify           # format:check + lint + typecheck + test + build
pnpm verify:full      # verify + knip + test:e2e
pnpm init:project     # Rename and configure a new project
```

## Testing

```bash
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
pnpm verify:full
```

See `docs/testing-strategy.md` for details.

## Docker

```bash
docker compose build
docker compose up -d
docker compose ps
curl http://localhost:3000/health
docker compose down
```

Default host ports:

- API: `3000`
- Web: `8080`

Override with `API_PORT`, `WEB_PORT`, `VITE_API_BASE_URL`, and `CORS_ORIGIN`.

If `curl http://localhost:8080/` fails but the web container is healthy, a local process may already be using port `8080` (for example an IDE plugin, local proxy, or another dev tool). Check the host listener:

```bash
lsof -nP -iTCP:8080 -sTCP:LISTEN
```

Run compose on a different host port:

```bash
WEB_PORT=8081 docker compose up -d
```

Verify:

```bash
curl -f http://localhost:8081/
curl -f http://localhost:3000/health
```

## Agent workflow

- Read `AGENTS.md` before making changes.
- Follow rules in `.cursor/rules/`.
- Use skills in `.cursor/skills/` for implementation, bug fixing, UI verification, and review.
- Run `pnpm verify` after most changes.
- Run `pnpm verify:full` for user flows, router changes, API contract changes, or major refactors.

More detail: `docs/agent-workflow.md`

## Deliberately not included

- Database or ORM
- Authentication or authorization
- Background job runner
- Managed cloud deployment setup

Extension guides:

- `docs/extension-guides/database.md`
- `docs/extension-guides/authentication.md`
- `docs/extension-guides/background-jobs.md`

## Documentation

- `docs/NEXT_SESSION.md` — 進度紀錄與接手指南
- `docs/architecture.md`
- `docs/coding-conventions.md`
- `docs/api-conventions.md`
- `docs/ui-guidelines.md`
- `docs/deployment.md`
- `docs/adr/`

## First steps after creating a new repo

1. `pnpm init:project`
2. Copy `.env.example` files if the initializer did not create them
3. `pnpm dev`
4. Open the homepage and confirm API health is green
5. `pnpm verify:full`
