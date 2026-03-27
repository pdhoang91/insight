#!/bin/bash

# Gia hạn SSL certificates
# Chạy: ./nginx/scripts/renew-ssl.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

DOMAIN="insight.io.vn"
CERT_DIR="./certbot/conf/live/$DOMAIN"
LOG_FILE="./nginx/logs/ssl-renewal.log"

mkdir -p ./nginx/logs

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

echo "=== Gia hạn SSL cho $DOMAIN ==="
echo ""

log "Starting SSL certificate renewal..."

# 1. Renew certificates
echo "1. Gia hạn certificates..."
docker run --rm \
    -v "$PROJECT_ROOT/certbot/conf:/etc/letsencrypt" \
    -v "$PROJECT_ROOT/certbot/www:/var/www/certbot" \
    certbot/certbot renew

# Kiểm tra cert tồn tại (certbot có thể skip nếu chưa đến hạn)
if [ ! -f "$CERT_DIR/fullchain.pem" ]; then
    echo "ERROR: Certificate files not found tại $CERT_DIR"
    log "ERROR: Certificate files not found"
    exit 1
fi

log "Certificates renewed (or already up to date)"
echo "   Certificates up to date"

# 2. Reload nginx (cert được mount trực tiếp từ ./certbot/conf)
echo "2. Reload nginx..."
if docker-compose exec nginx nginx -s reload 2>/dev/null; then
    echo "   Nginx reloaded"
    log "Nginx reloaded successfully"
else
    echo "   Nginx reload failed, restarting..."
    docker compose restart nginx
    sleep 3
    log "Nginx restarted"
fi

# 3. Test HTTPS
echo "3. Test HTTPS..."
if curl -f -s --max-time 10 "https://$DOMAIN/health" > /dev/null 2>&1; then
    echo "   HTTPS working"
    log "HTTPS test successful"
else
    echo "   HTTPS test failed"
    log "WARNING: HTTPS test failed"
fi

echo ""
echo "=== Cert info ==="
openssl x509 -in "$CERT_DIR/fullchain.pem" -noout -dates 2>/dev/null

echo ""
echo "SSL renewal hoàn tất!"
log "SSL renewal completed successfully"
