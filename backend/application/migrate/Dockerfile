# Migration Service Dockerfile

# Build stage
FROM golang:1.23-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy go.mod and go.sum first for better caching
COPY go.mod go.sum ./

# Download modules (this layer will be cached if go.mod/go.sum don't change)
RUN go mod download

# Copy source code
COPY . .

# Build application with optimization flags
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo \
    -o migrator main.go

# Runtime stage
FROM alpine:3.19 AS runner

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

# Create non-root user for security
RUN addgroup -g 1001 -S migrator && \
    adduser -u 1001 -S migrator -G migrator

# Set working directory
WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /app/migrator /app/migrator

# Change ownership to non-root user
RUN chown -R migrator:migrator /app

# Switch to non-root user
USER migrator

# Set default environment variables
ENV MIGRATIONS_DIR=/migrations/scripts

# Expose health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD echo "Migration service ready"

# Run the migrator
ENTRYPOINT ["/app/migrator"]
