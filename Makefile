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

