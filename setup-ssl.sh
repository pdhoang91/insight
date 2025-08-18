#!/bin/bash

# Simple SSL Setup Script
# Usage: ./setup-ssl.sh your-domain.com your-email@example.com

set -e

DOMAIN=${1:-"your-domain.com"}
EMAIL=${2:-"your-email@example.com"}

if [ "$DOMAIN" = "your-domain.com" ] || [ "$EMAIL" = "your-email@example.com" ]; then
    echo "❌ Please provide domain and email:"
    echo "Usage: ./setup-ssl.sh your-domain.com your-email@example.com"
    exit 1
fi

echo "🚀 Setting up SSL for $DOMAIN"

# Create directories
mkdir -p nginx/certs nginx/prod certbot/www certbot/conf

# Check DNS resolution
echo "🔍 Checking DNS resolution..."
DOMAIN_IP=$(dig +short www.$DOMAIN)
SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip)

echo "Domain www.$DOMAIN resolves to: $DOMAIN_IP"
echo "Server public IP: $SERVER_IP"

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "⚠️  WARNING: Domain doesn't point to this server!"
    echo "Please update DNS records:"
    echo "  $DOMAIN → $SERVER_IP"
    echo "  www.$DOMAIN → $SERVER_IP"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create production nginx config
echo "📝 Creating production nginx config..."
cat > nginx/prod/default.conf << EOF
# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=general:10m rate=30r/s;

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://www.\$host\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl;
    http2 on;
    server_name www.$DOMAIN;

    ssl_certificate /etc/nginx/certs/$DOMAIN.crt;
    ssl_certificate_key /etc/nginx/certs/$DOMAIN.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # API routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://application:81/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Images
    location /images/ {
        limit_req zone=general burst=50 nodelay;
        proxy_pass http://application:81/images/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Frontend
    location / {
        limit_req zone=general burst=50 nodelay;
        proxy_pass http://frontend:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Create production docker-compose
echo "📝 Creating production docker-compose..."
cat > docker-compose.prod.yml << 'EOF'
services:
  nginx:
    image: nginx:latest
    container_name: nginx_proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/prod:/etc/nginx/conf.d
      - ./nginx/certs:/etc/nginx/certs
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - frontend
      - application
    networks:
      - app-network
    restart: unless-stopped

  certbot:
    image: certbot/certbot:latest
    container_name: certbot
    volumes:
      - ./certbot/www:/var/www/certbot:rw
      - ./certbot/conf:/etc/letsencrypt:rw

  db:
    image: postgres:13
    container_name: database
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - app-network

  application:
    container_name: application
    build:
      context: ./backend/application
      target: runner
    expose:
      - "81"
    volumes:
      - ./backend/application/uploads:/app/uploads
    depends_on:
      - db
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=postgres
      - JWT_SECRET=${JWT_SECRET}
      - BASE_SEARCH_API_URL=http://search_service:83
      - LOG_LEVEL=INFO
    networks:
      - app-network
    restart: unless-stopped

  search-service:
    container_name: search_service
    build:
      context: ./backend/search-service
      target: runner
    expose:
      - "83"
    depends_on:
      - db
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=postgres
      - LOG_LEVEL=INFO
    networks:
      - app-network
    restart: unless-stopped

  frontend:
    container_name: frontend
    build:
      context: ./frontend
      target: runner
    expose:
      - "3000"
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge

volumes:
  db-data:
EOF

# Stop any running containers
echo "🛑 Stopping any running containers..."
docker-compose down 2>/dev/null || true

# Generate SSL certificates
echo "🔐 Generating SSL certificates..."
docker run --rm -p 80:80 \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    certbot/certbot certonly \
    --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    -d $DOMAIN \
    -d www.$DOMAIN

# Copy certificates
if [ -d "certbot/conf/live/www.$DOMAIN" ]; then
    echo "📋 Copying certificates..."
    cp certbot/conf/live/www.$DOMAIN/fullchain.pem nginx/certs/$DOMAIN.crt
    cp certbot/conf/live/www.$DOMAIN/privkey.pem nginx/certs/$DOMAIN.key
    chmod 644 nginx/certs/$DOMAIN.crt
    chmod 600 nginx/certs/$DOMAIN.key
    echo "✅ Certificates copied successfully!"
else
    echo "❌ Certificate generation failed"
    exit 1
fi

# Verify certificates
echo "🔍 Certificate info:"
openssl x509 -in nginx/certs/$DOMAIN.crt -text -noout | grep -E "(Subject:|Not After:|DNS:)" || true

echo ""
echo "🎉 SSL setup complete!"
echo "📁 Files created:"
echo "   - nginx/prod/default.conf"
echo "   - docker-compose.prod.yml"
echo "   - nginx/certs/$DOMAIN.crt"
echo "   - nginx/certs/$DOMAIN.key"
echo ""
echo "🚀 Start production with:"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "🔄 Auto-renewal cron job:"
echo "   30 2 * * * cd $(pwd) && docker-compose -f docker-compose.prod.yml run --rm certbot renew --quiet && docker-compose -f docker-compose.prod.yml restart nginx"
