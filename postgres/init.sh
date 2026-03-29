#!/bin/bash
set -e

# Runs ONCE when the database volume is first created.
# POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB are already set by Docker
# (user + database are created automatically before this script runs).

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<-EOSQL
    GRANT ALL ON SCHEMA public TO $POSTGRES_USER;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $POSTGRES_USER;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $POSTGRES_USER;
EOSQL

echo "Init complete: user='$POSTGRES_USER' db='$POSTGRES_DB'"
