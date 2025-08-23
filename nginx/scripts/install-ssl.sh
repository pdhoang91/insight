#!/bin/bash

# Complete SSL Installation Script for insight.io.vn
# This script handles everything: temporary certs, real certs, and auto-renewal
# Run on VPS: ./nginx/scripts/install-ssl.sh

set -e

DOMAIN="insight.io.vn"
WWW_DOMAIN="www.insight.io.vn"
EMAIL="pdhoang91@gmail.com"

echo "🚀 === Complete SSL Installation for $DOMAIN ==="
echo ""

# Function to create temporary SSL certificates
create_temp_ssl() {
    echo "📋 Step 1: Creating temporary SSL certificates..."
    
    mkdir -p ./nginx/certs
    
    if [ -f "./nginx/certs/$DOMAIN.crt" ]; then
        echo "✅ SSL certificates already exist"
        return 0
    fi
    
    openssl req -x509 -nodes -days 30 -newkey rsa:2048 \
        -keyout "./nginx/certs/$DOMAIN.key" \
        -out "./nginx/certs/$DOMAIN.crt" \
        -subj "/C=VN/ST=HCM/L=HCM/O=Insight/OU=IT/CN=$DOMAIN/emailAddress=$EMAIL"
    
    chmod 600 "./nginx/certs/$DOMAIN.key"
    chmod 644 "./nginx/certs/$DOMAIN.crt"
    
    echo "✅ Temporary SSL certificates created"
}

# Function to fix docker-compose certbot command
fix_docker_compose() {
    echo ""
    echo "🔧 Step 2: Fixing docker-compose.yml..."
    
    if grep -q 'command: \["sh"' docker-compose.yml 2>/dev/null; then
        cp docker-compose.yml docker-compose.yml.backup
        
        # Fix certbot command
        sed -i.bak 's/command: \["sh", "-c", "echo.*$/entrypoint: \/bin\/sh\n    command: ["-c", "echo '\''Certbot service ready for SSL certificate operations'\'' \&\& sleep infinity"]/' docker-compose.yml
        
        echo "✅ Fixed certbot command in docker-compose.yml"
    else
        echo "✅ Docker-compose.yml already correct"
    fi
}

# Function to start containers with temporary SSL
start_with_temp_ssl() {
    echo ""
    echo "🐳 Step 3: Starting containers with temporary SSL..."
    
    # Stop containers
    docker-compose down 2>/dev/null || true
    
    # Rebuild search-service to fix unaccent issue
    echo "🔨 Rebuilding search-service..."
    docker-compose build search-service
    
    # Start all containers
    docker-compose up -d
    
    # Wait for containers to be ready
    echo "⏳ Waiting for containers to be ready..."
    sleep 15
    
    # Check nginx status
    if docker-compose ps nginx | grep -q "Up"; then
        echo "✅ Nginx started successfully with temporary SSL"
    else
        echo "❌ Nginx failed to start"
        docker-compose logs nginx --tail=10
        exit 1
    fi
}

# Function to check domain accessibility
check_domain() {
    echo ""
    echo "🌐 Step 4: Checking domain accessibility..."
    
    # Check HTTP access
    if curl -f -s --max-time 10 "http://$DOMAIN/health" > /dev/null 2>&1; then
        echo "✅ $DOMAIN is accessible via HTTP"
        return 0
    else
        echo "⚠️  $DOMAIN is not accessible via HTTP"
        echo "This is normal if DNS hasn't propagated yet"
        echo "You can still proceed with temporary SSL"
        return 1
    fi
}

# Function to get real SSL certificates
get_real_ssl() {
    echo ""
    echo "🔐 Step 5: Getting real SSL certificates from Let's Encrypt..."
    
    # Create certbot directories
    mkdir -p ./certbot/conf
    mkdir -p ./certbot/www
    
    # Stop nginx temporarily
    echo "🛑 Stopping nginx temporarily..."
    docker-compose stop nginx
    
    # Get SSL certificates
    echo "📜 Requesting SSL certificates..."
    if docker-compose run --rm --entrypoint="" certbot certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        --force-renewal \
        -d "$DOMAIN" \
        -d "$WWW_DOMAIN"; then
        
        echo "✅ SSL certificates obtained successfully"
        
        # Copy certificates to nginx directory
        echo "📋 Copying certificates..."
        docker run --rm \
            -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
            -v "$(pwd)/nginx/certs:/certs" \
            alpine:latest sh -c "
                cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /certs/$DOMAIN.crt &&
                cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /certs/$DOMAIN.key &&
                chmod 644 /certs/$DOMAIN.crt &&
                chmod 600 /certs/$DOMAIN.key
            "
        
        echo "✅ Real SSL certificates installed"
        
    else
        echo "⚠️  Failed to get real SSL certificates"
        echo "Will continue with temporary certificates"
    fi
    
    # Start nginx again
    echo "🚀 Starting nginx..."
    docker-compose up -d nginx
    sleep 5
}

