#!/bin/bash

# Improved SSL Setup Script for www.insight.io.vn
# This script helps setup SSL certificates using Let's Encrypt with better error handling

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
SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || curl -s icanhazip.com)

echo "Domain www.insight.io.vn resolves to: $DOMAIN_IP"
echo "Server public IP: $SERVER_IP"

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "❌ CRITICAL: Domain www.insight.io.vn ($DOMAIN_IP) doesn't point to this server ($SERVER_IP)"
    echo ""
    echo "🔧 Please update your DNS records:"
    echo "1. Set A record for insight.io.vn to $SERVER_IP"
    echo "2. Set A record for www.insight.io.vn to $SERVER_IP"
    echo ""
    echo "Wait for DNS propagation (can take up to 24 hours) then run this script again."
    echo ""
    read -p "Do you want to continue anyway for testing? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check firewall and ports
echo "🔍 Checking firewall and ports..."
if command -v ufw >/dev/null 2>&1; then
    echo "UFW status:"
    sudo ufw status | grep -E "(80|443)" || echo "Ports 80/443 not explicitly allowed"
    echo ""
    echo "To allow ports, run:"
    echo "  sudo ufw allow 80/tcp"
    echo "  sudo ufw allow 443/tcp"
fi

# Stop any running containers first
echo "🛑 Stopping any running containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Create minimal nginx config for ACME challenge only
echo "📝 Creating minimal nginx config for ACME challenge..."
cat > nginx/conf.d/acme-challenge.conf << 'EOF'
server {
    listen 80 default_server;
    server_name _;
    
    # ACME challenge location - this is what Let's Encrypt needs
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files $uri $uri/ =404;
        allow all;
    }
    
    # Health check for testing
    location /health {
        return 200 'ACME Challenge Server Ready';
        add_header Content-Type text/plain;
    }
    
    # Block everything else during setup
    location / {
        return 503 'SSL Setup in Progress';
        add_header Content-Type text/plain;
    }
}
EOF

# Update docker-compose to use the ACME challenge config
echo "🔧 Starting minimal nginx for ACME challenge..."
docker run -d \
    --name nginx_acme_challenge \
    --network host \
    -v "$(pwd)/nginx/conf.d/acme-challenge.conf:/etc/nginx/conf.d/default.conf:ro" \
    -v "$(pwd)/certbot/www:/var/www/certbot:ro" \
    nginx:latest

# Wait for nginx to be ready
echo "⏳ Waiting for nginx to be ready..."
sleep 5

# Test nginx is responding
echo "🧪 Testing nginx accessibility..."
for i in {1..5}; do
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo "✅ Nginx is accessible locally"
        break
    else
        echo "⏳ Attempt $i/5: Waiting for nginx..."
        sleep 2
    fi
    
    if [ $i -eq 5 ]; then
        echo "❌ Nginx is not accessible locally after 5 attempts"
        docker logs nginx_acme_challenge
        docker stop nginx_acme_challenge && docker rm nginx_acme_challenge
        exit 1
    fi
done

# Test external accessibility
echo "🌐 Testing external accessibility..."
if curl -f --connect-timeout 10 http://$SERVER_IP/health > /dev/null 2>&1; then
    echo "✅ Nginx is accessible externally"
else
    echo "⚠️  Warning: Nginx might not be accessible externally"
    echo "This could be due to:"
    echo "1. Firewall blocking port 80"
    echo "2. Cloud provider security groups"
    echo "3. Network configuration"
    echo ""
    echo "Let's Encrypt needs to access http://$SERVER_IP/.well-known/acme-challenge/"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        docker stop nginx_acme_challenge && docker rm nginx_acme_challenge
        exit 1
    fi
fi

# Prompt for email
read -p "Enter your email for Let's Encrypt notifications: " EMAIL
if [ -z "$EMAIL" ]; then
    echo "❌ Email is required for Let's Encrypt"
    docker stop nginx_acme_challenge && docker rm nginx_acme_challenge
    exit 1
fi

# Generate SSL certificates using standalone certbot
echo "🔐 Generating SSL certificates..."
echo "This may take a few minutes..."

# Stop nginx temporarily for standalone mode
docker stop nginx_acme_challenge

# Try standalone mode first (easier)
if docker run --rm \
    --network host \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    certbot/certbot certonly \
    --standalone \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --preferred-challenges http \
    -d www.insight.io.vn \
    -d insight.io.vn; then
    
    echo "✅ Certificates generated successfully with standalone mode"
    
else
    echo "⚠️  Standalone mode failed, trying webroot mode..."
    
    # Restart nginx for webroot mode
    docker start nginx_acme_challenge
    sleep 3
    
    # Try webroot mode
    if docker run --rm \
        -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
        -v "$(pwd)/certbot/www:/var/www/certbot" \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d www.insight.io.vn \
        -d insight.io.vn; then
        
        echo "✅ Certificates generated successfully with webroot mode"
    else
        echo "❌ Both standalone and webroot modes failed"
        echo ""
        echo "Common issues:"
        echo "1. Domain not pointing to this server"
        echo "2. Port 80 blocked by firewall"
        echo "3. Another service using port 80"
        echo "4. DNS not fully propagated"
        echo ""
        echo "Please check the error messages above and try again"
        docker stop nginx_acme_challenge && docker rm nginx_acme_challenge
        exit 1
    fi
fi

# Clean up temporary nginx
docker stop nginx_acme_challenge && docker rm nginx_acme_challenge

# Check if certificates were generated
if [ -d "certbot/conf/live/www.insight.io.vn" ]; then
    echo "📋 Copying certificates..."
    cp certbot/conf/live/www.insight.io.vn/fullchain.pem nginx/certs/insight.io.vn.crt
    cp certbot/conf/live/www.insight.io.vn/privkey.pem nginx/certs/insight.io.vn.key
    chmod 644 nginx/certs/insight.io.vn.crt
    chmod 600 nginx/certs/insight.io.vn.key
    echo "✅ Certificates copied successfully"
else
    echo "❌ Certificate generation failed - certificates not found"
    exit 1
fi

# Remove temporary config
rm nginx/conf.d/acme-challenge.conf

echo ""
echo "🎉 SSL certificates generated successfully!"
echo "📁 Certificates are stored in:"
echo "   - nginx/certs/insight.io.vn.crt"
echo "   - nginx/certs/insight.io.vn.key"
echo ""
echo "🚀 You can now start the production environment with:"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "🔄 To renew certificates, run:"
echo "   docker-compose -f docker-compose.prod.yml run --rm certbot renew"
echo ""
echo "📅 Certificates expire in 90 days. Set up auto-renewal with cron:"
echo "   30 2 * * * cd $(pwd) && docker-compose -f docker-compose.prod.yml run --rm certbot renew --quiet && docker-compose -f docker-compose.prod.yml restart nginx"
