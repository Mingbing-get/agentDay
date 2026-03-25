#!/usr/bin/env sh
set -eu

: "${DEPLOY_PATH:?DEPLOY_PATH is required}"

APP_PORT="${APP_PORT:-3000}"
NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-}"

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  echo "Neither 'docker compose' nor 'docker-compose' is available on the server"
  exit 1
fi

cd "$DEPLOY_PATH"

mkdir -p generated/projects prisma
touch prisma/dev.db

cat > .env <<EOF
APP_PORT=${APP_PORT}
DATABASE_URL=file:./dev.db
NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
EOF

sh -c "$COMPOSE_CMD up -d --build"
docker image prune -f >/dev/null 2>&1 || true
