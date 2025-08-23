#!/bin/bash

# Gia hạn SSL certificates
# Chạy: ./nginx/scripts/renew-ssl.sh

set -e

DOMAIN="insight.io.vn"
LOG_FILE="./nginx/logs/ssl-renewal.log"

mkdir -p ./nginx/logs

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

echo "🔄 === Gia hạn SSL cho $DOMAIN ==="
echo ""

log "Starting SSL certificate renewal..."

# 1. Renew certificates
echo "1. Gia hạn certificates..."
if docker-compose run --rm --entrypoint="" certbot certbot renew --quiet; then
    log "Certificates renewed successfully"
    echo "✅ Certificates renewed"
    
    # 2. Copy renewed certificates
    echo "2. Copy certificates..."
    if [ -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
        cp "./certbot/conf/live/$DOMAIN/fullchain.pem" "./nginx/certs/$DOMAIN.crt"
        cp "./certbot/conf/live/$DOMAIN/privkey.pem" "./nginx/certs/$DOMAIN.key"
        chmod 644 "./nginx/certs/$DOMAIN.crt"
        chmod 600 "./nginx/certs/$DOMAIN.key"
        echo "✅ Certificates copied"
        log "Certificates copied successfully"
    else
        echo "❌ Certificate files not found"
        log "ERROR: Certificate files not found"
        exit 1
    fi
    
    # 3. Reload nginx
    echo "3. Reload nginx..."
    if docker-compose exec nginx nginx -s reload; then
        echo "✅ Nginx reloaded"
        log "Nginx reloaded successfully"
    else
        echo "⚠️  Nginx reload failed, restarting..."
        docker-compose restart nginx
        log "Nginx restarted"
    fi
    
    # 4. Test HTTPS
    echo "4. Test HTTPS..."
    if curl -f -s --max-time 10 "https://$DOMAIN/health" > /dev/null 2>&1; then
        echo "✅ HTTPS working after renewal"
        log "HTTPS test successful"
    else
        echo "⚠️  HTTPS test failed"
        log "WARNING: HTTPS test failed"
    fi
    
    echo ""
    echo "🎉 SSL renewal complete!"
    log "SSL renewal completed successfully"
    
else
    echo "❌ Certificate renewal failed"
    log "ERROR: Certificate renewal failed"
    exit 1
fi