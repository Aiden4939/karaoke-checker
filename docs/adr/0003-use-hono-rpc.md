# ADR 0003: Use Hono RPC

## Status

Accepted

## Context

The template needs typed API access without generating OpenAPI clients manually.

## Decision

Use Hono app types with `hono/client` in `@app/api-client`.

## Consequences

- API route changes surface as TypeScript errors in the client.
- `@app/contracts` remains the runtime validation source of truth.
- Client helpers wrap RPC calls with Zod parsing.
