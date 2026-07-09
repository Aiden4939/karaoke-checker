# ADR 0001: Use pnpm Workspace

## Status

Accepted

## Context

The template hosts web, API, contracts, and client code in one product repository.

## Decision

Use `pnpm` workspaces to manage dependencies and internal packages.

## Consequences

- Shared packages use `workspace:*` references.
- Root scripts orchestrate lint, test, build, and verification.
- CI installs once at the repository root.
