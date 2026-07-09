# Deployment

## Local development

```bash
corepack enable
pnpm install
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
pnpm dev
```

## Production build

```bash
pnpm build
```

## Docker

```bash
docker compose build
docker compose up -d
docker compose ps
curl http://localhost:3000/health
docker compose down
```

Environment variables:

| Variable            | Default                 | Purpose                        |
| ------------------- | ----------------------- | ------------------------------ |
| `API_PORT`          | `3000`                  | Host port for API              |
| `WEB_PORT`          | `8080`                  | Host port for web              |
| `VITE_API_BASE_URL` | `http://localhost:3000` | API URL baked into web build   |
| `CORS_ORIGIN`       | `http://localhost:8080` | Allowed browser origin for API |

## Images

- `apps/web/Dockerfile`: multi-stage build, nginx static server, non-root user
- `apps/api/Dockerfile`: multi-stage build, Node runtime, non-root user

## CI

GitHub Actions runs `pnpm verify` and `pnpm test:e2e` on push and pull request.

## Not included in base template

- Managed hosting setup
- TLS certificates
- Database provisioning
- Secret management beyond `.env` examples
