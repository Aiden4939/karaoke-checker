# ADR 0002: Separate Web and API

## Status

Accepted

## Context

Products from this template should deploy frontend and backend independently.

## Decision

Keep `apps/web` and `apps/api` as separate applications in one repository.

## Consequences

- Separate Docker images and runtime configuration.
- UI communicates only through HTTP APIs.
- Each app can scale and release independently.
