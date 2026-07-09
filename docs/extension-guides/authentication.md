# Authentication Extension Guide

Authentication is not included in the base template.

## Principles

- Keep auth enforcement on the API.
- Store tokens or sessions server-side or in secure HTTP-only cookies.
- Never embed secrets in the frontend bundle.

## Suggested steps

1. Add auth env vars to `apps/api/.env.example`.
2. Create middleware in `apps/api/src/middleware/`.
3. Extend contracts for auth-related payloads.
4. Update `@app/api-client` for protected endpoints.
5. Add login/logout UI only after API flows are tested.

## Testing

- Cover unauthorized, forbidden, and expired session cases.
- Add E2E coverage for the primary sign-in path.
