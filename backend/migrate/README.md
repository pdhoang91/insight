# Database Migration System

This directory contains all database migration scripts for the Insight application. Migrations are automatically run when starting the application with Docker Compose using a Go-based migration runner.

## Migration Files

```
migrate/
├── scripts/                           # SQL migration files
│   ├── 001_initial_setup.sql         # Initial database setup with extensions and indexes
│   ├── 002_clap_system_optimizations.sql # Clap system improvements with count fields and constraints  
│   └── 003_test_verification.sql     # Verification queries to check system health
├── main.go                           # Simple Go migration runner (100 lines, finds all .sql files and runs them)
├── Dockerfile                        # Docker build consistent with other services
├── go.mod                           # Go 1.23 dependencies
└── README.md                        # This documentation
```

## How It Works

### Automatic Migration (Recommended)

When you run `docker-compose up`, migrations are automatically applied:

```bash
docker-compose up
```

The `db-migrate` service will:
1. Wait for the database to be healthy
2. Run all pending migrations in order
3. Track applied migrations in `schema_migrations` table
4. Exit successfully, allowing other services to start

### Manual Migration

You can also run migrations manually using the Go runner:

```bash
# Local database
make migrate-local

# Docker database  
make migrate-docker

# Or run directly with Go
cd backend/application/migrate
DB_HOST=localhost DB_PORT=5432 DB_USER=postgres DB_PASSWORD=password DB_NAME=insight_db go run main.go
```

## Migration Tracking

The system uses a `schema_migrations` table to track which migrations have been applied:

```sql
CREATE TABLE schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Adding New Migrations

1. Create a new file with the next number: `004_your_migration_name.sql`
2. Add your SQL commands
3. Include proper error handling and rollback logic if needed
4. Test the migration locally before deploying

### Migration Template

```sql
-- Migration 004: Your Migration Description
-- Brief description of what this migration does

-- Your SQL commands here
ALTER TABLE your_table ADD COLUMN new_column VARCHAR(255);

-- Verification
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'your_table' AND column_name = 'new_column') THEN
        RAISE NOTICE 'Migration 004: Column added successfully';
    ELSE
        RAISE EXCEPTION 'Migration 004: Failed to add column';
    END IF;
END $$;
```

## Migration Best Practices

### 1. Always Use IF NOT EXISTS
```sql
CREATE INDEX IF NOT EXISTS idx_name ON table_name(column);
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS new_col VARCHAR(255);
```

### 2. Include Verification
```sql
DO $$
BEGIN
    -- Check if migration was successful
    IF NOT EXISTS (...) THEN
        RAISE EXCEPTION 'Migration failed';
    END IF;
END $$;
```

### 3. Handle Existing Data
```sql
-- Update existing records when adding new columns
UPDATE table_name SET new_column = 'default_value' WHERE new_column IS NULL;
```

### 4. Use Transactions for Complex Changes
```sql
BEGIN;
    -- Multiple related changes
    ALTER TABLE ...;
    UPDATE ...;
    CREATE INDEX ...;
COMMIT;
```

## Troubleshooting

### Migration Failed
1. Check the migration logs: `docker-compose logs db-migrate`
2. Connect to database and check `schema_migrations` table
3. Fix the issue and restart: `docker-compose up db-migrate`

### Reset Migrations (Development Only)
```sql
-- WARNING: This will lose all data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
DELETE FROM schema_migrations;
```

### Skip a Failed Migration (Emergency Only)
```sql
-- Mark migration as applied without running it
INSERT INTO schema_migrations (version) VALUES ('004_problematic_migration');
```

## Docker Compose Integration

The migration service is configured in `docker-compose.yml`:

```yaml
db-migrate:
  image: postgres:13
  depends_on:
    db:
      condition: service_healthy
  volumes:
    - ./backend/application/migrate:/migrations
  command: >
    sh -c "
      cd /migrations &&
      ./run_migrations.sh postgresql://postgres:postgres@db:5432/postgres
    "
  restart: "no"  # Run once and exit
```

Other services depend on successful migration completion:

```yaml
application:
  depends_on:
    db:
      condition: service_healthy
    db-migrate:
      condition: service_completed_successfully
```

## Environment Variables

The Go migration runner uses these environment variables:

- `DATABASE_URL` - Full database connection string (optional, built from individual vars if not provided)
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password (default: postgres)
- `DB_NAME` - Database name (default: postgres)
- `DB_SSLMODE` - SSL mode (default: disable)
- `MIGRATIONS_DIR` - Directory containing migration files (default: /migrations/scripts)

## Security Notes

- Migration scripts have full database access
- Always review migrations before applying to production
- Test migrations on a copy of production data first
- Keep migration scripts in version control
- Never modify existing migration files after they've been applied

## Monitoring

Check migration status:

```sql
-- See all applied migrations
SELECT * FROM schema_migrations ORDER BY applied_at;

-- Check if specific migration was applied
SELECT * FROM schema_migrations WHERE version = '002_clap_system_optimizations';
```
