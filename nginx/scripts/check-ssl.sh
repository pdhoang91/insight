#!/bin/bash

# Kiểm tra trạng thái SSL
# Chạy: ./nginx/scripts/check-ssl.sh

DOMAIN="insight.io.vn"
WWW_DOMAIN="www.insight.io.vn"

echo "🔍 === Kiểm tra SSL cho $DOMAIN ==="
echo ""

# 1. Check certificate files
echo "1. Kiểm tra certificate files..."
if [ -f "./nginx/certs/$DOMAIN.crt" ] && [ -f "./nginx/certs/$DOMAIN.key" ]; then
    echo "✅ Certificate files exist"
    
    # Show certificate details
    echo ""
    echo "📋 Certificate details:"
    openssl x509 -in "./nginx/certs/$DOMAIN.crt" -text -noout | grep -E "(Subject:|Issuer:|Not After)" | sed 's/^/  /'
    
    # Check if self-signed or real
    if openssl x509 -in "./nginx/certs/$DOMAIN.crt" -text -noout | grep -q "Issuer.*CN=$DOMAIN"; then
        echo "⚠️  Self-signed certificate (browser warnings)"
    else
        echo "✅ Real SSL certificate (no browser warnings)"
    fi
else
    echo "❌ Certificate files missing"
    echo "   Run: ./nginx/scripts/create-ssl.sh"
fi

echo ""

# 2. Check nginx status
echo "2. Kiểm tra nginx..."
if docker-compose ps nginx | grep -q "Up"; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is not running"
    echo "   Run: docker-compose up -d nginx"
fi

echo ""

# 3. Check HTTP access
echo "3. Kiểm tra HTTP access..."
if curl -f -s --max-time 10 "http://$DOMAIN/health" > /dev/null 2>&1; then
    echo "✅ HTTP accessible: http://$DOMAIN"
else
    echo "❌ HTTP not accessible"
fi

echo ""

# 4. Check HTTPS access
echo "4. Kiểm tra HTTPS access..."
if curl -f -s --max-time 10 "https://$DOMAIN/health" > /dev/null 2>&1; then
    echo "✅ HTTPS accessible: https://$DOMAIN"
else
    echo "❌ HTTPS not accessible"
fi

if curl -f -s --max-time 10 "https://$WWW_DOMAIN/health" > /dev/null 2>&1; then
    echo "✅ HTTPS accessible: https://$WWW_DOMAIN"
else
    echo "❌ HTTPS not accessible: https://$WWW_DOMAIN"
fi

echo ""

# 5. Check ACME challenge path
echo "5. Kiểm tra ACME challenge path..."
mkdir -p ./certbot/www/.well-known/acme-challenge/
echo "test123" > ./certbot/www/.well-known/acme-challenge/test

if curl -f -s "http://$DOMAIN/.well-known/acme-challenge/test" | grep -q "test123" 2>/dev/null; then
    echo "✅ ACME challenge path working"
    rm -f ./certbot/www/.well-known/acme-challenge/test
else
    echo "❌ ACME challenge path not working"
fi

echo ""

# 6. Check certificate expiry
echo "6. Kiểm tra certificate expiry..."
if [ -f "./nginx/certs/$DOMAIN.crt" ]; then
    EXPIRY=$(openssl x509 -in "./nginx/certs/$DOMAIN.crt" -noout -enddate | cut -d= -f2)
    EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$EXPIRY" +%s 2>/dev/null || echo "0")
    CURRENT_EPOCH=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
    
    if [ $DAYS_LEFT -gt 30 ]; then
        echo "✅ Certificate expires in $DAYS_LEFT days"
    elif [ $DAYS_LEFT -gt 7 ]; then
        echo "⚠️  Certificate expires in $DAYS_LEFT days (consider renewal)"
    else
        echo "🚨 Certificate expires in $DAYS_LEFT days (URGENT renewal needed)"
    fi
else
    echo "❌ No certificate file to check"
fi

echo ""

# 7. Summary
echo "📊 === Summary ==="
echo ""

# Overall status
if [ -f "./nginx/certs/$DOMAIN.crt" ] && docker-compose ps nginx | grep -q "Up"; then
    if curl -f -s --max-time 10 "https://$DOMAIN/health" > /dev/null 2>&1; then
        echo "🎉 SSL Status: WORKING"
        echo "🌐 Website: https://$DOMAIN"
        echo "🌐 Website: https://$WWW_DOMAIN"
    else
        echo "⚠️  SSL Status: CONFIGURED but not accessible"
    fi
else
    echo "❌ SSL Status: NOT WORKING"
    echo ""
    echo "🔧 To fix:"
    echo "   1. Run: ./nginx/scripts/create-ssl.sh"
    echo "   2. Run: docker-compose up -d"
fi