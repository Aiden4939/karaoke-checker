# Architecture

## Overview

This repository is a single-product monorepo with a separated Vue frontend and Hono API backend.

```text
apps/web        -> Vue 3 + Vite UI
apps/api        -> Hono HTTP API
packages/contracts   -> Shared Zod schemas and types
packages/api-client  -> Typed Hono RPC client
tests/e2e       -> Playwright end-to-end tests
```

## Boundaries

- The web app never talks to a database directly.
- The web app calls the API only through `@app/api-client`.
- Shared request/response contracts live in `@app/contracts`.
- API routes stay thin; business logic belongs in dedicated modules when added later.

## Data flow

1. UI composable or view calls `@app/api-client`.
2. API client uses Hono RPC types from `@app/api`.
3. API validates input with Zod schemas from `@app/contracts`.
4. API returns `{ data, meta }` or structured `{ error }` payloads.

## Deployment model

- Web and API build into separate Docker images.
- `compose.yaml` runs both services with API health checks.
- Environment-specific values come from `.env`, never from source code.

## Extension points

- Database: see `docs/extension-guides/database.md`
- Authentication: see `docs/extension-guides/authentication.md`
- Background jobs: see `docs/extension-guides/background-jobs.md`
