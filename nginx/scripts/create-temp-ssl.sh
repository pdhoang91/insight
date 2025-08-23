#!/bin/bash

# Create Temporary SSL Certificates Script
# This script creates self-signed certificates so nginx can start without errors

set -e

DOMAIN="insight.io.vn"
CERT_DIR="./nginx/certs"

echo "=== Creating Temporary SSL Certificates ==="
echo ""

# Create certificate directory
echo "1. Creating certificate directory..."
mkdir -p "$CERT_DIR"
echo "✓ Directory created: $CERT_DIR"

# Generate temporary self-signed certificate
echo "2. Generating temporary self-signed certificate..."
openssl req -x509 -nodes -days 30 -newkey rsa:2048 \
    -keyout "$CERT_DIR/$DOMAIN.key" \
    -out "$CERT_DIR/$DOMAIN.crt" \
    -subj "/C=VN/ST=HCM/L=HCM/O=Insight/OU=IT/CN=$DOMAIN/emailAddress=admin@$DOMAIN"

# Set proper permissions
chmod 600 "$CERT_DIR/$DOMAIN.key"
chmod 644 "$CERT_DIR/$DOMAIN.crt"

echo "✓ Temporary SSL certificate created"
echo "✓ Certificate: $CERT_DIR/$DOMAIN.crt"
echo "✓ Private key: $CERT_DIR/$DOMAIN.key"

# Verify certificate
echo ""
echo "3. Verifying certificate..."
openssl x509 -in "$CERT_DIR/$DOMAIN.crt" -text -noout | grep -E "(Subject:|Not After :)"

echo ""
echo "=== Temporary SSL Setup Complete ==="
echo "⚠ This is a self-signed certificate (browsers will show warning)"
echo "⚠ Valid for 30 days only"
echo "⚠ Use ./nginx/scripts/setup-ssl.sh to get real SSL certificates"
echo ""
echo "You can now start nginx:"
echo "  docker-compose up -d nginx"
