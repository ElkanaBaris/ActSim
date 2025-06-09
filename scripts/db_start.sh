#!/usr/bin/env bash
set -euo pipefail

# ----------------------------------------------------------------------------
# scripts/start.sh
#
# 1) Ensure Postgres is running via Homebrew
# 2) Create database if missing, fix ownership to current user
# 3) Install npm deps
# 4) Run DrizzleKit push with explicit config path
# 5) Start dev server bound to localhost (avoiding ENOTSUP)
# ----------------------------------------------------------------------------

# CONFIGURATION (edit if your paths differ)
DRIZZLE_CONFIG="drizzle.config.ts"
DEV_SCRIPT="npm run dev"
DB_URL="${DATABASE_URL-}"

# 1. Check DATABASE_URL
if [[ -z "$DB_URL" ]]; then
  echo "✖ ERROR: DATABASE_URL must be set."
  echo "  e.g.: export DATABASE_URL='postgres://elkana:password@localhost:5432/actsim'"
  exit 1
fi

# 2. Ensure Postgres is running
echo "→ Checking PostgreSQL service..."
if ! pg_isready &>/dev/null; then
  echo "  Postgres not responding—attempting to start via Homebrew..."
  brew services start postgresql
  sleep 2
  if ! pg_isready &>/dev/null; then
    echo "✖ ERROR: Could not start PostgreSQL. Please start it manually." >&2
    exit 1
  fi
  echo "  PostgreSQL is now running."
else
  echo "  PostgreSQL is already running."
fi

# 3. Parse DB name & admin URL
#    DB_URL = postgres://user:pass@host:port/dbname
DB_NAME="${DB_URL##*/}"
URL_NO_DB="${DB_URL%/*}"
ADMIN_URL="${URL_NO_DB}/postgres"

# 4. Create DB if missing, and set owner to current PGUSER
echo
echo "→ Verifying database '$DB_NAME'..."
if psql "$DB_URL" -c '\q' &>/dev/null; then
  echo "  ✔ Database '$DB_NAME' exists and is accessible."
else
  echo "  Database '$DB_NAME' not found. Creating..."
  psql "$ADMIN_URL" -v ON_ERROR_STOP=1 <<-EOSQL
    CREATE DATABASE "$DB_NAME" OWNER CURRENT_USER;
EOSQL
  echo "  ✔ Created database '$DB_NAME' owned by $(psql "$ADMIN_URL" -tAc "SELECT CURRENT_USER")"
fi

# 5. Install Node dependencies
echo
echo "→ Installing npm dependencies…"
npm install

# 6. Run DrizzleKit migrations (push)
echo
echo "→ Running DrizzleKit: pushing schema…"
npx drizzle-kit push --config "$DRIZZLE_CONFIG"

# 7. Start dev server on localhost
echo
echo "→ Launching dev server (bound to localhost:5000)…"
# Ensure your server listens on localhost (not 0.0.0.0)
HOST=localhost $DEV_SCRIPT
