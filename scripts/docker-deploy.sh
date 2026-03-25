#!/usr/bin/env sh
set -eu

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is not installed"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose is not available"
  exit 1
fi

mkdir -p generated/projects prisma

docker compose up -d --build
