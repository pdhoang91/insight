#!/bin/bash

echo "Starting database..."
docker-compose up -d db

echo "Waiting for database to be ready..."
sleep 15

echo "Running migration..."
docker-compose run --rm db-migrate

echo "Migration completed. Checking results..."
docker-compose exec db psql -U postgres -d postgres -c "\dt"
