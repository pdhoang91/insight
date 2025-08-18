#!/bin/bash

# Simple SSL Certificate Generator for insight.io.vn
# Usage: ./generate-ssl.sh your-email@example.com

set -e

EMAIL=${1:-""}

if [ -z "$EMAIL" ]; then
    echo "❌ Please provide email address:"
    echo "Usage: ./generate-ssl.sh your-email@example.com"
    exit 1
fi

echo "🚀 Generating SSL certificate for insight.io.vn"
echo "Email: $EMAIL"

# Create directories
mkdir -p nginx/certs certbot/conf certbot/www

# Stop nginx if running
echo "🛑 Stopping nginx..."
docker-compose stop nginx 2>/dev/null || true

# Generate certificate
echo "🔐 Generating SSL certificate..."
docker run --rm -p 80:80 \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    certbot/certbot certonly \
    --standalone \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    -d insight.io.vn \
    -d www.insight.io.vn

# Copy certificates
echo "📋 Copying certificates..."
if [ -d "certbot/conf/live/insight.io.vn" ]; then
    cp certbot/conf/live/insight.io.vn/fullchain.pem nginx/certs/insight.io.vn.crt
    cp certbot/conf/live/insight.io.vn/privkey.pem nginx/certs/insight.io.vn.key
    chmod 644 nginx/certs/insight.io.vn.crt
    chmod 600 nginx/certs/insight.io.vn.key
    echo "✅ Certificates copied successfully!"
else
    echo "❌ Certificate generation failed!"
    exit 1
fi

# Start services
echo "🚀 Starting services with SSL..."
docker-compose up -d

echo ""
echo "🎉 SSL setup complete!"
echo "🌐 Your site should be accessible at:"
echo "   - https://insight.io.vn"
echo "   - https://www.insight.io.vn"
echo "   - http://localhost (for local development)"
echo ""
echo "📅 Certificate expires in 90 days"
echo "🔄 To renew: ./generate-ssl.sh $EMAIL"
