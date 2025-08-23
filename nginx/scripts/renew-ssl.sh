#!/bin/bash

# SSL Certificate Renewal Script
# This script renews SSL certificates and reloads nginx

set -e

DOMAIN="insight.io.vn"
LOG_FILE="./nginx/logs/ssl-renewal.log"

# Create log directory
mkdir -p ./nginx/logs

# Function to log messages
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to check if renewal is needed
check_renewal_needed() {
    local cert_file="./nginx/certs/$DOMAIN.crt"
    
    if [ ! -f "$cert_file" ]; then
        log "Certificate file not found, renewal needed"
        return 0
    fi
    
    # Check if certificate expires in less than 30 days
    local expiry_date=$(openssl x509 -in "$cert_file" -noout -enddate | cut -d= -f2)
    local expiry_timestamp=$(date -d "$expiry_date" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$expiry_date" +%s 2>/dev/null)
    local current_timestamp=$(date +%s)
    local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
    
    if [ $days_until_expiry -le 30 ]; then
        log "Certificate expires in $days_until_expiry days, renewal needed"
        return 0
    else
        log "Certificate is valid for $days_until_expiry more days, no renewal needed"
        return 1
    fi
}

# Function to renew certificates
renew_certificates() {
    log "Starting certificate renewal process..."
    
    # Run certbot renewal
    if docker-compose run --rm certbot renew --quiet; then
        log "Certbot renewal completed successfully"
        return 0
    else
        log "Certbot renewal failed"
        return 1
    fi
}

# Function to copy renewed certificates
copy_certificates() {
    log "Copying renewed certificates to nginx directory..."
    
    # Copy certificates from certbot to nginx directory
    if docker run --rm -v "$(pwd)/certbot/conf:/etc/letsencrypt" -v "$(pwd)/nginx/certs:/certs" alpine:latest sh -c "
        if [ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
            cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /certs/$DOMAIN.crt &&
            cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /certs/$DOMAIN.key &&
            chmod 644 /certs/$DOMAIN.crt &&
            chmod 600 /certs/$DOMAIN.key
            echo 'Certificates copied successfully'
        else
            echo 'No renewed certificates found'
            exit 1
        fi
    "; then
        log "Certificates copied successfully"
        return 0
    else
        log "Failed to copy certificates"
        return 1
    fi
}

# Function to reload nginx
reload_nginx() {
    log "Reloading nginx configuration..."
    
    # Test nginx configuration first
    if docker-compose exec nginx nginx -t; then
        log "Nginx configuration is valid"
        
        # Reload nginx
        if docker-compose exec nginx nginx -s reload; then
            log "Nginx reloaded successfully"
            return 0
        else
            log "Failed to reload nginx"
            return 1
        fi
    else
        log "Nginx configuration test failed"
        return 1
    fi
}

# Function to verify renewal
verify_renewal() {
    log "Verifying renewed certificate..."
    
    local cert_file="./nginx/certs/$DOMAIN.crt"
    
    if [ -f "$cert_file" ]; then
        local expiry_date=$(openssl x509 -in "$cert_file" -noout -enddate | cut -d= -f2)
        log "Certificate now expires: $expiry_date"
        
        # Test HTTPS connectivity
        if curl -f -s --max-time 10 "https://$DOMAIN/health" > /dev/null 2>&1; then
            log "HTTPS connectivity test passed"
            return 0
        else
            log "HTTPS connectivity test failed"
            return 1
        fi
    else
        log "Certificate file not found after renewal"
        return 1
    fi
}

# Function to send notification (optional)
send_notification() {
    local status=$1
    local message=$2
    
    # You can implement notification logic here (email, Slack, etc.)
    # For now, just log the notification
    log "NOTIFICATION: $status - $message"
    
    # Example: Send email (uncomment and configure if needed)
    # echo "$message" | mail -s "SSL Certificate Renewal $status" admin@insight.io.vn
}

# Main execution
main() {
    log "=== SSL Certificate Renewal Started ==="
    
    # Check if containers are running
    if ! docker-compose ps nginx | grep -q "Up"; then
        log "Nginx container is not running, starting it..."
        docker-compose up -d nginx
        sleep 5
    fi
    
    # Check if renewal is needed
    if ! check_renewal_needed; then
        log "No renewal needed, exiting"
        exit 0
    fi
    
    # Perform renewal
    if renew_certificates; then
        if copy_certificates; then
            if reload_nginx; then
                if verify_renewal; then
                    log "SSL certificate renewal completed successfully"
                    send_notification "SUCCESS" "SSL certificates for $DOMAIN have been renewed successfully"
                    exit 0
                else
                    log "SSL certificate renewal verification failed"
                    send_notification "WARNING" "SSL certificates were renewed but verification failed"
                    exit 1
                fi
            else
                log "SSL certificate renewal failed at nginx reload step"
                send_notification "ERROR" "SSL certificate renewal failed: nginx reload error"
                exit 1
            fi
        else
            log "SSL certificate renewal failed at certificate copy step"
            send_notification "ERROR" "SSL certificate renewal failed: certificate copy error"
            exit 1
        fi
    else
        log "SSL certificate renewal failed at certbot step"
        send_notification "ERROR" "SSL certificate renewal failed: certbot error"
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    --force)
        log "Force renewal requested"
        # Skip renewal check and force renewal
        main_force() {
            log "=== SSL Certificate Force Renewal Started ==="
            
            if ! docker-compose ps nginx | grep -q "Up"; then
                log "Nginx container is not running, starting it..."
                docker-compose up -d nginx
                sleep 5
            fi
            
            if renew_certificates; then
                if copy_certificates; then
                    if reload_nginx; then
                        if verify_renewal; then
                            log "SSL certificate force renewal completed successfully"
                            send_notification "SUCCESS" "SSL certificates for $DOMAIN have been force renewed successfully"
                        else
                            log "SSL certificate force renewal verification failed"
                            send_notification "WARNING" "SSL certificates were force renewed but verification failed"
                        fi
                    fi
                fi
            fi
        }
        main_force
        ;;
    --check)
        log "Certificate check requested"
        check_renewal_needed
        ;;
    --help)
        echo "SSL Certificate Renewal Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  (no args)  Normal renewal (only if needed)"
        echo "  --force    Force renewal even if not needed"
        echo "  --check    Check if renewal is needed"
        echo "  --help     Show this help message"
        echo ""
        echo "Log file: $LOG_FILE"
        ;;
    *)
        main
        ;;
esac
