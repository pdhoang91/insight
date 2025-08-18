#!/bin/bash

# SSL Certificate Auto-Renewal Setup Script
# Sets up automatic renewal for Let's Encrypt certificates
# Author: Generated for Insight Platform
# Usage: ./setup-ssl-renewal.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="insight.io.vn"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$NGINX_DIR")"
CERTBOT_DIR="$PROJECT_DIR/certbot"
CERTS_DIR="$NGINX_DIR/certs"

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${BLUE}=== SSL Certificate Auto-Renewal Setup ===${NC}"
echo ""

# Create renewal script
create_renewal_script() {
    print_status "Creating certificate renewal script..."
    
    cat > "$SCRIPT_DIR/renew-ssl.sh" << 'EOF'
#!/bin/bash

# SSL Certificate Renewal Script
# This script should be run by cron to automatically renew certificates

set -e

# Configuration
DOMAIN="insight.io.vn"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$NGINX_DIR")"
CERTBOT_DIR="$PROJECT_DIR/certbot"
CERTS_DIR="$NGINX_DIR/certs"
LOG_FILE="/var/log/ssl-renewal.log"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log "Starting SSL certificate renewal check..."

# Check if certificate needs renewal (30 days before expiry)
if docker run --rm \
    -v "$CERTBOT_DIR/conf:/etc/letsencrypt" \
    -v "$CERTBOT_DIR/www:/var/www/certbot" \
    certbot/certbot renew \
    --dry-run > /dev/null 2>&1; then
    
    log "Certificate renewal check passed"
    
    # Perform actual renewal
    if docker run --rm \
        -v "$CERTBOT_DIR/conf:/etc/letsencrypt" \
        -v "$CERTBOT_DIR/www:/var/www/certbot" \
        certbot/certbot renew \
        --quiet; then
        
        log "Certificate renewed successfully"
        
        # Copy new certificates
        CERT_PATH="$CERTBOT_DIR/conf/live/$DOMAIN"
        if [ -d "$CERT_PATH" ]; then
            cp "$CERT_PATH/fullchain.pem" "$CERTS_DIR/$DOMAIN.crt"
            cp "$CERT_PATH/privkey.pem" "$CERTS_DIR/$DOMAIN.key"
            chmod 644 "$CERTS_DIR/$DOMAIN.crt"
            chmod 600 "$CERTS_DIR/$DOMAIN.key"
            log "Certificates copied to nginx directory"
            
            # Reload nginx
            cd "$PROJECT_DIR"
            if docker-compose exec nginx nginx -s reload; then
                log "Nginx reloaded successfully"
            else
                log "Failed to reload nginx - restarting container"
                docker-compose restart nginx
            fi
            
            # Send notification (optional)
            log "Certificate renewal completed successfully for $DOMAIN"
            
        else
            log "ERROR: Certificate path not found: $CERT_PATH"
            exit 1
        fi
        
    else
        log "ERROR: Certificate renewal failed"
        exit 1
    fi
    
else
    log "Certificate does not need renewal yet"
fi

log "SSL renewal check completed"
EOF

    chmod +x "$SCRIPT_DIR/renew-ssl.sh"
    print_status "Renewal script created: $SCRIPT_DIR/renew-ssl.sh"
}

# Create systemd timer (for systems using systemd)
create_systemd_timer() {
    print_status "Creating systemd timer for automatic renewal..."
    
    # Create service file
    cat > /tmp/ssl-renewal.service << EOF
[Unit]
Description=Renew SSL certificates for Insight platform
After=network.target

[Service]
Type=oneshot
User=root
ExecStart=$SCRIPT_DIR/renew-ssl.sh
StandardOutput=journal
StandardError=journal
EOF

    # Create timer file
    cat > /tmp/ssl-renewal.timer << EOF
[Unit]
Description=Run SSL renewal twice daily
Requires=ssl-renewal.service

[Timer]
OnCalendar=*-*-* 02:00:00
OnCalendar=*-*-* 14:00:00
RandomizedDelaySec=3600
Persistent=true

[Install]
WantedBy=timers.target
EOF

    # Install systemd files (requires root)
    if [[ $EUID -eq 0 ]]; then
        cp /tmp/ssl-renewal.service /etc/systemd/system/
        cp /tmp/ssl-renewal.timer /etc/systemd/system/
        
        systemctl daemon-reload
        systemctl enable ssl-renewal.timer
        systemctl start ssl-renewal.timer
        
        print_status "Systemd timer installed and started"
        systemctl status ssl-renewal.timer --no-pager
    else
        print_warning "Not running as root. Systemd files created in /tmp/"
        print_warning "Please run as root to install systemd timer:"
        echo -e "${YELLOW}sudo cp /tmp/ssl-renewal.service /etc/systemd/system/${NC}"
        echo -e "${YELLOW}sudo cp /tmp/ssl-renewal.timer /etc/systemd/system/${NC}"
        echo -e "${YELLOW}sudo systemctl daemon-reload${NC}"
        echo -e "${YELLOW}sudo systemctl enable ssl-renewal.timer${NC}"
        echo -e "${YELLOW}sudo systemctl start ssl-renewal.timer${NC}"
    fi
}

