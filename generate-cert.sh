#!/bin/bash

# SSL Certificate Generator Script
# Usage: ./generate-cert.sh domain.com email@example.com
# This script generates SSL certificates and updates nginx config without touching docker-compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Parse arguments
DOMAIN=${1:-""}
EMAIL=${2:-""}

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    log_error "Usage: ./generate-cert.sh domain.com email@example.com"
    log_info "Example: ./generate-cert.sh insight.io.vn pdhoang91@gmail.com"
    exit 1
fi

log_info "🚀 Starting SSL certificate generation for $DOMAIN"

# Create necessary directories
log_info "📁 Creating directories..."
mkdir -p nginx/certs
mkdir -p certbot/www
mkdir -p certbot/conf

# Backup current nginx config
log_info "💾 Backing up current nginx config..."
cp nginx/nginx.conf nginx/nginx.conf.backup

# Check DNS resolution
log_info "🔍 Checking DNS resolution..."
DOMAIN_IP=$(dig +short $DOMAIN 2>/dev/null || echo "")
WWW_DOMAIN_IP=$(dig +short www.$DOMAIN 2>/dev/null || echo "")
SERVER_IP=$(curl -s --max-time 10 ifconfig.me 2>/dev/null || curl -s --max-time 10 ipinfo.io/ip 2>/dev/null || echo "unknown")

echo "Domain $DOMAIN resolves to: ${DOMAIN_IP:-'not found'}"
echo "Domain www.$DOMAIN resolves to: ${WWW_DOMAIN_IP:-'not found'}"
echo "Server public IP: $SERVER_IP"

if [ "$DOMAIN_IP" != "$SERVER_IP" ] && [ "$WWW_DOMAIN_IP" != "$SERVER_IP" ]; then
    log_warning "Domain doesn't point to this server!"
    log_info "Please update DNS records:"
    log_info "  $DOMAIN → $SERVER_IP"
    log_info "  www.$DOMAIN → $SERVER_IP"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create SSL-enabled nginx config
log_info "📝 Creating SSL-enabled nginx config..."
cat > nginx/nginx.conf << EOF
# Nginx Configuration with SSL Support
# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=20r/s;
limit_req_zone \$binary_remote_addr zone=general:10m rate=50r/s;

# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN localhost;

    # ACME challenge for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files \$uri \$uri/ =404;
    }

    # Health check (for local testing)
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }

    # Redirect to HTTPS (except for localhost)
    location / {
        if (\$host != "localhost") {
            return 301 https://\$host\$request_uri;
        }
        
        # For localhost, serve normally
        limit_req zone=general burst=100 nodelay;
        
        proxy_pass http://frontend:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # API routes for localhost
    location /api/ {
        if (\$host != "localhost") {
            return 301 https://\$host\$request_uri;
        }
        
        limit_req zone=api burst=30 nodelay;
        
        proxy_pass http://application:81/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Images for localhost
    location /images/ {
        if (\$host != "localhost") {
            return 301 https://\$host\$request_uri;
        }
        
        limit_req zone=general burst=100 nodelay;
        
        proxy_pass http://application:81/images/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# HTTPS server
server {
    listen 443 ssl;
    http2 on;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Configuration
    ssl_certificate /etc/nginx/certs/$DOMAIN.crt;
    ssl_certificate_key /etc/nginx/certs/$DOMAIN.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Static files caching
    location ~* \.(js|css|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API routes
    location /api/ {
        limit_req zone=api burst=30 nodelay;
        
        proxy_pass http://application:81/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$server_name;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Images proxy
    location /images/ {
        limit_req zone=general burst=100 nodelay;
        
        proxy_pass http://application:81/images/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Frontend (Next.js)
    location / {
        limit_req zone=general burst=100 nodelay;
        
        proxy_pass http://frontend:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Update docker-compose to expose port 443
log_info "📝 Updating docker-compose to expose port 443..."
if ! grep -q "443:443" docker-compose.yml; then
    # Add port 443 after port 80
    sed -i.bak 's/- "80:80".*$/&\n     - "443:443"      # HTTPS/' docker-compose.yml
    log_success "Added port 443 to docker-compose.yml"
else
    log_info "Port 443 already exposed in docker-compose.yml"
fi

# Add certbot volume mounts if not present
if ! grep -q "certbot" docker-compose.yml; then
    log_info "Adding certbot volume mounts..."
    # Add certbot volumes after nginx config mount
    sed -i.bak '/nginx.conf/a\
     - ./certbot/www:/var/www/certbot:ro\
     - ./nginx/certs:/etc/nginx/certs:ro' docker-compose.yml
    log_success "Added certbot volume mounts"
fi

# Stop nginx temporarily for certificate generation
log_info "🛑 Stopping nginx for certificate generation..."
docker-compose stop nginx 2>/dev/null || true

# Generate SSL certificates using standalone mode
log_info "🔐 Generating SSL certificates..."
if docker run --rm -p 80:80 \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    certbot/certbot certonly \
    --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    --expand \
    -d $DOMAIN \
    -d www.$DOMAIN; then
    
    log_success "SSL certificates generated successfully!"
    
    # Copy certificates to nginx directory
    log_info "📋 Copying certificates..."
    if [ -d "certbot/conf/live/$DOMAIN" ]; then
        cp certbot/conf/live/$DOMAIN/fullchain.pem nginx/certs/$DOMAIN.crt
        cp certbot/conf/live/$DOMAIN/privkey.pem nginx/certs/$DOMAIN.key
        chmod 644 nginx/certs/$DOMAIN.crt
        chmod 600 nginx/certs/$DOMAIN.key
        log_success "Certificates copied to nginx/certs/"
    elif [ -d "certbot/conf/live/www.$DOMAIN" ]; then
        cp certbot/conf/live/www.$DOMAIN/fullchain.pem nginx/certs/$DOMAIN.crt
        cp certbot/conf/live/www.$DOMAIN/privkey.pem nginx/certs/$DOMAIN.key
        chmod 644 nginx/certs/$DOMAIN.crt
        chmod 600 nginx/certs/$DOMAIN.key
        log_success "Certificates copied to nginx/certs/"
    else
        log_error "Certificate directory not found!"
        exit 1
    fi
    
else
    log_error "Certificate generation failed!"
    log_info "Restoring original nginx config..."
    mv nginx/nginx.conf.backup nginx/nginx.conf
    exit 1
fi

# Start nginx with new SSL configuration
log_info "🚀 Starting nginx with SSL configuration..."
docker-compose up -d nginx

# Wait for nginx to start
sleep 5

# Test the configuration
log_info "🧪 Testing configuration..."
if curl -k -s -o /dev/null -w "%{http_code}" https://localhost | grep -q "200\|301\|302"; then
    log_success "HTTPS is working!"
else
    log_warning "HTTPS test failed, but certificates are installed"
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
    log_success "HTTP is working!"
else
    log_warning "HTTP test failed"
fi

# Display certificate information
log_info "🔍 Certificate information:"
if [ -f "nginx/certs/$DOMAIN.crt" ]; then
    openssl x509 -in nginx/certs/$DOMAIN.crt -text -noout | grep -E "(Subject:|Not After:|DNS:)" || true
fi

# Clean up backup
rm -f nginx/nginx.conf.backup docker-compose.yml.bak

echo ""
log_success "🎉 SSL certificate generation completed!"
echo ""
log_info "📁 Files created/updated:"
log_info "   - nginx/certs/$DOMAIN.crt (SSL certificate)"
log_info "   - nginx/certs/$DOMAIN.key (Private key)"
log_info "   - nginx/nginx.conf (Updated with SSL support)"
log_info "   - docker-compose.yml (Added port 443 and volumes)"
echo ""
log_info "🌐 Your site should now be accessible at:"
log_info "   - https://$DOMAIN"
log_info "   - https://www.$DOMAIN"
log_info "   - http://localhost (for local development)"
echo ""
log_info "🔄 To renew certificates in the future, run:"
log_info "   ./generate-cert.sh $DOMAIN $EMAIL"
echo ""
log_info "📅 Set up auto-renewal with cron:"
log_info "   30 2 * * * cd $(pwd) && ./generate-cert.sh $DOMAIN $EMAIL >/dev/null 2>&1"
