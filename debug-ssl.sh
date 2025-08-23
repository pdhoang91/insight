#!/bin/bash
# Debug SSL issues - Tại sao browser vẫn báo "Not secure"

DOMAIN="insight.io.vn"

echo "🔍 === Debug SSL Issues ==="
echo ""

echo "1. Kiểm tra certificate hiện tại:"
if [ -f "./nginx/certs/$DOMAIN.crt" ]; then
    echo "Certificate details:"
    openssl x509 -in "./nginx/certs/$DOMAIN.crt" -text -noout | grep -E "(Subject:|Issuer:|Not After|DNS:)" | sed "s/^/  /"
    
    echo ""
    echo "Certificate type:"
    if openssl x509 -in "./nginx/certs/$DOMAIN.crt" -text -noout | grep -q "Issuer.*CN=$DOMAIN"; then
        echo "  ❌ SELF-SIGNED certificate (causes browser warnings)"
    elif openssl x509 -in "./nginx/certs/$DOMAIN.crt" -text -noout | grep -q "Issuer.*Let's Encrypt"; then
        echo "  ✅ Let's Encrypt certificate (should be trusted)"
    else
        echo "  ⚠️  Unknown certificate type"
    fi
else
    echo "  ❌ No certificate file found"
fi

echo ""
echo "2. Kiểm tra Let's Encrypt certificates:"
if [ -d "./certbot/conf/live/$DOMAIN" ]; then
    echo "  ✅ Let's Encrypt certificates exist"
    echo "  Certificate details:"
    openssl x509 -in "./certbot/conf/live/$DOMAIN/fullchain.pem" -text -noout | grep -E "(Subject:|Issuer:|Not After)" | sed "s/^/    /"
else
    echo "  ❌ No Let's Encrypt certificates found"
fi

echo ""
echo "3. So sánh certificates:"
if [ -f "./nginx/certs/$DOMAIN.crt" ] && [ -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    NGINX_HASH=$(openssl x509 -in "./nginx/certs/$DOMAIN.crt" -noout -fingerprint -sha256)
    CERTBOT_HASH=$(openssl x509 -in "./certbot/conf/live/$DOMAIN/fullchain.pem" -noout -fingerprint -sha256)
    
    if [ "$NGINX_HASH" = "$CERTBOT_HASH" ]; then
        echo "  ✅ Nginx đang dùng Let's Encrypt certificate"
    else
        echo "  ❌ Nginx KHÔNG dùng Let's Encrypt certificate"
        echo "  Nginx:   $NGINX_HASH"
        echo "  Certbot: $CERTBOT_HASH"
        echo ""
        echo "  🔧 FIX: Copy Let's Encrypt certificate to nginx"
    fi
fi

echo ""
echo "4. Test HTTPS từ server:"
curl -I "https://$DOMAIN/health" 2>&1 | head -5

echo ""
echo "5. Test certificate chain:"
echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -issuer -subject

echo ""
echo "📋 === Possible Issues ==="
echo ""
echo "❌ Browser shows \"Not secure\" because:"
echo "  1. Using self-signed certificate (most common)"
echo "  2. Certificate expired"
echo "  3. Wrong domain in certificate"
echo "  4. Mixed content (HTTP resources on HTTPS page)"
echo "  5. Certificate chain incomplete"
echo ""
echo "🔧 === Solutions ==="
echo ""
echo "If using self-signed certificate:"
echo "  ./nginx/scripts/create-ssl.sh"
echo ""
echo "If Let's Encrypt cert exists but not used:"
echo "  cp ./certbot/conf/live/$DOMAIN/fullchain.pem ./nginx/certs/$DOMAIN.crt"
echo "  cp ./certbot/conf/live/$DOMAIN/privkey.pem ./nginx/certs/$DOMAIN.key"
echo "  docker-compose restart nginx"

