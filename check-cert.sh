#!/bin/bash

# Certificate Status Checker Script
# This script checks SSL certificate status and expiry

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

DOMAIN=${1:-""}

echo "🔍 SSL Certificate Status Check"
echo "================================"

# Check if certificates exist locally
if [ -d "nginx/certs" ] && [ "$(ls -A nginx/certs)" ]; then
    log_info "📁 Local certificates found:"
    for cert in nginx/certs/*.crt; do
        if [ -f "$cert" ]; then
            cert_name=$(basename "$cert" .crt)
            log_info "Certificate: $cert_name"
            
            # Check certificate details
            echo "   Subject: $(openssl x509 -in "$cert" -noout -subject | sed 's/subject=//')"
            echo "   Issuer: $(openssl x509 -in "$cert" -noout -issuer | sed 's/issuer=//' | cut -d',' -f1)"
            echo "   Valid from: $(openssl x509 -in "$cert" -noout -startdate | sed 's/notBefore=//')"
            echo "   Valid until: $(openssl x509 -in "$cert" -noout -enddate | sed 's/notAfter=//')"
            
            # Check if certificate is expiring soon (30 days)
            if openssl x509 -in "$cert" -checkend 2592000 -noout >/dev/null 2>&1; then
                log_success "Certificate is valid for more than 30 days"
            else
                log_warning "Certificate expires within 30 days!"
            fi
            
            # Check SAN (Subject Alternative Names)
            sans=$(openssl x509 -in "$cert" -text -noout | grep -A1 "Subject Alternative Name" | tail -1 | sed 's/.*DNS://' | tr ',' '\n' | sed 's/^ *DNS://' | tr '\n' ' ')
            if [ -n "$sans" ]; then
                echo "   Domains: $sans"
            fi
            echo
        fi
    done
else
    log_info "📁 No local certificates found in nginx/certs/"
fi

# Check certbot certificates
if [ -d "certbot/conf/live" ] && [ "$(ls -A certbot/conf/live)" ]; then
    log_info "📁 Certbot certificates found:"
    for cert_dir in certbot/conf/live/*/; do
        if [ -d "$cert_dir" ]; then
            cert_name=$(basename "$cert_dir")
            log_info "Certificate: $cert_name"
            
            cert_file="$cert_dir/fullchain.pem"
            if [ -f "$cert_file" ]; then
                echo "   Subject: $(openssl x509 -in "$cert_file" -noout -subject | sed 's/subject=//')"
                echo "   Valid until: $(openssl x509 -in "$cert_file" -noout -enddate | sed 's/notAfter=//')"
                
                # Check if certificate is expiring soon
                if openssl x509 -in "$cert_file" -checkend 2592000 -noout >/dev/null 2>&1; then
                    log_success "Certificate is valid for more than 30 days"
                else
                    log_warning "Certificate expires within 30 days!"
                fi
            fi
            echo
        fi
    done
else
    log_info "📁 No certbot certificates found"
fi

# Test SSL connection if domain is provided
if [ -n "$DOMAIN" ]; then
    log_info "🌐 Testing SSL connection to $DOMAIN..."
    
    # Test HTTPS connection
    if curl -s --max-time 10 -I "https://$DOMAIN" >/dev/null 2>&1; then
        log_success "HTTPS connection to $DOMAIN successful"
        
        # Get certificate info from server
        echo "   Server certificate info:"
        echo "$(openssl s_client -connect $DOMAIN:443 -servername $DOMAIN </dev/null 2>/dev/null | openssl x509 -noout -subject -dates 2>/dev/null || echo '   Could not retrieve server certificate info')"
    else
        log_error "HTTPS connection to $DOMAIN failed"
    fi
    
    # Test www subdomain
    if curl -s --max-time 10 -I "https://www.$DOMAIN" >/dev/null 2>&1; then
        log_success "HTTPS connection to www.$DOMAIN successful"
    else
        log_warning "HTTPS connection to www.$DOMAIN failed"
    fi
fi

# Check nginx configuration
log_info "🔧 Checking nginx configuration..."
if docker-compose ps nginx | grep -q "Up"; then
    log_success "Nginx container is running"
    
    # Test nginx config
    if docker-compose exec nginx nginx -t >/dev/null 2>&1; then
        log_success "Nginx configuration is valid"
    else
        log_error "Nginx configuration has errors"
        docker-compose exec nginx nginx -t
    fi
else
    log_warning "Nginx container is not running"
fi

# Check if ports are exposed
log_info "🔌 Checking exposed ports..."
if docker-compose ps nginx | grep -q "80->80"; then
    log_success "Port 80 (HTTP) is exposed"
else
    log_warning "Port 80 (HTTP) is not exposed"
fi

if docker-compose ps nginx | grep -q "443->443"; then
    log_success "Port 443 (HTTPS) is exposed"
else
    log_info "Port 443 (HTTPS) is not exposed (HTTP-only mode)"
fi

echo
log_info "💡 Commands:"
log_info "   Generate/renew certificate: ./generate-cert.sh domain.com email@example.com"
log_info "   Remove SSL configuration: ./remove-ssl.sh"
log_info "   Check specific domain: ./check-cert.sh domain.com"
