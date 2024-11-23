# Sử dụng Go image với Alpine làm base
FROM golang:1.22-alpine

# Cài đặt các thư viện cần thiết
RUN apk --no-cache add git build-base libwebp-dev

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép go.mod và go.sum
COPY go.mod go.sum ./

# Tải các module
RUN go mod download

# Sao chép mã nguồn
COPY . .

# Build ứng dụng
RUN go build -o image-service .

# Tạo thư mục uploads
RUN mkdir -p /uploads

# Expose cổng
EXPOSE 82

# Chạy ứng dụng
CMD ["./image-service"]
