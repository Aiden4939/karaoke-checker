# ADR 0004: Keep Database Out of Base Template

## Status

Accepted

## Context

Template consumers build different products with different persistence needs.

## Decision

Do not include a database, ORM, or auth system in the base template.

## Consequences

- Faster onboarding for simple API-backed UIs.
- Extension guides document how to add persistence later.
- Products avoid carrying unused infrastructure.
