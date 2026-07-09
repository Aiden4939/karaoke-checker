# Agent Rules

Mandatory rules for AI coding agents working in this repository.

## Architecture

- Frontend and backend are separated.
- The web app must not access a database directly.
- The web app calls the API only through `@app/api-client`.
- Shared contracts live in `packages/contracts`.
- Do not introduce a parallel architecture.

## Scope

- Change only files required by the task.
- Do not modify business logic unless explicitly requested.
- Do not change UI appearance unless explicitly requested.
- Explain before affecting other modules.
- Reuse existing components and utilities.
- Avoid unrelated refactors.

## Dependencies

- Do not replace established frameworks.
- Explain before adding dependencies.
- Do not add overlapping libraries.

## Verification

- Run `pnpm verify` after most changes.
- Run `pnpm verify:full` for user flows, router changes, API contract changes, or major refactors.
- Do not skip failing tests.
- Validate UI changes in a real browser.
- Report changed files, test results, and remaining risks.

## Security

- Never commit secrets, tokens, or `.env` files.
- Do not disable strict TypeScript or lint rules to pass checks.

## Docs

- Follow `docs/architecture.md`, `docs/coding-conventions.md`, and task-specific docs under `docs/`.
