# syntax=docker/dockerfile:1

FROM node:24.18.0-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/contracts/package.json packages/contracts/
COPY packages/contracts/tsconfig.json packages/contracts/
COPY packages/contracts/src packages/contracts/src/

RUN pnpm install --frozen-lockfile

COPY apps/api/tsconfig.json apps/api/
COPY apps/api/src apps/api/src/

RUN pnpm --filter @app/contracts build \
  && pnpm --filter @app/api build

FROM node:24.18.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/api/package.json apps/api/
COPY --from=builder /app/apps/api/dist apps/api/dist/
COPY --from=builder /app/packages/contracts/package.json packages/contracts/
COPY --from=builder /app/packages/contracts/dist packages/contracts/dist/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/apps/api/node_modules apps/api/node_modules/
COPY --from=builder /app/packages/contracts/node_modules packages/contracts/node_modules/

USER app

EXPOSE 3000

WORKDIR /app/apps/api

CMD ["node", "dist/server.js"]
