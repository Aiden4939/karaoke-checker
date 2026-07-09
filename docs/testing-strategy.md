# Testing Strategy

## Layers

| Layer                    | Tooling                      | Location            |
| ------------------------ | ---------------------------- | ------------------- |
| Frontend unit            | Vitest, Vue Test Utils, MSW  | `apps/web/src/test` |
| Backend unit/integration | Vitest, Hono `app.request()` | `apps/api/src`      |
| Shared package tests     | Vitest                       | `packages/*`        |
| End-to-end               | Playwright, axe              | `tests/e2e`         |

## Required coverage

- API health success and failure paths
- Loading and error UI states
- 404 page
- Console and network sanity in E2E
- Desktop and mobile viewport checks
- Basic accessibility scan

## Commands

```bash
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm verify
pnpm verify:full
```

## Failure artifacts

Playwright keeps screenshots, traces, and HTML reports on failure. These paths are gitignored.

## Agent expectations

- Add or update tests with behavior changes.
- Do not skip or delete tests to make CI pass.
- Prefer failing tests that reproduce bugs before fixing them.
