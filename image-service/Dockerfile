# Stage 1: Build stage
FROM golang:1.22 as builder

# Set working directory
WORKDIR /app

# Copy go.mod and go.sum
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN go build -o image-service .

# Stage 2: Final stage with Alpine
FROM alpine:latest

# Cài đặt các thư viện cần thiết cho Alpine
RUN apk --no-cache add ca-certificates libwebp

# Copy the binary from builder stage
COPY --from=builder /app/image-service /image-service

# Create uploads directory
RUN mkdir -p /uploads

# Expose port
EXPOSE 82

# Run the application
CMD ["/image-service"]
