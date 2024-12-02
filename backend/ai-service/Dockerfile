# Sử dụng Go image với Alpine làm base
FROM golang:1.23.0-alpine

# Cài đặt Chrome và dependencies
RUN apk add --no-cache \
    chromium \
    chromium-chromedriver \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn

# Set environment variables cho Chrome
ENV CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/ \
    CHROMIUM_FLAGS="--headless --no-sandbox --disable-gpu --disable-software-rasterizer --disable-dev-shm-usage"


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
RUN go build -o ai-service .


# Expose cổng
EXPOSE 86

# Chạy ứng dụng
CMD ["./ai-service"]
