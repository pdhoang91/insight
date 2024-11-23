
FROM golang:1.22-alpine

# Thiết lập môi trường làm việc
WORKDIR /app

# Cài đặt bash để sử dụng wait-for-it.sh
RUN apk add --no-cache bash

# Sao chép wait-for-it.sh và entrypoint.sh, cấp quyền thực thi
COPY wait-for-it.sh /wait-for-it.sh
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /wait-for-it.sh /entrypoint.sh

# Sao chép go.mod và go.sum
COPY go.mod go.sum ./

# Tải các module
RUN go mod download

# Sao chép mã nguồn
COPY . .

# Build ứng dụng
RUN go build -o management .

# Expose cổng
EXPOSE 81

# Chạy ứng dụng sau khi PostgreSQL và Elasticsearch đã sẵn sàng
ENTRYPOINT ["/entrypoint.sh"]

