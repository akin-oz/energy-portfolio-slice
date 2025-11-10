#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[dev-all] Starting DynamoDB Local..."
docker compose -f "$ROOT_DIR/local/docker-compose.dynamodb.yml" up -d

echo "[dev-all] Starting API..."
pnpm -C "$ROOT_DIR/services/api" dev &
API_PID=$!

echo "[dev-all] Starting frontend..."
pnpm -C "$ROOT_DIR/apps/web" dev &
FRONTEND_PID=$!

cleanup() {
  echo ""
  echo "[dev-all] Shutting down..."
  if kill -0 "$API_PID" >/dev/null 2>&1; then
    kill "$API_PID" || true
  fi
  if kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
    kill "$FRONTEND_PID" || true
  fi

  docker compose -f "$ROOT_DIR/local/docker-compose.dynamodb.yml" down >/dev/null 2>&1 || true
  echo "[dev-all] Done."
}

trap cleanup INT TERM EXIT

wait