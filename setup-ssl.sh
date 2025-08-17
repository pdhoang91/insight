#!/bin/bash

# SSL Setup Script for www.insight.io.vn
# This script helps setup SSL certificates using Let's Encrypt

set -e

echo "🚀 Setting up SSL certificates for www.insight.io.vn"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p nginx/certs
mkdir -p certbot/www
mkdir -p certbot/conf

# Check if domain is properly pointed to this server
echo "🔍 Checking domain resolution..."
DOMAIN_IP=$(dig +short www.insight.io.vn)
SERVER_IP=$(curl -s ifconfig.me)

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "⚠️  WARNING: Domain www.insight.io.vn ($DOMAIN_IP) doesn't point to this server ($SERVER_IP)"
    echo "Please update your DNS records before continuing."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create temporary nginx config for certificate generation
echo "📝 Creating temporary nginx config..."
cat > nginx/conf.d/temp.conf << 'EOF'
server {
    listen 80;
    server_name insight.io.vn www.insight.io.vn;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF

# Start nginx temporarily for certificate generation
echo "🔧 Starting temporary nginx..."
docker-compose -f docker-compose.prod.yml up -d nginx

# Wait for nginx to be ready
sleep 5

# Generate SSL certificates
echo "🔐 Generating SSL certificates..."
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email pdhoang91@gmail.com \
    --agree-tos \
    --no-eff-email \
    -d www.insight.io.vn \
    -d insight.io.vn

# Copy certificates to nginx certs directory
echo "📋 Copying certificates..."
docker cp certbot:/etc/letsencrypt/live/www.insight.io.vn/fullchain.pem nginx/certs/insight.io.vn.crt
docker cp certbot:/etc/letsencrypt/live/www.insight.io.vn/privkey.pem nginx/certs/insight.io.vn.key

# Remove temporary config
rm nginx/conf.d/temp.conf

# Stop temporary nginx
docker-compose -f docker-compose.prod.yml down

echo "✅ SSL certificates generated successfully!"
echo "📁 Certificates are stored in:"
echo "   - nginx/certs/insight.io.vn.crt"
echo "   - nginx/certs/insight.io.vn.key"
echo ""
echo "🚀 You can now start the production environment with:"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "🔄 To renew certificates, run:"
echo "   docker-compose -f docker-compose.prod.yml run --rm certbot renew"
