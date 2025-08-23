#!/bin/bash
echo "🔍 Checking SSL certificate status..."

echo ""
echo "1. Checking certbot certificates:"
ls -la ./certbot/conf/live/ 2>/dev/null || echo "No certbot live directory"

if [ -d "./certbot/conf/live/insight.io.vn" ]; then
    echo ""
    echo "2. Let's Encrypt certificate found:"
    ls -la ./certbot/conf/live/insight.io.vn/
    
    echo ""
    echo "3. Let's Encrypt certificate details:"
    openssl x509 -in ./certbot/conf/live/insight.io.vn/fullchain.pem -text -noout | grep -E "(Subject:|Issuer:|Not After)" 2>/dev/null || echo "Cannot read LE certificate"
    
    echo ""
    echo "4. Copying Let's Encrypt certificates to nginx:"
    cp ./certbot/conf/live/insight.io.vn/fullchain.pem ./nginx/certs/insight.io.vn.crt
    cp ./certbot/conf/live/insight.io.vn/privkey.pem ./nginx/certs/insight.io.vn.key
    chmod 644 ./nginx/certs/insight.io.vn.crt
    chmod 600 ./nginx/certs/insight.io.vn.key
    
    echo "✅ Let's Encrypt certificates copied"
    
    echo ""
    echo "5. Verifying copied certificate:"
    openssl x509 -in ./nginx/certs/insight.io.vn.crt -text -noout | grep -E "(Subject:|Issuer:|Not After)"
    
    echo ""
    echo "6. Restarting nginx:"
    docker-compose restart nginx
    sleep 3
    
    echo ""
    echo "7. Testing HTTPS:"
    curl -I https://insight.io.vn/health 2>/dev/null || echo "HTTPS test failed"
    
else
    echo "❌ Let's Encrypt certificates not found!"
    echo "Checking what we have:"
    find ./certbot -name "*.pem" 2>/dev/null || echo "No .pem files found"
fi

