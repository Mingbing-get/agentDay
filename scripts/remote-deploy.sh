#!/usr/bin/env sh
set -eu

: "${DEPLOY_PATH:?DEPLOY_PATH is required}"

APP_PORT="${APP_PORT:-3000}"
NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-}"

cd "$DEPLOY_PATH"

mkdir -p generated/projects prisma
touch prisma/dev.db

cat > .env <<EOF
APP_PORT=${APP_PORT}
DATABASE_URL=file:./dev.db
NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
EOF

docker compose up -d --build
docker image prune -f >/dev/null 2>&1 || true
