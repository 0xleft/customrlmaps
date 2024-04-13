FROM node:18-alpine AS base

FROM base AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY src ./src
COPY public ./public
COPY prisma ./prisma
COPY .env* ./
COPY next.config.mjs .
COPY jsconfig.json .
COPY tailwind.config.js .
COPY postcss.config.js .

RUN npx prisma generate
RUN npm run build

FROM base AS runner

WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app ./

COPY docker-entrypoint.sh .

RUN apt-get update && apt-get install -y curl

CMD ["sh", "docker-entrypoint.sh"]