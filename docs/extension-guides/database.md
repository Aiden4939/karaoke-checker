# Database Extension Guide

The base template intentionally excludes a database.

## When to add one

Add a database when the product needs durable storage, querying, or transactions.

## Recommended approach

1. Choose one database technology per product.
2. Add connection config to `apps/api/.env.example` only.
3. Keep schema migrations in a dedicated folder such as `apps/api/db/`.
4. Expose data through API routes; never from the web app directly.
5. Document the decision in a new ADR under `docs/adr/`.

## Suggested stack options

- PostgreSQL with a migration tool
- SQLite for very small local-first products

## Testing

- Use isolated test databases or in-memory substitutes.
- Do not rely on production credentials in tests.
