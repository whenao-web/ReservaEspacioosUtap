#!/usr/bin/env bash
# Crea una base de pruebas desde cero: simulacion + migraciones + datos.
#   DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres bash aplicar.sh
set -euo pipefail
cd "$(dirname "$0")"
URL="${DATABASE_URL:?Defina DATABASE_URL}"
BASE="${URL%/*}/pruebas"

psql "$URL" -qc "drop database if exists pruebas with (force);" -c "create database pruebas;"

for f in simular-supabase.sql ../migrations/*.sql ../seed.sql; do
  psql "$BASE" -q -v ON_ERROR_STOP=1 -f "$f" > /dev/null
  echo "aplicado  $f"
done
echo
echo "Listo. Para probar:  DATABASE_URL=$BASE npm test"
