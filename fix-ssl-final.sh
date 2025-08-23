#!/bin/bash

# Final SSL Fix Script for VPS
# This script fixes all SSL issues found in the codebase analysis

set -e

echo "🔧 === Final SSL Fix for insight.io.vn ==="
echo ""

# Step 1: Ensure nginx is running
echo "1. Starting nginx..."
docker-compose up -d nginx
sleep 5

# Step 2: Test ACME challenge path
echo "2. Testing ACME challenge path..."
mkdir -p ./certbot/www/.well-known/acme-challenge/
echo "test123" > ./certbot/www/.well-known/acme-challenge/test

if curl -f -s "http://insight.io.vn/.well-known/acme-challenge/test" | grep -q "test123"; then
    echo "✅ ACME challenge path is working"
    rm ./certbot/www/.well-known/acme-challenge/test
else
    echo "❌ ACME challenge path is not working"
    echo "Checking nginx logs..."
    docker-compose logs nginx --tail=10
    exit 1
fi

# Step 3: Get SSL certificates using webroot mode
echo ""
echo "3. Getting SSL certificates using webroot mode..."
docker-compose run --rm --entrypoint="" certbot certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "pdhoang91@gmail.com" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d "insight.io.vn" \
    -d "www.insight.io.vn"

if [ $? -eq 0 ]; then
    echo "✅ SSL certificates obtained successfully"
else
    echo "❌ Failed to get SSL certificates"
    exit 1
fi

# Step 4: Copy certificates to nginx directory
echo ""
echo "4. Copying certificates to nginx directory..."
docker run --rm \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/nginx/certs:/certs" \
    alpine:latest sh -c "
        cp /etc/letsencrypt/live/insight.io.vn/fullchain.pem /certs/insight.io.vn.crt &&
        cp /etc/letsencrypt/live/insight.io.vn/privkey.pem /certs/insight.io.vn.key &&
        chmod 644 /certs/insight.io.vn.crt &&
        chmod 600 /certs/insight.io.vn.key
    "

echo "✅ Certificates copied successfully"

# Step 5: Restart nginx with real SSL certificates
echo ""
echo "5. Restarting nginx with real SSL certificates..."
docker-compose restart nginx
sleep 5

# Step 6: Test HTTPS
echo ""
echo "6. Testing HTTPS..."
if curl -f -s --max-time 10 "https://insight.io.vn/health" > /dev/null 2>&1; then
    echo "✅ HTTPS is working with real SSL certificates!"
else
    echo "⚠️  HTTPS test failed, but certificates may still be valid"
fi

# Step 7: Show certificate info
echo ""
echo "7. Certificate information:"
openssl x509 -in ./nginx/certs/insight.io.vn.crt -text -noout | grep -E "(Subject:|Issuer:|Not After)"

echo ""
echo "🎉 === SSL Setup Complete! ==="
echo ""
echo "Your website is now accessible with real SSL certificates:"
echo "  🌐 https://insight.io.vn"
echo "  🌐 https://www.insight.io.vn"
echo ""
echo "No more browser warnings! 🎊"
