#!/usr/bin/env bash
#
# One-time data migration: Aiven Postgres -> Neon Postgres.
#
# Prereqs:
#   - Aiven service is POWERED ON (host must resolve) before running.
#   - pg_dump / pg_restore / psql installed, version >= the Aiven server version.
#   - SOURCE_DATABASE_URL : Aiven connection string (append ?sslmode=require).
#   - TARGET_DATABASE_URL : Neon **DIRECT** connection string (NOT the -pooler
#     host). pg_restore breaks under PgBouncer transaction pooling.
#
# Usage:
#   SOURCE_DATABASE_URL="postgres://...aivencloud.com:PORT/db?sslmode=require" \
#   TARGET_DATABASE_URL="postgres://...neon.tech/db?sslmode=require" \
#   bash scripts/migrate-aiven-to-neon.sh
#
set -euo pipefail

: "${SOURCE_DATABASE_URL:?Set SOURCE_DATABASE_URL (Aiven)}"
: "${TARGET_DATABASE_URL:?Set TARGET_DATABASE_URL (Neon DIRECT, not -pooler)}"

if [[ "$TARGET_DATABASE_URL" == *"-pooler"* ]]; then
  echo "ERROR: TARGET_DATABASE_URL points at the Neon pooler (-pooler host)." >&2
  echo "       Use the DIRECT connection string for restore, then switch the" >&2
  echo "       app to the pooled string afterwards." >&2
  exit 1
fi

DUMP_FILE="aiven-$(date +%Y%m%d-%H%M%S).dump"

count_rows() {
  psql "$1" -At -c "
    SELECT 'users:'     || count(*) FROM users
    UNION ALL SELECT 'invoices:'  || count(*) FROM invoices
    UNION ALL SELECT 'customers:' || count(*) FROM customers
    UNION ALL SELECT 'templates:' || count(*) FROM templates
    UNION ALL SELECT 'company_details:' || count(*) FROM company_details
    UNION ALL SELECT 'account_details:' || count(*) FROM account_details
    UNION ALL SELECT 'settings:'  || count(*) FROM settings;
  "
}

echo "==> Source (Aiven) row counts:"
count_rows "$SOURCE_DATABASE_URL" || { echo "Cannot reach Aiven — is it powered on?" >&2; exit 1; }

echo "==> Dumping Aiven -> $DUMP_FILE"
pg_dump "$SOURCE_DATABASE_URL" --no-owner --no-acl -Fc -f "$DUMP_FILE"

echo "==> Restoring into Neon (direct connection)"
# --clean --if-exists makes the restore idempotent if you need to re-run it.
pg_restore --no-owner --no-acl --clean --if-exists \
  -d "$TARGET_DATABASE_URL" "$DUMP_FILE"

echo "==> Target (Neon) row counts:"
count_rows "$TARGET_DATABASE_URL"

echo
echo "Compare the two row-count lists above. If they match, update"
echo "DATABASE_URL in Vercel to the Neon POOLED (-pooler) string and redeploy."
echo "Keep the dump file ($DUMP_FILE) and the Aiven service until prod is healthy."
