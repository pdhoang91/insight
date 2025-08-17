# Build stage
FROM golang:1.23-alpine AS builder

# Cài đặt các dependencies cần thiết cho build
RUN apk add --no-cache git ca-certificates tzdata build-base

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép go.mod và go.sum trước để tận dụng Docker layer caching
COPY go.mod go.sum ./

# Tải các module (layer này sẽ được cache nếu go.mod/go.sum không thay đổi)
RUN go mod download

# Sao chép mã nguồn
COPY . .

# Build ứng dụng với các flags tối ưu
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo \
    -o auth-service .

# Runtime stage
FROM alpine:3.19 AS runner

# Cài đặt ca-certificates và tạo user
RUN apk --no-cache add ca-certificates tzdata && \
    adduser -D -s /bin/sh appuser

# Thiết lập môi trường làm việc
WORKDIR /app

# Sao chép binary từ build stage
COPY --from=builder /app/auth-service .

# Chuyển sang user không phải root
USER appuser

# Expose cổng
EXPOSE 84

# Chạy ứng dụng
CMD ["./auth-service"]
