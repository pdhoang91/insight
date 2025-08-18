# 🔐 SSL Setup for insight.io.vn

## 📋 Prerequisites

1. Domain `insight.io.vn` and `www.insight.io.vn` must point to your VPS IP
2. Ports 80 and 443 must be open in firewall
3. Docker and Docker Compose installed

## 🚀 SSL Certificate Generation

### Step 1: Generate SSL Certificate

```bash
# Stop nginx temporarily
docker-compose stop nginx

# Generate certificate using Let's Encrypt standalone mode
docker run --rm -p 80:80 \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    certbot/certbot certonly \
    --standalone \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    -d insight.io.vn \
    -d www.insight.io.vn
```

### Step 2: Copy Certificates

```bash
# Copy certificates to nginx directory
cp certbot/conf/live/insight.io.vn/fullchain.pem nginx/certs/insight.io.vn.crt
cp certbot/conf/live/insight.io.vn/privkey.pem nginx/certs/insight.io.vn.key

# Set proper permissions
chmod 644 nginx/certs/insight.io.vn.crt
chmod 600 nginx/certs/insight.io.vn.key
```

### Step 3: Start Services

```bash
# Start all services with SSL support
docker-compose up -d
```

## 🔄 Certificate Renewal

```bash
# Renew certificates (run monthly)
docker run --rm -p 80:80 \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    certbot/certbot renew \
    --standalone \
    --non-interactive

# Copy renewed certificates
cp certbot/conf/live/insight.io.vn/fullchain.pem nginx/certs/insight.io.vn.crt
cp certbot/conf/live/insight.io.vn/privkey.pem nginx/certs/insight.io.vn.key

# Restart nginx to use new certificates
docker-compose restart nginx
```

## 📁 Directory Structure

```
insight/
├── nginx/
│   ├── nginx.conf              # Config with SSL support
│   └── certs/                  # SSL certificates directory
│       ├── insight.io.vn.crt   # SSL certificate
│       └── insight.io.vn.key   # Private key
├── certbot/
│   ├── conf/                   # Let's Encrypt data
│   └── www/                    # ACME challenge files
└── docker-compose.yml          # Updated with SSL ports and volumes
```

## 🌐 Access

- **Local**: http://localhost (HTTP only)
- **Production**: 
  - https://insight.io.vn (redirects to www)
  - https://www.insight.io.vn (main site)
  - http://insight.io.vn (redirects to HTTPS)

## 🛠️ Troubleshooting

### Certificate generation fails
```bash
# Check DNS resolution
dig +short insight.io.vn
dig +short www.insight.io.vn

# Check if port 80 is accessible
nc -zv YOUR_SERVER_IP 80
```

### Nginx won't start with SSL
```bash
# Check if certificates exist
ls -la nginx/certs/

# Check nginx config
docker run --rm -v $(pwd)/nginx/nginx.conf:/etc/nginx/conf.d/default.conf nginx:latest nginx -t

# Check nginx logs
docker-compose logs nginx
```

### Certificate expires
```bash
# Check certificate expiry
openssl x509 -in nginx/certs/insight.io.vn.crt -text -noout | grep "Not After"

# Set up cron job for auto-renewal
# Add to crontab: 0 3 1 * * cd /path/to/insight && ./renew-cert.sh
```

## 🔒 Security Notes

- Certificates are valid for 90 days
- Auto-renewal recommended via cron job
- Private key permissions should be 600
- Use strong firewall rules
- Regular security updates recommended
