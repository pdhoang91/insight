
# Build stage
FROM golang:1.23-alpine AS builder

# Cài đặt các dependencies cần thiết cho build
RUN apk add --no-cache git ca-certificates tzdata

# Thiết lập môi trường làm việc
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
    -o management .

# Runtime stage
FROM alpine:3.19 AS runner

# Cài đặt bash và ca-certificates
RUN apk --no-cache add bash ca-certificates tzdata && \
    adduser -D -s /bin/sh appuser

# Sao chép wait-for-it.sh và entrypoint.sh, cấp quyền thực thi
COPY wait-for-it.sh /wait-for-it.sh
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /wait-for-it.sh /entrypoint.sh

# Thiết lập môi trường làm việc
WORKDIR /app

# Sao chép binary từ build stage
COPY --from=builder /app/management .

# Tạo thư mục uploads với quyền phù hợp
RUN mkdir -p uploads && chown -R appuser:appuser /app

# Expose cổng
EXPOSE 81

# Chạy ứng dụng sau khi PostgreSQL và Elasticsearch đã sẵn sàng
ENTRYPOINT ["/entrypoint.sh"]

