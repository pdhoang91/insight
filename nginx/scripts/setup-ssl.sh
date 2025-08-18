#!/bin/bash

# SSL Certificate Setup Script for Insight.io.vn
# Uses Let's Encrypt via Certbot in Docker
# Author: Generated for Insight Platform
# Usage: ./setup-ssl.sh [email] [domain]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DEFAULT_EMAIL="admin@insight.io.vn"
DEFAULT_DOMAIN="insight.io.vn"
ADDITIONAL_DOMAINS="www.insight.io.vn"

# Parse command line arguments
EMAIL=${1:-$DEFAULT_EMAIL}
DOMAIN=${2:-$DEFAULT_DOMAIN}

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$NGINX_DIR")"
CERTS_DIR="$NGINX_DIR/certs"
CERTBOT_DIR="$PROJECT_DIR/certbot"

echo -e "${BLUE}=== SSL Certificate Setup for $DOMAIN ===${NC}"
echo -e "${YELLOW}Email: $EMAIL${NC}"
echo -e "${YELLOW}Domain: $DOMAIN${NC}"
echo -e "${YELLOW}Additional domains: $ADDITIONAL_DOMAINS${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root (for production server)
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root. This is expected on production servers."
    else
        print_warning "Not running as root. Make sure you have proper permissions."
    fi
}