# Setup cron job (alternative to systemd)
setup_cron() {
    print_status "Setting up cron job for SSL renewal..."
    
    CRON_JOB="0 2,14 * * * $SCRIPT_DIR/renew-ssl.sh >> /var/log/ssl-renewal.log 2>&1"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "renew-ssl.sh"; then
        print_warning "Cron job already exists"
    else
        # Add cron job
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        print_status "Cron job added: runs twice daily at 2:00 AM and 2:00 PM"
    fi
    
    # Show current cron jobs
    print_status "Current cron jobs:"
    crontab -l | grep -E "(renew-ssl|ssl-renewal)" || print_warning "No SSL renewal cron jobs found"
}

# Create log rotation configuration
setup_log_rotation() {
    print_status "Setting up log rotation..."
    
    cat > /tmp/ssl-renewal-logrotate << EOF
/var/log/ssl-renewal.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOF

    if [[ $EUID -eq 0 ]]; then
        cp /tmp/ssl-renewal-logrotate /etc/logrotate.d/ssl-renewal
        print_status "Log rotation configured"
    else
        print_warning "Log rotation config created in /tmp/ssl-renewal-logrotate"
        print_warning "Please run as root: sudo cp /tmp/ssl-renewal-logrotate /etc/logrotate.d/ssl-renewal"
    fi
}

# Test renewal script
test_renewal() {
    print_status "Testing renewal script..."
    
    if [ -x "$SCRIPT_DIR/renew-ssl.sh" ]; then
        print_status "Running dry-run test..."
        if "$SCRIPT_DIR/renew-ssl.sh" --dry-run; then
            print_status "Renewal script test passed"
        else
            print_warning "Renewal script test failed - please check the logs"
        fi
    else
        print_error "Renewal script not found or not executable"
    fi
}

# Create monitoring script
create_monitoring_script() {
    print_status "Creating certificate monitoring script..."
    
    cat > "$SCRIPT_DIR/check-ssl-expiry.sh" << 'EOF'
#!/bin/bash

# SSL Certificate Expiry Checker
# Checks when SSL certificates expire and sends alerts

DOMAIN="insight.io.vn"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$NGINX_DIR")"
CERT_FILE="$NGINX_DIR/certs/$DOMAIN.crt"
ALERT_DAYS=30

if [ ! -f "$CERT_FILE" ]; then
    echo "ERROR: Certificate file not found: $CERT_FILE"
    exit 1
fi

# Get certificate expiry date
EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)
EXPIRY_TIMESTAMP=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_TIMESTAMP=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_TIMESTAMP - $CURRENT_TIMESTAMP) / 86400 ))

echo "Certificate for $DOMAIN expires in $DAYS_UNTIL_EXPIRY days ($EXPIRY_DATE)"

if [ $DAYS_UNTIL_EXPIRY -le $ALERT_DAYS ]; then
    echo "WARNING: Certificate expires in $DAYS_UNTIL_EXPIRY days!"
    echo "Please ensure auto-renewal is working or renew manually."
    exit 1
else
    echo "Certificate is valid for $DAYS_UNTIL_EXPIRY more days"
    exit 0
fi
EOF

    chmod +x "$SCRIPT_DIR/check-ssl-expiry.sh"
    print_status "Certificate monitoring script created: $SCRIPT_DIR/check-ssl-expiry.sh"
}

# Main execution
main() {
    echo -e "${BLUE}Setting up SSL certificate auto-renewal...${NC}"
    echo ""
    
    create_renewal_script
    create_monitoring_script
    
    # Choose between systemd timer or cron
    if systemctl --version > /dev/null 2>&1; then
        print_status "Systemd detected"
        read -p "Use systemd timer for renewal? (recommended) (Y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            create_systemd_timer
        else
            setup_cron
        fi
    else
        print_status "Systemd not available, using cron"
        setup_cron
    fi
    
    setup_log_rotation
    
    echo ""
    echo -e "${GREEN}=== Auto-Renewal Setup Summary ===${NC}"
    echo -e "${GREEN}✅ Renewal script created: $SCRIPT_DIR/renew-ssl.sh${NC}"
    echo -e "${GREEN}✅ Monitoring script created: $SCRIPT_DIR/check-ssl-expiry.sh${NC}"
    echo -e "${GREEN}✅ Automatic renewal configured (runs twice daily)${NC}"
    echo -e "${GREEN}✅ Log rotation configured${NC}"
    echo ""
    echo -e "${YELLOW}Manual commands:${NC}"
    echo -e "${YELLOW}• Test renewal: $SCRIPT_DIR/renew-ssl.sh${NC}"
    echo -e "${YELLOW}• Check expiry: $SCRIPT_DIR/check-ssl-expiry.sh${NC}"
    echo -e "${YELLOW}• View logs: tail -f /var/log/ssl-renewal.log${NC}"
    echo ""
    
    # Test the setup
    read -p "Would you like to test the renewal script now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        test_renewal
    fi
}

main "$@"
