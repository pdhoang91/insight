#!/bin/bash

# Bootstrap SSL cho lần đầu setup — không cần sửa nginx.conf
# Cách hoạt động:
#   1. Tạo dummy self-signed cert tại đúng path nginx.conf trỏ tới
#   2. Start nginx (HTTPS block load được vì cert file đã tồn tại)
#   3. Chạy certbot lấy cert thật (nginx đang chạy, port 80 hoạt động)
#   4. Restart nginx dùng cert thật
#
# Chạy: ./nginx/scripts/init-ssl.sh

set -e

DOMAIN="insight.io.vn"
WWW_DOMAIN="www.insight.io.vn"
EMAIL="pdhoang91@gmail.com"
CERT_DIR="./certbot/conf/live/$DOMAIN"

echo "=== Init SSL cho $DOMAIN ==="
echo ""

# Kiểm tra nếu cert thật đã tồn tại thì bỏ qua bước bootstrap
if [ -f "$CERT_DIR/fullchain.pem" ]; then
    ISSUER=$(openssl x509 -in "$CERT_DIR/fullchain.pem" -noout -issuer 2>/dev/null || echo "")
    if echo "$ISSUER" | grep -qi "let's encrypt\|letsencrypt"; then
        echo "Cert Let's Encrypt đã tồn tại, bỏ qua bootstrap."
        echo "Dùng renew-ssl.sh để gia hạn."
        exit 0
    fi
    echo "Tìm thấy cert cũ (có thể là dummy), tiếp tục bootstrap..."
fi

# 1. Tạo thư mục
echo "1. Tạo thư mục..."
mkdir -p "$CERT_DIR"
mkdir -p ./certbot/www/.well-known/acme-challenge

# 2. Tạo dummy self-signed cert
echo "2. Tạo dummy cert..."
openssl req -x509 -nodes -newkey rsa:2048 \
    -keyout "$CERT_DIR/privkey.pem" \
    -out "$CERT_DIR/fullchain.pem" \
    -days 1 \
    -subj "/CN=localhost" \
    2>/dev/null
echo "   Dummy cert tạo tại $CERT_DIR"

# 3. Start nginx
echo "3. Start nginx..."
docker-compose up -d nginx
echo "   Chờ nginx ready..."
sleep 5

# Kiểm tra nginx có đang chạy không
if ! docker-compose ps nginx | grep -q "Up"; then
    echo "ERROR: Nginx không start được"
    docker-compose logs nginx
    exit 1
fi
echo "   Nginx đang chạy"

# 4. Lấy cert thật từ Let's Encrypt
echo "4. Lấy cert từ Let's Encrypt..."
docker run --rm \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    certbot/certbot certonly \
    --webroot -w /var/www/certbot \
    -d "$DOMAIN" -d "$WWW_DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive \
    --force-renewal

# Kiểm tra cert được tạo
if [ ! -f "$CERT_DIR/fullchain.pem" ]; then
    echo "ERROR: Certbot chạy xong nhưng không tìm thấy cert"
    exit 1
fi
echo "   Cert Let's Encrypt obtained"

# 5. Restart nginx dùng cert thật
echo "5. Restart nginx..."
docker-compose restart nginx
sleep 3

# 6. Test HTTPS
echo "6. Test HTTPS..."
if curl -f -s --max-time 10 "https://$DOMAIN/health" > /dev/null 2>&1; then
    echo "   HTTPS working!"
else
    echo "   HTTPS test failed (domain có thể chưa propagate DNS hoặc firewall chưa mở port 443)"
fi

# 7. Hiển thị thông tin cert
echo ""
echo "=== Cert info ==="
openssl x509 -in "$CERT_DIR/fullchain.pem" -noout \
    -subject -issuer \
    -dates 2>/dev/null

echo ""
echo "SSL setup hoàn tất!"
echo "  https://$DOMAIN"
echo "  https://$WWW_DOMAIN"
