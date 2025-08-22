# Makefile for optimized Docker builds

.PHONY: build clean

# Enable BuildKit by default
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

build: ## Build tất cả services với tối ưu hóa
	@echo "🚀 Building với tối ưu hóa..."
	@docker-compose build --parallel --progress=plain

clean: ## Dọn dẹp Docker cache
	@echo "🧹 Dọn dẹp cache..."
	@docker builder prune -f
	@docker image prune -f
	@docker container prune -f

up: ## Start services với healthcheck
	@echo "🚀 Starting services với healthcheck..."
	@docker-compose up -d
	@echo "⏳ Waiting for healthcheck..."
	@sleep 5
	@make health-status

down: ## Stop tất cả services
	@echo "🛑 Stopping services..."
	@docker-compose down

health-status: ## Kiểm tra health status của các services
	@echo "🏥 Health Status:"
	@echo "=================================="
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

logs: ## Xem logs của tất cả services
	@docker-compose logs -f

# =====================================================
# DATABASE MIGRATION COMMANDS
# =====================================================

migrate: ## Run database migrations
	@echo "🗄️  Running database migrations..."
	@docker-compose up db-migrate
	@echo "✅ Migrations completed"

migrate-status: ## Check migration status
	@echo "🔍 Checking migration status..."
	@docker-compose exec db psql -U postgres -d postgres -c "SELECT version, applied_at FROM schema_migrations ORDER BY applied_at;"

migrate-reset: ## Reset database (DEVELOPMENT ONLY - DESTRUCTIVE!)
	@echo "⚠️  WARNING: This will destroy all data!"
	@read -p "Are you sure? Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ] || exit 1
	@echo "🗑️  Resetting database..."
	@docker-compose exec db psql -U postgres -d postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	@echo "🔄 Running migrations..."
	@make migrate
	@echo "✅ Database reset completed"

migrate-create: ## Create new migration file (usage: make migrate-create NAME=your_migration_name)
	@if [ -z "$(NAME)" ]; then \
		echo "❌ Error: Please provide migration name"; \
		echo "Usage: make migrate-create NAME=your_migration_name"; \
		exit 1; \
	fi
	@NEXT_NUM=$$(ls backend/application/migrate/scripts/*.sql 2>/dev/null | grep -E '^.*[0-9]{3}_.*\.sql$$' | wc -l | xargs expr 1 +); \
	PADDED_NUM=$$(printf "%03d" $$NEXT_NUM); \
	FILENAME="backend/application/migrate/scripts/$${PADDED_NUM}_$(NAME).sql"; \
	echo "📝 Creating migration: $$FILENAME"; \
	cat > "$$FILENAME" << 'EOF'
-- Migration $(shell printf "%03d" $(shell expr $(shell ls backend/application/migrate/scripts/*.sql 2>/dev/null | grep -E '^.*[0-9]{3}_.*\.sql$$' | wc -l) + 1)): $(NAME)
-- Description of what this migration does

-- Your SQL commands here


-- Verification
DO $$
BEGIN
    RAISE NOTICE 'Migration $(shell printf "%03d" $(shell expr $(shell ls backend/application/migrate/scripts/*.sql 2>/dev/null | grep -E '^.*[0-9]{3}_.*\.sql$$' | wc -l) + 1)): $(NAME) completed successfully';
END $$;
EOF
	@echo "✅ Migration file created: $$FILENAME"

migrate-local: ## Run migrations on local database
	@echo "🏠 Running migrations on local database..."
	@cd backend/application/migrate && \
	DB_HOST=localhost DB_PORT=5432 DB_USER=postgres DB_PASSWORD=password DB_NAME=insight_db \
	MIGRATIONS_DIR=scripts go run main.go

migrate-docker: ## Run migrations on docker database  
	@echo "🐳 Running migrations on docker database..."
	@cd backend/application/migrate && \
	DB_HOST=localhost DB_PORT=5433 DB_USER=postgres DB_PASSWORD=postgres DB_NAME=postgres \
	MIGRATIONS_DIR=scripts go run main.go

migrate-build: ## Build migration binary
	@echo "🔨 Building migration binary..."
	@cd backend/application/migrate && go build -o migrator main.go
	@echo "✅ Migration binary built: backend/application/migrate/migrator"

db-shell: ## Connect to database shell
	@echo "🐚 Connecting to database..."
	@docker-compose exec db psql -U postgres -d postgres

# =====================================================
# HELP
# =====================================================

