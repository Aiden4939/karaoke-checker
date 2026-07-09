# API Conventions

## Base rules

- Routes live in `apps/api/src`.
- Input validation uses Zod schemas from `@app/contracts`.
- Successful responses use:

```json
{
  "data": {},
  "meta": { "requestId": "..." }
}
```

- Error responses use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [],
    "requestId": "..."
  }
}
```

## HTTP

- Use nouns for resources, verbs only for non-CRUD actions.
- Return appropriate status codes: `200`, `201`, `400`, `404`, `500`.
- Expose `x-request-id` on responses.

## Contracts

- Add or update schemas in `packages/contracts` first.
- Regenerate or update `@app/api-client` usage after contract changes.
- Do not change response shapes without updating tests and docs.

## Security

- Validate all external input.
- Do not expose stack traces in production.
- Configure CORS through environment variables.

## Testing

- Test handlers with `app.request()`; do not bind a real port in unit tests.
- Cover success, validation failure, not found, and unexpected error paths.
