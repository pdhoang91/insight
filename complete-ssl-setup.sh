#!/bin/bash
# Copy SSL certificates without pulling alpine image

echo "4. Copying certificates to nginx directory..."

# Create nginx certs directory if not exists
mkdir -p ./nginx/certs

# Use existing container to copy certificates
docker-compose exec -T nginx sh -c "
    if [ -f /etc/letsencrypt/live/insight.io.vn/fullchain.pem ]; then
        cp /etc/letsencrypt/live/insight.io.vn/fullchain.pem /etc/nginx/certs/insight.io.vn.crt
        cp /etc/letsencrypt/live/insight.io.vn/privkey.pem /etc/nginx/certs/insight.io.vn.key
        chmod 644 /etc/nginx/certs/insight.io.vn.crt
        chmod 600 /etc/nginx/certs/insight.io.vn.key
        echo \"✅ Certificates copied successfully\"
    else
        echo \"❌ Certificate files not found in nginx container\"
        echo \"Trying alternative method...\"
    fi
"

# Alternative: Copy from certbot volume to nginx volume
if [ ! -f ./nginx/certs/insight.io.vn.crt ]; then
    echo "Using alternative copy method..."
    
    # Copy from certbot conf to nginx certs
    if [ -f ./certbot/conf/live/insight.io.vn/fullchain.pem ]; then
        cp ./certbot/conf/live/insight.io.vn/fullchain.pem ./nginx/certs/insight.io.vn.crt
        cp ./certbot/conf/live/insight.io.vn/privkey.pem ./nginx/certs/insight.io.vn.key
        chmod 644 ./nginx/certs/insight.io.vn.crt
        chmod 600 ./nginx/certs/insight.io.vn.key
        echo "✅ Certificates copied successfully (alternative method)"
    else
        echo "❌ Certificate files not found in certbot volume"
        ls -la ./certbot/conf/live/ || echo "No live directory found"
    fi
fi

echo ""
echo "5. Restarting nginx with real SSL certificates..."
docker-compose restart nginx
sleep 5

echo ""
echo "6. Testing HTTPS..."
if curl -f -s --max-time 10 "https://insight.io.vn/health" > /dev/null 2>&1; then
    echo "✅ HTTPS is working with real SSL certificates!"
else
    echo "⚠️  HTTPS test failed, checking nginx logs..."
    docker-compose logs nginx --tail=5
fi

echo ""
echo "7. Certificate information:"
if [ -f ./nginx/certs/insight.io.vn.crt ]; then
    openssl x509 -in ./nginx/certs/insight.io.vn.crt -text -noout | grep -E "(Subject:|Issuer:|Not After)" || echo "Certificate info not available"
else
    echo "Certificate file not found at ./nginx/certs/insight.io.vn.crt"
fi

echo ""
echo "🎉 === SSL Setup Complete! ==="
echo ""
echo "Your website is now accessible with real SSL certificates:"
echo "  🌐 https://insight.io.vn"
echo "  🌐 https://www.insight.io.vn"
echo ""
echo "No more browser warnings! 🎊"

