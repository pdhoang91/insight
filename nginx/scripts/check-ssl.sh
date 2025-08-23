#!/bin/bash

# SSL Certificate Check Script
# This script checks the status of SSL certificates

DOMAIN="insight.io.vn"
WWW_DOMAIN="www.insight.io.vn"

echo "=== SSL Certificate Status Check ==="
echo ""

# Function to check certificate file
check_cert_file() {
    local cert_file="./nginx/certs/$DOMAIN.crt"
    local key_file="./nginx/certs/$DOMAIN.key"
    
    echo "1. Checking certificate files..."
    
    if [ -f "$cert_file" ]; then
        echo "✓ Certificate file exists: $cert_file"
        
        # Check certificate details
        echo "Certificate details:"
        openssl x509 -in "$cert_file" -text -noout | grep -E "(Subject:|Issuer:|Not Before:|Not After :)" | sed 's/^/  /'
        
        # Check if certificate is self-signed
        if openssl x509 -in "$cert_file" -text -noout | grep -q "Issuer.*CN=$DOMAIN"; then
            echo "⚠ This is a self-signed certificate"
        else
            echo "✓ This is a CA-signed certificate"
        fi
    else
        echo "✗ Certificate file not found: $cert_file"
        return 1
    fi
    
    if [ -f "$key_file" ]; then
        echo "✓ Private key file exists: $key_file"
    else
        echo "✗ Private key file not found: $key_file"
        return 1
    fi
}

# Function to check certificate expiry
check_cert_expiry() {
    local cert_file="./nginx/certs/$DOMAIN.crt"
    
    echo ""
    echo "2. Checking certificate expiry..."
    
    if [ -f "$cert_file" ]; then
        local expiry_date=$(openssl x509 -in "$cert_file" -noout -enddate | cut -d= -f2)
        local expiry_timestamp=$(date -d "$expiry_date" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$expiry_date" +%s 2>/dev/null)
        local current_timestamp=$(date +%s)
        local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
        
        echo "Certificate expires: $expiry_date"
        
        if [ $days_until_expiry -gt 30 ]; then
            echo "✓ Certificate is valid for $days_until_expiry more days"
        elif [ $days_until_expiry -gt 7 ]; then
            echo "⚠ Certificate expires in $days_until_expiry days (consider renewal)"
        elif [ $days_until_expiry -gt 0 ]; then
            echo "🚨 Certificate expires in $days_until_expiry days (renewal needed soon!)"
        else
            echo "🚨 Certificate has expired!"
        fi
    fi
}

# Function to test HTTPS connectivity
test_https_connectivity() {
    echo ""
    echo "3. Testing HTTPS connectivity..."
    
    # Test main domain
    if curl -f -s --max-time 10 "https://$DOMAIN/health" > /dev/null 2>&1; then
        echo "✓ $DOMAIN is accessible via HTTPS"
    else
        echo "✗ $DOMAIN is not accessible via HTTPS"
    fi
    
    # Test www domain
    if curl -f -s --max-time 10 "https://$WWW_DOMAIN/health" > /dev/null 2>&1; then
        echo "✓ $WWW_DOMAIN is accessible via HTTPS"
    else
        echo "✗ $WWW_DOMAIN is not accessible via HTTPS"
    fi
}

# Function to check nginx status
check_nginx_status() {
    echo ""
    echo "4. Checking nginx status..."
    
    if docker-compose ps nginx | grep -q "Up"; then
        echo "✓ Nginx container is running"
        
        # Check nginx configuration
        if docker-compose exec nginx nginx -t > /dev/null 2>&1; then
            echo "✓ Nginx configuration is valid"
        else
            echo "✗ Nginx configuration has errors"
            docker-compose exec nginx nginx -t
        fi
    else
        echo "✗ Nginx container is not running"
        echo "Start with: docker-compose up -d nginx"
    fi
}

# Function to check SSL certificate from external perspective
check_external_ssl() {
    echo ""
    echo "5. Checking SSL certificate from external perspective..."
    
    # Check certificate chain and validity
    if command -v openssl > /dev/null; then
        echo "Checking certificate chain for $DOMAIN..."
        timeout 10 openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" < /dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "Could not retrieve external certificate"
    fi
}

# Function to show renewal information
show_renewal_info() {
    echo ""
    echo "6. SSL Certificate Renewal Information..."
    
    if [ -f "./nginx/scripts/renew-ssl.sh" ]; then
        echo "✓ Auto-renewal script exists: ./nginx/scripts/renew-ssl.sh"
        echo "To manually renew: ./nginx/scripts/renew-ssl.sh"
    else
        echo "⚠ Auto-renewal script not found"
        echo "Run ./nginx/scripts/setup-ssl.sh to create it"
    fi
    
    echo ""
    echo "To set up automatic renewal, add this to your crontab:"
    echo "0 2 1 * * $(pwd)/nginx/scripts/renew-ssl.sh"
}

# Main execution
main() {
    check_cert_file
    check_cert_expiry
    test_https_connectivity
    check_nginx_status
    check_external_ssl
    show_renewal_info
    
    echo ""
    echo "=== SSL Check Complete ==="
}

# Run main function
main "$@"
