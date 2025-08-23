#!/bin/bash

# Script to fix all VPS issues
# Run this on your VPS: ./fix-vps-issues.sh

set -e

echo "=== Fixing VPS Issues ==="
echo ""

# Step 1: Create temporary SSL certificates
echo "1. Creating temporary SSL certificates..."
if [ ! -f "./nginx/certs/insight.io.vn.crt" ]; then
    ./nginx/scripts/create-temp-ssl.sh
    echo "✓ Temporary SSL certificates created"
else
    echo "✓ SSL certificates already exist"
fi

# Step 2: Fix docker-compose.yml certbot command
echo ""
echo "2. Fixing certbot command in docker-compose.yml..."
if grep -q 'command: \["sh"' docker-compose.yml; then
    # Backup original file
    cp docker-compose.yml docker-compose.yml.backup
    
    # Fix certbot command
    sed -i 's/command: \["sh", "-c", "echo.*$/entrypoint: \/bin\/sh\n    command: ["-c", "echo '\''Certbot service ready for SSL certificate operations'\'' \&\& sleep infinity"]/' docker-compose.yml
    
    echo "✓ Fixed certbot command in docker-compose.yml"
else
    echo "✓ Certbot command already fixed"
fi

# Step 3: Stop all containers
echo ""
echo "3. Stopping containers..."
docker-compose down

# Step 4: Rebuild search-service
echo ""
echo "4. Rebuilding search-service with fixed unaccent function..."
docker-compose build search-service

# Step 5: Start all containers
echo ""
echo "5. Starting all containers..."
docker-compose up -d

# Step 6: Wait for containers to be ready
echo ""
echo "6. Waiting for containers to be ready..."
sleep 10

# Step 7: Check status
echo ""
echo "7. Checking status..."
echo ""
echo "Container status:"
docker-compose ps

echo ""
echo "SSL status:"
./nginx/scripts/check-ssl.sh

echo ""
echo "=== VPS Issues Fix Complete ==="
echo ""
echo "Your website should now be accessible:"
echo "- HTTP: http://insight.io.vn (redirects to HTTPS)"
echo "- HTTPS: https://insight.io.vn (with self-signed certificate warning)"
echo ""
echo "To get real SSL certificates, run:"
echo "./nginx/scripts/setup-ssl.sh"
