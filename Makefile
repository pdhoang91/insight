# Makefile for optimized Docker builds

.PHONY: help build build-fast clean analyze-deps prune-all

# Enable BuildKit by default
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

help: ## Hiển thị trợ giúp
	@echo "Available commands:"
	@echo "  build          - Build tất cả services với tối ưu hóa"
	@echo "  build-fast     - Build nhanh với cache tối đa"
	@echo "  clean          - Dọn dẹp Docker cache và unused images"
	@echo "  analyze-deps   - Phân tích dependencies không sử dụng"
	@echo "  prune-all      - Dọn dẹp toàn bộ Docker system"

build: ## Build tất cả services với tối ưu hóa
	@echo "🚀 Building với tối ưu hóa..."
	@docker-compose build --parallel --progress=plain

build-fast: ## Build nhanh với cache tối đa
	@echo "⚡ Fast build với cache..."
	@docker pull golang:1.23-alpine &
	@docker pull alpine:3.19 &
	@docker pull node:22-alpine &
	@wait
	@docker-compose build --parallel

clean: ## Dọn dẹp Docker cache
	@echo "🧹 Dọn dẹp cache..."
	@docker builder prune -f
	@docker image prune -f
	@docker container prune -f

analyze-deps: ## Phân tích dependencies không sử dụng
	@echo "🔍 Phân tích dependencies..."
	@./analyze-deps.sh

prune-all: ## Dọn dẹp toàn bộ Docker system (cẩn thận!)
	@echo "⚠️  Dọn dẹp toàn bộ Docker system..."
	@docker system prune -af --volumes
