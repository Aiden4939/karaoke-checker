# Agent Workflow

## Before coding

1. Read the issue or task template in `docs/templates/`.
2. Read `AGENTS.md` and relevant rules under `.cursor/rules/`.
3. Search for existing patterns before adding new code.

## While coding

- Keep changes minimal and scoped.
- Reuse `@app/contracts` and `@app/api-client`.
- Update tests with behavior changes.
- Do not change unrelated UI or business logic.

## Verification

| Change type                                   | Command            |
| --------------------------------------------- | ------------------ |
| General code change                           | `pnpm verify`      |
| Router, API contract, major refactor, UI flow | `pnpm verify:full` |

## Completion checklist

- Summarize changed files and why.
- Report test commands run and results.
- Note residual risks or follow-up work.
- For UI work, confirm desktop, mobile, console, and network checks.

## Skills and subagents

- `.cursor/skills/implement-feature` for new work
- `.cursor/skills/fix-bug` for defects
- `.cursor/skills/verify-ui` for browser validation
- `.cursor/skills/review-change` for self-review
- `.cursor/agents/reviewer.md` and `.cursor/agents/tester.md` for focused review passes
