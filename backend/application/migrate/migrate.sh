#!/bin/bash

# Database Migration Script for Docker Compose
# This script runs all migration files in timestamp order

echo "🚀 Starting database migrations..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if pg_isready -h db -U "$POSTGRES_USER" > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 2
done

if ! pg_isready -h db -U "$POSTGRES_USER" > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not ready after 60 seconds"
    exit 1
fi

# Function to run SQL file
run_migration() {
    local sql_file=$1
    local filename=$(basename "$sql_file")
    echo "📝 Running migration: $filename"
    
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$sql_file"
    
    if [ $? -eq 0 ]; then
        echo "✅ $filename completed successfully"
    else
        echo "❌ $filename failed"
        exit 1
    fi
    echo ""
}

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📍 Migration directory: $SCRIPT_DIR"
echo ""

# Run migrations in timestamp order
for migration_file in "$SCRIPT_DIR"/[0-9]*_*.sql; do
    if [ -f "$migration_file" ]; then
        run_migration "$migration_file"
    fi
done

echo "🎉 All migrations completed successfully!"
echo ""
echo "Database schema is now ready for the application."
echo ""
echo "Tables created:"
echo "- users (with roles, authentication)"
echo "- categories, tags"
echo "- posts, post_content"
echo "- comments, replies"
echo "- user_activities (with action_type for claps)"
echo "- images, image_references"
echo "- bookmarks, follows, ratings, notifications, tabs"
echo "- Junction tables for many-to-many relationships"
echo "- Search indexes for Vietnamese and English content"