# Validate email format
validate_email() {
    if [[ ! "$EMAIL" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
        print_error "Invalid email format: $EMAIL"
        exit 1
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p "$CERTS_DIR"
    mkdir -p "$CERTBOT_DIR/www"
    mkdir -p "$CERTBOT_DIR/conf"
    
    # Set proper permissions
    chmod 755 "$CERTS_DIR"
    chmod 755 "$CERTBOT_DIR"
    
    print_status "Directories created successfully"
}

# Check if domain is accessible
check_domain_accessibility() {
    print_status "Checking domain accessibility..."
    
    # Check if domain resolves to this server
    DOMAIN_IP=$(dig +short $DOMAIN)
    if [ -z "$DOMAIN_IP" ]; then
        print_error "Domain $DOMAIN does not resolve to any IP address"
        print_error "Please ensure your DNS is properly configured"
        exit 1
    fi
    
    print_status "Domain $DOMAIN resolves to: $DOMAIN_IP"
    
    # Test HTTP connectivity (nginx should be running)
    if curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN/health" | grep -q "200"; then
        print_status "Domain is accessible via HTTP"
    else
        print_warning "Domain may not be accessible via HTTP. Ensure nginx is running."
    fi
}

# Stop nginx temporarily for standalone mode (alternative approach)
stop_nginx_if_needed() {
    if docker ps | grep -q "nginx_proxy"; then
        print_status "Stopping nginx temporarily for certificate generation..."
        docker stop nginx_proxy || true
        NGINX_WAS_RUNNING=true
    else
        NGINX_WAS_RUNNING=false
    fi
}

# Start nginx after certificate generation
start_nginx_if_needed() {
    if [ "$NGINX_WAS_RUNNING" = true ]; then
        print_status "Starting nginx..."
        docker start nginx_proxy || print_warning "Failed to start nginx automatically"
    fi
}

# Generate SSL certificate using certbot
generate_certificate() {
    print_status "Generating SSL certificate..."
    
    # Use webroot method (nginx should serve ACME challenge)
    docker run --rm \
        -v "$CERTBOT_DIR/conf:/etc/letsencrypt" \
        -v "$CERTBOT_DIR/www:/var/www/certbot" \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        --force-renewal \
        -d "$DOMAIN" \
        -d "$ADDITIONAL_DOMAINS"
    
    if [ $? -eq 0 ]; then
        print_status "Certificate generated successfully!"
    else
        print_error "Failed to generate certificate"
        
        # Fallback: try standalone mode
        print_status "Trying standalone mode..."
        stop_nginx_if_needed
        
        docker run --rm \
            -p 80:80 \
            -v "$CERTBOT_DIR/conf:/etc/letsencrypt" \
            certbot/certbot certonly \
            --standalone \
            --email "$EMAIL" \
            --agree-tos \
            --no-eff-email \
            --force-renewal \
            -d "$DOMAIN" \
            -d "$ADDITIONAL_DOMAINS"
        
        start_nginx_if_needed
        
        if [ $? -ne 0 ]; then
            print_error "Failed to generate certificate in standalone mode"
            exit 1
        fi
    fi
}

# Copy certificates to nginx directory
copy_certificates() {
    print_status "Copying certificates to nginx directory..."
    
    CERT_PATH="$CERTBOT_DIR/conf/live/$DOMAIN"
    
    if [ ! -d "$CERT_PATH" ]; then
        print_error "Certificate directory not found: $CERT_PATH"
        exit 1
    fi
    
    # Copy certificate files
    cp "$CERT_PATH/fullchain.pem" "$CERTS_DIR/$DOMAIN.crt"
    cp "$CERT_PATH/privkey.pem" "$CERTS_DIR/$DOMAIN.key"
    
    # Set proper permissions
    chmod 644 "$CERTS_DIR/$DOMAIN.crt"
    chmod 600 "$CERTS_DIR/$DOMAIN.key"
    
    print_status "Certificates copied successfully"
    print_status "Certificate: $CERTS_DIR/$DOMAIN.crt"
    print_status "Private key: $CERTS_DIR/$DOMAIN.key"
}

# Verify certificate
verify_certificate() {
    print_status "Verifying certificate..."
    
    CERT_FILE="$CERTS_DIR/$DOMAIN.crt"
    
    if [ -f "$CERT_FILE" ]; then
        EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)
        print_status "Certificate expires: $EXPIRY_DATE"
        
        # Check if certificate is valid for our domain
        if openssl x509 -noout -text -in "$CERT_FILE" | grep -q "$DOMAIN"; then
            print_status "Certificate is valid for $DOMAIN"
        else
            print_warning "Certificate may not be valid for $DOMAIN"
        fi
    else
        print_error "Certificate file not found: $CERT_FILE"
        exit 1
    fi
}

# Update docker-compose to use SSL
update_docker_compose() {
    print_status "Docker-compose is already configured for SSL"
    print_status "Make sure to restart nginx after certificate installation:"
    echo -e "${YELLOW}docker-compose restart nginx${NC}"
}

# Test HTTPS connection
test_https() {
    print_status "Testing HTTPS connection..."
    
    sleep 5  # Wait for nginx to restart
    
    if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/health" | grep -q "200"; then
        print_status "HTTPS is working correctly!"
        echo -e "${GREEN}✅ SSL setup completed successfully!${NC}"
        echo -e "${GREEN}Your site is now accessible at: https://$DOMAIN${NC}"
    else
        print_warning "HTTPS test failed. Please check nginx configuration and restart nginx."
        echo -e "${YELLOW}Try: docker-compose restart nginx${NC}"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}Starting SSL certificate setup...${NC}"
    echo ""
    
    check_permissions
    validate_email
    create_directories
    check_domain_accessibility
    generate_certificate
    copy_certificates
    verify_certificate
    update_docker_compose
    
    echo ""
    echo -e "${GREEN}=== SSL Setup Summary ===${NC}"
    echo -e "${GREEN}✅ Certificate generated for: $DOMAIN, $ADDITIONAL_DOMAINS${NC}"
    echo -e "${GREEN}✅ Certificate files copied to: $CERTS_DIR${NC}"
    echo -e "${GREEN}✅ Certificate expires: $(openssl x509 -enddate -noout -in "$CERTS_DIR/$DOMAIN.crt" | cut -d= -f2)${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "${YELLOW}1. Restart nginx: docker-compose restart nginx${NC}"
    echo -e "${YELLOW}2. Test HTTPS: curl -I https://$DOMAIN${NC}"
    echo -e "${YELLOW}3. Setup auto-renewal (run ./nginx/scripts/setup-ssl-renewal.sh)${NC}"
    echo ""
    
    # Ask if user wants to test now
    read -p "Would you like to restart nginx and test HTTPS now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restarting nginx..."
        cd "$PROJECT_DIR"
        docker-compose restart nginx
        test_https
    fi
}

# Handle script interruption
trap 'echo -e "\n${RED}Script interrupted${NC}"; start_nginx_if_needed; exit 1' INT TERM

# Run main function
main "$@"
