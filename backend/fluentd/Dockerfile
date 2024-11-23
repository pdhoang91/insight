#fluentd/Dockerfile
FROM ruby:3.0

# Cài đặt Fluentd và các phụ thuộc
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    sudo \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Tạo người dùng fluentd
RUN adduser --system --group fluentd

# Cài đặt Fluentd
RUN gem install fluentd -v "~>1.17.1" --no-document

# Cài đặt plugin Elasticsearch và Oj cho Fluentd
RUN fluent-gem install fluent-plugin-elasticsearch oj

# Tạo các thư mục cần thiết
RUN mkdir -p /fluentd/etc /fluentd/log /fluentd/buffer

# Đặt quyền sở hữu cho Fluentd
RUN chown -R fluentd:fluentd /fluentd/log /fluentd/buffer

# Copy cấu hình Fluentd
COPY conf /fluentd/etc

# Đặt biến môi trường cho Fluentd
ENV FLUENTD_CONF=fluent.conf

# Thiết lập working directory
WORKDIR /fluentd

# Mở cổng Fluentd
EXPOSE 24224 24224/udp

# Chạy Fluentd khi container khởi động
CMD ["fluentd", "-c", "/fluentd/etc/fluent.conf", "-v"]
