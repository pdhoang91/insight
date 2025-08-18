#!/bin/bash

# Remove SSL Script
# This script removes SSL configuration and restores HTTP-only setup

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

log_info "🔄 Removing SSL configuration and restoring HTTP-only setup..."

# Restore original nginx config
log_info "📝 Restoring original nginx configuration..."
cat > nginx/nginx.conf << 'EOF'
# Simple Nginx Configuration for Local Development
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=20r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=50r/s;

server {
    listen 80;
    server_name localhost;

    # Basic security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Static files caching (short for development)
    location ~* \.(js|css|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1h;
        add_header Cache-Control "public";
        access_log off;
    }

    # API routes
    location /api/ {
        limit_req zone=api burst=30 nodelay;
        
        proxy_pass http://application:81/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Development timeout settings
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Images proxy
    location /images/ {
        limit_req zone=general burst=100 nodelay;
        
        proxy_pass http://application:81/images/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend (Next.js)
    location / {
        limit_req zone=general burst=100 nodelay;
        
        proxy_pass http://frontend:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Development timeout settings
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
EOF

# Remove port 443 from docker-compose.yml
log_info "📝 Removing port 443 from docker-compose.yml..."
if grep -q "443:443" docker-compose.yml; then
    sed -i.bak '/443:443/d' docker-compose.yml
    log_success "Removed port 443 from docker-compose.yml"
fi

# Remove certbot volume mounts
log_info "📝 Removing certbot volume mounts..."
if grep -q "certbot" docker-compose.yml; then
    sed -i.bak '/certbot/d' docker-compose.yml
    sed -i.bak '/nginx\/certs/d' docker-compose.yml
    log_success "Removed certbot volume mounts"
fi

# Clean up backup files
rm -f docker-compose.yml.bak

# Ask if user wants to remove certificates
read -p "Do you want to remove SSL certificates? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "🗑️  Removing SSL certificates..."
    rm -rf nginx/certs certbot
    log_success "SSL certificates removed"
else
    log_info "SSL certificates preserved in nginx/certs/ and certbot/"
fi

# Restart nginx
log_info "🔄 Restarting nginx with HTTP-only configuration..."
docker-compose restart nginx

# Wait for nginx to start
sleep 3

# Test the configuration
log_info "🧪 Testing HTTP configuration..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
    log_success "HTTP is working!"
else
    log_warning "HTTP test failed"
fi

echo ""
log_success "🎉 SSL configuration removed successfully!"
echo ""
log_info "🌐 Your site is now accessible at:"
log_info "   - http://localhost"
echo ""
log_info "📁 Configuration restored to HTTP-only in:"
log_info "   - nginx/nginx.conf"
log_info "   - docker-compose.yml"
