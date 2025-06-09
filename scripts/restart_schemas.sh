#!/usr/bin/env bash
set -euo pipefail

# ----------------------------------------------------------------------------
# scripts/reset_schema.sh
#
# Drops the public schema (and all tables), recreates it owned by elkana,
# and grants full privileges to elkana and user.
# Must connect as a superuser (via SUPERUSER_DATABASE_URL).
#
# Usage:
#   export SUPERUSER_DATABASE_URL=postgres://postgres:secret@localhost:5432/actsim
#   export DATABASE_URL=postgres://elkana:password@localhost:5432/actsim
#   ./scripts/reset_schema.sh
# ----------------------------------------------------------------------------

if [[ -z "${SUPERUSER_DATABASE_URL-}" ]]; then
  echo "✖ ERROR: SUPERUSER_DATABASE_URL not set."
  echo "  e.g.: export SUPERUSER_DATABASE_URL='postgres://postgres:secret@localhost:5432/actsim'"
  exit 1
fi

echo "→ Resetting public schema on actsim via superuser..."

psql "$SUPERUSER_DATABASE_URL" <<'EOF'
-- Drop existing public schema (all tables/views)
DROP SCHEMA IF EXISTS public CASCADE;

-- Recreate public schema and assign owner = elkana
CREATE SCHEMA public AUTHORIZATION elkana;

-- Grant full rights on the schema to elkana and to user
GRANT ALL ON SCHEMA public TO elkana;
GRANT ALL ON SCHEMA public TO "user";

-- Ensure any new tables get the same default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO elkana, "user";
EOF

echo "✔ public schema dropped and recreated under elkana, privileges granted to elkana & user."
