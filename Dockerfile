FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:./dev.db"

RUN mkdir -p /app/generated/projects /app/prisma

CMD ["sh", "-c", "pnpm start -- --hostname 0.0.0.0 --port ${PORT}"]
