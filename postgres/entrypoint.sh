#!/bin/bash
set -e

APP_USER="${POSTGRES_USER:-postgres}"
APP_PASSWORD="${POSTGRES_PASSWORD}"
APP_DB="${POSTGRES_DB:-postgres}"

# Start postgres in background with all original args
# Always connect via superuser 'postgres' for admin tasks
docker-entrypoint.sh "$@" &
PG_PID=$!

# Wait until postgres is ready (use superuser 'postgres' — always exists)
until pg_isready -h 127.0.0.1 -U postgres -q; do
  sleep 0.5
done

# If using a non-default user, ensure it exists with correct password and owns its DB
if [ "$APP_USER" != "postgres" ]; then
  psql -h 127.0.0.1 -U postgres -d postgres <<-EOSQL
    DO \$\$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${APP_USER}') THEN
        CREATE USER ${APP_USER} WITH PASSWORD '${APP_PASSWORD}';
        RAISE NOTICE 'Created user ${APP_USER}';
      ELSE
        ALTER USER ${APP_USER} WITH PASSWORD '${APP_PASSWORD}';
        RAISE NOTICE 'Synced password for ${APP_USER}';
      END IF;
    END
    \$\$;

    -- Ensure DB exists and is owned by app user
    DO \$\$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '${APP_DB}') THEN
        RAISE EXCEPTION 'Database ${APP_DB} does not exist. Create it manually first.';
      END IF;
    END
    \$\$;

    GRANT ALL PRIVILEGES ON DATABASE ${APP_DB} TO ${APP_USER};
    \c ${APP_DB}
    GRANT ALL ON SCHEMA public TO ${APP_USER};
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${APP_USER};
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${APP_USER};
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${APP_USER};
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${APP_USER};
EOSQL
  echo "User '${APP_USER}' and DB '${APP_DB}' permissions synced."
else
  # Default case: just sync postgres password
  psql -h 127.0.0.1 -U postgres -d postgres -c \
    "ALTER USER postgres WITH PASSWORD '${APP_PASSWORD}';" \
    > /dev/null 2>&1 && echo "Password synced for user 'postgres'"
fi

# Hand off to postgres process
wait $PG_PID
