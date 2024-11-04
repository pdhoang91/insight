## Dockerfile
#FROM golang:1.22-alpine
#
## Thiết lập môi trường làm việc
#WORKDIR /app
#
## Cài đặt bash để sử dụng wait-for-it.sh
#RUN apk add --no-cache bash
#
## Sao chép wait-for-it.sh và cấp quyền thực thi
#COPY wait-for-it.sh /wait-for-it.sh
#RUN chmod +x /wait-for-it.sh
#
## Sao chép go.mod và go.sum
#COPY go.mod go.sum ./
#
## Tải các module
#RUN go mod download
#
## Sao chép mã nguồn
## Sao chép mã nguồn
#COPY . .
#
## Build ứng dụng
#RUN go build -o main .
#
## Chạy ứng dụng sau khi PostgreSQL đã sẵn sàng
#CMD ["/wait-for-it.sh", "db:5432", "--", "./main"]

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
RUN go build -o main .

# Chạy ứng dụng sau khi PostgreSQL và Elasticsearch đã sẵn sàng
ENTRYPOINT ["/entrypoint.sh"]

