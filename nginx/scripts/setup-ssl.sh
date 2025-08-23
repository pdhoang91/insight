#!/bin/bash

# SSL Certificate Setup Script for insight.io.vn
# This script will setup SSL certificates using Let's Encrypt

set -e

DOMAIN="insight.io.vn"
WWW_DOMAIN="www.insight.io.vn"
EMAIL="your-email@example.com"  # Change this to your email

echo "=== SSL Certificate Setup for $DOMAIN ==="
echo ""

# Function to check if domain is accessible
check_domain_accessibility() {
    echo "1. Checking domain accessibility..."
    
    if curl -f -s --max-time 10 "http://$DOMAIN/health" > /dev/null 2>&1; then
        echo "✓ $DOMAIN is accessible via HTTP"
    else
        echo "✗ $DOMAIN is not accessible via HTTP"
        echo "Please ensure:"
        echo "  - Your domain DNS points to this server"
        echo "  - Docker containers are running"
        echo "  - Port 80 is open"
        exit 1
    fi
}

# Function to create directories
create_directories() {
    echo "2. Creating certificate directories..."
    
    mkdir -p ./nginx/certs
    mkdir -p ./certbot/conf
    mkdir -p ./certbot/www
    
    echo "✓ Directories created"
}

# Function to generate temporary self-signed certificates
create_temp_certificates() {
    echo "3. Creating temporary self-signed certificates..."
    
    # Create temporary certificates so nginx can start
    openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
        -keyout "./nginx/certs/$DOMAIN.key" \
        -out "./nginx/certs/$DOMAIN.crt" \
        -subj "/C=VN/ST=HCM/L=HCM/O=Insight/OU=IT/CN=$DOMAIN"
    
    echo "✓ Temporary certificates created"
}

# Function to start nginx with temporary certificates
start_nginx_temp() {
    echo "4. Starting nginx with temporary certificates..."
    
    docker-compose up -d nginx
    sleep 5
    
    if docker-compose ps nginx | grep -q "Up"; then
        echo "✓ Nginx started successfully"
    else
        echo "✗ Failed to start nginx"
        docker-compose logs nginx
        exit 1
    fi
}

# Function to obtain real SSL certificates
obtain_ssl_certificates() {
    echo "5. Obtaining SSL certificates from Let's Encrypt..."
    
    # Stop nginx temporarily
    docker-compose stop nginx
    
    # Get certificates using certbot
    docker-compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        --force-renewal \
        -d "$DOMAIN" \
        -d "$WWW_DOMAIN"
    
    if [ $? -eq 0 ]; then
        echo "✓ SSL certificates obtained successfully"
    else
        echo "✗ Failed to obtain SSL certificates"
        exit 1
    fi
}

# Function to copy certificates to nginx directory
copy_certificates() {
    echo "6. Copying certificates to nginx directory..."
    
    # Copy certificates from certbot to nginx directory
    docker run --rm -v "$(pwd)/certbot/conf:/etc/letsencrypt" -v "$(pwd)/nginx/certs:/certs" alpine:latest sh -c "
        cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /certs/$DOMAIN.crt &&
        cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /certs/$DOMAIN.key &&
        chmod 644 /certs/$DOMAIN.crt &&
        chmod 600 /certs/$DOMAIN.key
    "
    
    echo "✓ Certificates copied to nginx directory"
}

# Function to restart nginx with real certificates
restart_nginx() {
    echo "7. Restarting nginx with real SSL certificates..."
    
    docker-compose up -d nginx
    sleep 5
    
    if docker-compose ps nginx | grep -q "Up"; then
        echo "✓ Nginx restarted successfully with SSL"
    else
        echo "✗ Failed to restart nginx with SSL"
        docker-compose logs nginx
        exit 1
    fi
}

# Function to test SSL
test_ssl() {
    echo "8. Testing SSL configuration..."
    
    if curl -f -s --max-time 10 "https://$DOMAIN/health" > /dev/null 2>&1; then
        echo "✓ HTTPS is working correctly"
        echo "✓ SSL certificate is valid"
    else
        echo "⚠ HTTPS test failed, but certificates may still be valid"
        echo "Please check manually: https://$DOMAIN"
    fi
}

# Function to setup auto-renewal
setup_auto_renewal() {
    echo "9. Setting up SSL certificate auto-renewal..."
    
    # Create renewal script
    cat > ./nginx/scripts/renew-ssl.sh << 'EOF'
#!/bin/bash
# SSL Certificate Renewal Script

echo "Renewing SSL certificates..."
docker-compose run --rm certbot renew --quiet

if [ $? -eq 0 ]; then
    echo "Certificates renewed successfully"
    
    # Copy renewed certificates
    docker run --rm -v "$(pwd)/certbot/conf:/etc/letsencrypt" -v "$(pwd)/nginx/certs:/certs" alpine:latest sh -c "
        cp /etc/letsencrypt/live/insight.io.vn/fullchain.pem /certs/insight.io.vn.crt &&
        cp /etc/letsencrypt/live/insight.io.vn/privkey.pem /certs/insight.io.vn.key &&
        chmod 644 /certs/insight.io.vn.crt &&
        chmod 600 /certs/insight.io.vn.key
    "
    
    # Reload nginx
    docker-compose exec nginx nginx -s reload
    echo "Nginx reloaded with renewed certificates"
else
    echo "Certificate renewal failed"
fi
EOF
    
    chmod +x ./nginx/scripts/renew-ssl.sh
    
    echo "✓ Auto-renewal script created at ./nginx/scripts/renew-ssl.sh"
    echo "Add this to your crontab to run monthly:"
    echo "0 2 1 * * /path/to/your/project/nginx/scripts/renew-ssl.sh"
}

# Main execution
main() {
    echo "Starting SSL setup process..."
    echo "Domain: $DOMAIN"
    echo "WWW Domain: $WWW_DOMAIN"
    echo "Email: $EMAIL"
    echo ""
    
    read -p "Continue with SSL setup? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "SSL setup cancelled"
        exit 0
    fi
    
    check_domain_accessibility
    create_directories
    create_temp_certificates
    start_nginx_temp
    obtain_ssl_certificates
    copy_certificates
    restart_nginx
    test_ssl
    setup_auto_renewal
    
    echo ""
    echo "=== SSL Setup Complete! ==="
    echo "✓ Your website is now accessible via HTTPS"
    echo "✓ SSL certificates will auto-renew"
    echo "✓ HTTP traffic will redirect to HTTPS"
    echo ""
    echo "Test your website:"
    echo "  - https://$DOMAIN"
    echo "  - https://$WWW_DOMAIN"
}

# Run main function
main "$@"