# Function to setup auto-renewal
setup_auto_renewal() {
    echo ""
    echo "🔄 Step 6: Setting up SSL auto-renewal..."
    
    # Create renewal script
    cat > ./nginx/scripts/renew-ssl.sh << 'EOF'
#!/bin/bash
# SSL Certificate Renewal Script

DOMAIN="insight.io.vn"
LOG_FILE="./nginx/logs/ssl-renewal.log"

mkdir -p ./nginx/logs

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log "Starting SSL certificate renewal..."

# Renew certificates
if docker-compose run --rm --entrypoint="" certbot certbot renew --quiet; then
    log "Certificates renewed successfully"
    
    # Copy renewed certificates
    docker run --rm \
        -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
        -v "$(pwd)/nginx/certs:/certs" \
        alpine:latest sh -c "
            if [ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
                cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /certs/$DOMAIN.crt &&
                cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /certs/$DOMAIN.key &&
                chmod 644 /certs/$DOMAIN.crt &&
                chmod 600 /certs/$DOMAIN.key
            fi
        "
    
    # Reload nginx
    docker-compose exec nginx nginx -s reload
    log "Nginx reloaded with renewed certificates"
else
    log "Certificate renewal failed"
fi
EOF
    
    chmod +x ./nginx/scripts/renew-ssl.sh
    
    echo "✅ Auto-renewal script created"
    echo "📅 Add to crontab: 0 2 1 * * $(pwd)/nginx/scripts/renew-ssl.sh"
}

# Function to test SSL
test_ssl() {
    echo ""
    echo "🧪 Step 7: Testing SSL configuration..."
    
    # Check certificate files
    if [ -f "./nginx/certs/$DOMAIN.crt" ] && [ -f "./nginx/certs/$DOMAIN.key" ]; then
        echo "✅ Certificate files exist"
        
        # Show certificate info
        echo "📋 Certificate details:"
        openssl x509 -in "./nginx/certs/$DOMAIN.crt" -text -noout | grep -E "(Subject:|Issuer:|Not After :)" | sed 's/^/  /'
    else
        echo "❌ Certificate files missing"
        return 1
    fi
    
    # Test HTTPS connectivity
    if curl -f -s --max-time 10 "https://$DOMAIN/health" > /dev/null 2>&1; then
        echo "✅ HTTPS is working correctly"
    else
        echo "⚠️  HTTPS test failed (may be due to self-signed certificate or DNS)"
    fi
    
    # Check nginx status
    if docker-compose ps nginx | grep -q "Up"; then
        echo "✅ Nginx is running"
    else
        echo "❌ Nginx is not running"
        return 1
    fi
}

# Function to show final status
show_final_status() {
    echo ""
    echo "🎉 === SSL Installation Complete ==="
    echo ""
    echo "📊 Final Status:"
    echo "  🌐 Domain: $DOMAIN"
    echo "  📧 Email: $EMAIL"
    echo "  🔐 SSL: Installed"
    echo "  🔄 Auto-renewal: Configured"
    echo ""
    echo "🌍 Your website is accessible at:"
    echo "  • http://$DOMAIN (redirects to HTTPS)"
    echo "  • https://$DOMAIN"
    echo "  • https://$WWW_DOMAIN"
    echo ""
    
    # Check if using self-signed or real certificate
    if openssl x509 -in "./nginx/certs/$DOMAIN.crt" -text -noout | grep -q "Issuer.*CN=$DOMAIN"; then
        echo "⚠️  Currently using self-signed certificate (browser will show warning)"
        echo "🔄 To get real certificate, ensure domain is accessible and run this script again"
    else
        echo "✅ Using real SSL certificate from Let's Encrypt"
        echo "🎊 No browser warnings!"
    fi
    
    echo ""
    echo "📝 Useful commands:"
    echo "  • Check SSL status: ./nginx/scripts/check-ssl.sh"
    echo "  • Renew SSL: ./nginx/scripts/renew-ssl.sh"
    echo "  • View logs: docker-compose logs nginx"
}

# Main execution
main() {
    echo "Starting complete SSL installation..."
    echo "Domain: $DOMAIN"
    echo "Email: $EMAIL"
    echo ""
    
    # Always create temp SSL first
    create_temp_ssl
    
    # Fix docker-compose if needed
    fix_docker_compose
    
    # Start containers with temp SSL
    start_with_temp_ssl
    
    # Check domain accessibility
    if check_domain; then
        # Domain is accessible, get real SSL
        get_real_ssl
    else
        echo "⚠️  Domain not accessible yet, using temporary SSL"
        echo "🔄 Run this script again when domain is accessible for real SSL"
    fi
    
    # Setup auto-renewal
    setup_auto_renewal
    
    # Test SSL
    test_ssl
    
    # Show final status
    show_final_status
}

# Handle script arguments
case "${1:-}" in
    --temp-only)
        echo "🔧 Installing temporary SSL only..."
        create_temp_ssl
        fix_docker_compose
        start_with_temp_ssl
        test_ssl
        echo "✅ Temporary SSL installation complete"
        ;;
    --real-only)
        echo "🔐 Getting real SSL certificates only..."
        if check_domain; then
            get_real_ssl
            test_ssl
        else
            echo "❌ Domain not accessible, cannot get real SSL"
            exit 1
        fi
        ;;
    --help)
        echo "SSL Installation Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  (no args)    Complete SSL installation"
        echo "  --temp-only  Install temporary SSL only"
        echo "  --real-only  Get real SSL certificates only"
        echo "  --help       Show this help message"
        ;;
    *)
        main
        ;;
esac
