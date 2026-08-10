FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/package.json packages/shared/
COPY apps/server/package.json apps/server/
RUN pnpm install --frozen-lockfile=false

FROM base AS build
COPY . .
RUN pnpm --filter @operit/shared build && pnpm --filter @operit/server build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules node_modules
COPY --from=build /app/apps/server/dist apps/server/dist
COPY --from=build /app/packages/shared/dist packages/shared/dist
EXPOSE 3000
CMD ["node", "apps/server/dist/main.js"]
