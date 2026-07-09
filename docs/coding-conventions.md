# Coding Conventions

## TypeScript

- Keep `strict` enabled everywhere.
- Prefer `unknown` over `any`.
- Use Zod for runtime validation at boundaries.
- Export types from `@app/contracts` when shared across apps.

## Naming

- Files: `kebab-case` for modules, `PascalCase.vue` for Vue SFCs.
- Functions and variables: `camelCase`.
- Constants: `UPPER_SNAKE_CASE` only for true constants.

## Imports

- Use workspace aliases (`@app/*`) for shared packages.
- Use `@/` inside `apps/web` for local source imports.

## Error handling

- API errors use the shared error envelope.
- UI surfaces loading, success, and error states explicitly.
- Do not swallow errors silently.

## Commits

- Use conventional commit prefixes: `feat`, `fix`, `chore`, `docs`, `test`, `ci`.
- Keep commits focused on one concern.

## Agent changes

- Modify only files required by the task.
- Reuse existing utilities and components before adding new ones.
- Run `pnpm verify` before finishing; use `pnpm verify:full` for flow or contract changes.
