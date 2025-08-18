# 🔐 SSL Setup Guide cho Production

> **Lưu ý**: Hướng dẫn này chỉ dành cho khi bạn muốn deploy lên production server với domain thật.

## 📋 Yêu cầu

- VPS/Server với IP public
- Domain đã trỏ về IP server
- Port 80 và 443 đã mở trong firewall

## 🚀 Bước 1: Chuẩn bị Production Config

### Tạo nginx config cho production:

```bash
mkdir -p nginx/prod
```

Tạo file `nginx/prod/default.conf`:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # ACME challenge for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://www.your-domain.com$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl;
    http2 on;
    server_name www.your-domain.com;

    ssl_certificate /etc/nginx/certs/your-domain.crt;
    ssl_certificate_key /etc/nginx/certs/your-domain.key;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # API routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://application:81/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
    }

    # Images proxy
    location /images/ {
        limit_req zone=general burst=50 nodelay;
        
        proxy_pass http://application:81/images/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        limit_req zone=general burst=50 nodelay;
        
        proxy_pass http://frontend:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Tạo docker-compose.prod.yml:

```yaml
services:
  nginx:
    image: nginx:latest
    container_name: nginx_proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/prod:/etc/nginx/conf.d
      - ./nginx/certs:/etc/nginx/certs
      - ./certbot/www:/var/www/certbot:ro
      - ./certbot/conf:/etc/letsencrypt:ro
    depends_on:
      - frontend
      - application
    networks:
      - app-network
    restart: unless-stopped

  certbot:
    image: certbot/certbot:latest
    container_name: certbot
    volumes:
      - ./certbot/www:/var/www/certbot:rw
      - ./certbot/conf:/etc/letsencrypt:rw

  # ... (copy other services from docker-compose.yml)

networks:
  app-network:
    driver: bridge

volumes:
  db-data:
```

## 🔐 Bước 2: Setup SSL Certificate

### Tạo script setup SSL:

```bash
#!/bin/bash
# setup-ssl.sh

set -e

DOMAIN="your-domain.com"
EMAIL="your-email@example.com"

echo "🚀 Setting up SSL for $DOMAIN"

# Create directories
mkdir -p nginx/certs certbot/www certbot/conf

# Check DNS
DOMAIN_IP=$(dig +short www.$DOMAIN)
SERVER_IP=$(curl -s ifconfig.me)

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "⚠️  Domain www.$DOMAIN ($DOMAIN_IP) doesn't point to this server ($SERVER_IP)"
    echo "Please update DNS records first!"
    exit 1
fi

# Stop any running containers
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Generate certificates using standalone mode
echo "🔐 Generating SSL certificates..."
docker run --rm -p 80:80 \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    certbot/certbot certonly \
    --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    -d $DOMAIN \
    -d www.$DOMAIN

# Copy certificates
if [ -d "certbot/conf/live/www.$DOMAIN" ]; then
    cp certbot/conf/live/www.$DOMAIN/fullchain.pem nginx/certs/$DOMAIN.crt
    cp certbot/conf/live/www.$DOMAIN/privkey.pem nginx/certs/$DOMAIN.key
    chmod 644 nginx/certs/$DOMAIN.crt
    chmod 600 nginx/certs/$DOMAIN.key
    echo "✅ Certificates copied successfully!"
else
    echo "❌ Certificate generation failed"
    exit 1
fi

echo "🚀 SSL setup complete! Start production with:"
echo "  docker-compose -f docker-compose.prod.yml up -d"
```

## 🛠️ Bước 3: Deploy lên Production

### 1. Chuẩn bị server:

```bash
# Cài Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Mở firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Cập nhật DNS:

Tại nhà cung cấp domain, tạo A records:
- `your-domain.com` → `YOUR_SERVER_IP`
- `www.your-domain.com` → `YOUR_SERVER_IP`

### 3. Deploy:

```bash
# Clone project
git clone <your-repo> insight
cd insight

# Cập nhật domain trong configs
sed -i 's/your-domain.com/actual-domain.com/g' nginx/prod/default.conf
sed -i 's/your-email@example.com/actual-email@example.com/g' setup-ssl.sh

# Setup SSL
chmod +x setup-ssl.sh
./setup-ssl.sh

# Start production
docker-compose -f docker-compose.prod.yml up -d
```

## 🔄 Bước 4: Auto-renewal SSL

Tạo cron job để tự động renew:

```bash
# Mở crontab
crontab -e

# Thêm dòng này (chạy mỗi ngày 2:30 AM)
30 2 * * * cd /path/to/insight && docker-compose -f docker-compose.prod.yml run --rm certbot renew --quiet && docker-compose -f docker-compose.prod.yml restart nginx
```

## 🚨 Troubleshooting

### Lỗi "Connection refused":
1. Kiểm tra DNS: `dig +short www.your-domain.com`
2. Kiểm tra firewall: `sudo ufw status`
3. Kiểm tra port: `nc -zv your-server-ip 80`

### Certificate không generate được:
1. Đảm bảo domain trỏ đúng IP
2. Đảm bảo port 80 không bị block
3. Thử standalone mode trước

### Nginx không start:
1. Kiểm tra config: `nginx -t`
2. Kiểm tra certificates tồn tại
3. Xem logs: `docker-compose logs nginx`

---

## 📝 Quick Commands

```bash
# Generate SSL certificates
./setup-ssl.sh

# Start production
docker-compose -f docker-compose.prod.yml up -d

# Renew certificates
docker-compose -f docker-compose.prod.yml run --rm certbot renew

# Check certificate expiry
openssl x509 -in nginx/certs/your-domain.crt -text -noout | grep "Not After"

# Test SSL
curl -I https://www.your-domain.com
```

**🎯 Với hướng dẫn này, bạn có thể dễ dàng setup SSL cho production khi cần!**
