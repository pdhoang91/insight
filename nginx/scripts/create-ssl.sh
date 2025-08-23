#!/bin/bash

# Tạo SSL certificates cho insight.io.vn
# Chạy: ./nginx/scripts/create-ssl.sh

set -e

DOMAIN="insight.io.vn"
WWW_DOMAIN="www.insight.io.vn"
EMAIL="pdhoang91@gmail.com"

echo "🔧 === Tạo SSL cho $DOMAIN ==="
echo ""

# 1. Tạo thư mục cần thiết
echo "1. Tạo thư mục..."
mkdir -p ./nginx/certs
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# 2. Start nginx
echo "2. Khởi động nginx..."
docker-compose up -d nginx
sleep 5

# 3. Test ACME challenge path
echo "3. Test ACME challenge..."
echo "test123" > ./certbot/www/.well-known/acme-challenge/test
mkdir -p ./certbot/www/.well-known/acme-challenge/

if curl -f -s "http://$DOMAIN/.well-known/acme-challenge/test" | grep -q "test123" 2>/dev/null; then
    echo "✅ ACME challenge path working"
    rm -f ./certbot/www/.well-known/acme-challenge/test
else
    echo "⚠️  ACME challenge path not working, tạo temporary SSL..."
    
    # Tạo temporary SSL
    openssl req -x509 -nodes -days 30 -newkey rsa:2048 \
        -keyout "./nginx/certs/$DOMAIN.key" \
        -out "./nginx/certs/$DOMAIN.crt" \
        -subj "/C=VN/ST=HCM/L=HCM/O=Insight/OU=IT/CN=$DOMAIN/emailAddress=$EMAIL"
    
    chmod 600 "./nginx/certs/$DOMAIN.key"
    chmod 644 "./nginx/certs/$DOMAIN.crt"
    
    echo "✅ Temporary SSL created"
    docker-compose restart nginx
    exit 0
fi

# 4. Lấy real SSL certificates
echo "4. Lấy SSL từ Let's Encrypt..."
if docker-compose run --rm --entrypoint="" certbot certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d "$DOMAIN" \
    -d "$WWW_DOMAIN"; then
    
    echo "✅ SSL certificates obtained"
    
    # 5. Copy certificates
    echo "5. Copy certificates..."
    if [ -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
        cp "./certbot/conf/live/$DOMAIN/fullchain.pem" "./nginx/certs/$DOMAIN.crt"
        cp "./certbot/conf/live/$DOMAIN/privkey.pem" "./nginx/certs/$DOMAIN.key"
        chmod 644 "./nginx/certs/$DOMAIN.crt"
        chmod 600 "./nginx/certs/$DOMAIN.key"
        echo "✅ Certificates copied"
    else
        echo "❌ Certificate files not found"
        exit 1
    fi
    
    # 6. Restart nginx
    echo "6. Restart nginx..."
    docker-compose restart nginx
    sleep 3
    
    # 7. Test HTTPS
    echo "7. Test HTTPS..."
    if curl -f -s --max-time 10 "https://$DOMAIN/health" > /dev/null 2>&1; then
        echo "✅ HTTPS working!"
    else
        echo "⚠️  HTTPS test failed"
    fi
    
    # 8. Show certificate info
    echo ""
    echo "📋 Certificate info:"
    openssl x509 -in "./nginx/certs/$DOMAIN.crt" -text -noout | grep -E "(Subject:|Issuer:|Not After)"
    
    echo ""
    echo "🎉 SSL setup complete!"
    echo "🌐 https://$DOMAIN"
    echo "🌐 https://$WWW_DOMAIN"
    
else
    echo "❌ Failed to get SSL certificates"
    exit 1
fi
