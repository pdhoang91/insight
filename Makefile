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

