# syntax=docker/dockerfile:1

FROM node:24.18.0-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY packages/api-client/package.json packages/api-client/
COPY packages/contracts/package.json packages/contracts/
COPY packages/contracts/tsconfig.json packages/contracts/
COPY packages/contracts/src packages/contracts/src/
COPY packages/api-client/tsconfig.json packages/api-client/
COPY packages/api-client/src packages/api-client/src/

RUN pnpm install --frozen-lockfile

COPY apps/web apps/web
COPY apps/api/src apps/api/src
COPY apps/api/tsconfig.json apps/api/

RUN pnpm --filter @app/contracts build \
  && pnpm --filter @app/api build \
  && pnpm --filter @app/web build

FROM nginx:1.31-alpine AS runner

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

RUN addgroup -S app && adduser -S app -G app \
  && chown -R app:app /usr/share/nginx/html /var/cache/nginx /var/log/nginx \
  && touch /var/run/nginx.pid \
  && chown app:app /var/run/nginx.pid

USER app

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
