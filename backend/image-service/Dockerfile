# Build stage
FROM golang:1.23-alpine AS builder

# Cài đặt các dependencies cần thiết cho build
RUN apk add --no-cache git ca-certificates tzdata build-base libwebp-dev

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép go.mod và go.sum trước để tận dụng Docker layer caching
COPY go.mod go.sum ./

# Tải các module (layer này sẽ được cache nếu go.mod/go.sum không thay đổi)
RUN go mod download

# Sao chép mã nguồn
COPY . .

# Build ứng dụng với các flags tối ưu
RUN CGO_ENABLED=1 go build \
    -ldflags='-w -s' \
    -o image-service .

# Runtime stage
FROM alpine:3.19 AS runner

# Cài đặt runtime dependencies và tạo user
RUN apk --no-cache add ca-certificates tzdata libwebp && \
    adduser -D -s /bin/sh appuser

# Thiết lập môi trường làm việc
WORKDIR /app

# Sao chép binary từ build stage
COPY --from=builder /app/image-service .

# Tạo thư mục images với quyền phù hợp
RUN mkdir -p images/uploads && chown -R appuser:appuser images

# Chuyển sang user không phải root
USER appuser

# Expose cổng
EXPOSE 82

# Chạy ứng dụng
CMD ["./image-service"]
