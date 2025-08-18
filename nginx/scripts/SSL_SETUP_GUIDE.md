# SSL Certificate Setup Guide for Insight.io.vn

This guide will help you set up SSL certificates for your Insight platform using Let's Encrypt (free SSL certificates).

## 🚀 Quick Setup

### Prerequisites
- Domain `insight.io.vn` pointing to your server's IP address
- Docker and Docker Compose installed
- Nginx service running and accessible via HTTP
- Port 80 and 443 open on your server

### Step 1: Run the SSL Setup Script

```bash
# Make scripts executable
chmod +x scripts/setup-ssl.sh
chmod +x scripts/setup-ssl-renewal.sh

# Generate SSL certificate (replace with your email)
./scripts/setup-ssl.sh your-email@domain.com insight.io.vn
```

### Step 2: Setup Auto-Renewal

```bash
# Setup automatic renewal (runs twice daily)
./scripts/setup-ssl-renewal.sh
```

### Step 3: Restart Services

```bash
# Restart nginx to load SSL certificates
docker-compose restart nginx

# Test HTTPS
curl -I https://insight.io.vn/health
```

## 📋 Detailed Setup Process

### 1. Domain Configuration

Ensure your domain is properly configured:

```bash
# Check DNS resolution
dig insight.io.vn
dig www.insight.io.vn

# Test HTTP accessibility
curl -I http://insight.io.vn/health
```

### 2. Directory Structure

The SSL setup creates the following structure:

```
insight/
├── scripts/
│   ├── setup-ssl.sh              # Initial SSL setup
│   ├── setup-ssl-renewal.sh      # Auto-renewal setup
│   ├── renew-ssl.sh              # Renewal script (auto-generated)
│   └── check-ssl-expiry.sh       # Expiry monitoring (auto-generated)
├── certbot/
│   ├── conf/                     # Let's Encrypt configuration
│   └── www/                      # ACME challenge files
└── nginx/
    └── certs/
        ├── insight.io.vn.crt     # SSL certificate
        └── insight.io.vn.key     # Private key
```

### 3. Manual Certificate Generation

If the automated script fails, you can generate certificates manually:

```bash
# Create directories
mkdir -p certbot/conf certbot/www nginx/certs

# Generate certificate using Docker
docker run --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@domain.com \
  --agree-tos \
  --no-eff-email \
  -d insight.io.vn \
  -d www.insight.io.vn

# Copy certificates to nginx directory
cp certbot/conf/live/insight.io.vn/fullchain.pem nginx/certs/insight.io.vn.crt
cp certbot/conf/live/insight.io.vn/privkey.pem nginx/certs/insight.io.vn.key

# Set proper permissions
chmod 644 nginx/certs/insight.io.vn.crt
chmod 600 nginx/certs/insight.io.vn.key
```

## 🔄 Certificate Renewal

### Automatic Renewal (Recommended)

The setup script configures automatic renewal that runs twice daily:

```bash
# Check renewal status (systemd)
sudo systemctl status ssl-renewal.timer

# Check renewal status (cron)
crontab -l | grep ssl

# View renewal logs
tail -f /var/log/ssl-renewal.log
```

### Manual Renewal

```bash
# Test renewal (dry run)
./scripts/renew-ssl.sh --dry-run

# Force renewal
docker run --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot renew --force-renewal

# Copy new certificates
cp certbot/conf/live/insight.io.vn/fullchain.pem nginx/certs/insight.io.vn.crt
cp certbot/conf/live/insight.io.vn/privkey.pem nginx/certs/insight.io.vn.key

# Restart nginx
docker-compose restart nginx
```

## 🔍 Monitoring & Troubleshooting

### Check Certificate Status

```bash
# Check certificate expiry
./scripts/check-ssl-expiry.sh

# View certificate details
openssl x509 -text -noout -in nginx/certs/insight.io.vn.crt

# Test SSL configuration
curl -I https://insight.io.vn
openssl s_client -connect insight.io.vn:443 -servername insight.io.vn
```

### Common Issues

#### 1. Domain Not Accessible
```bash
# Check DNS
nslookup insight.io.vn

# Check if nginx is running
docker ps | grep nginx

# Check nginx logs
docker-compose logs nginx
```

#### 2. Certificate Generation Failed
```bash
# Check Let's Encrypt logs
docker run --rm -v $(pwd)/certbot/conf:/etc/letsencrypt certbot/certbot logs

# Try standalone mode (stops nginx temporarily)
docker stop nginx_proxy
docker run --rm -p 80:80 -v $(pwd)/certbot/conf:/etc/letsencrypt certbot/certbot certonly --standalone -d insight.io.vn
docker start nginx_proxy
```

#### 3. Certificate Not Loading
```bash
# Check file permissions
ls -la nginx/certs/

# Check nginx configuration
docker-compose exec nginx nginx -t

# Restart nginx
docker-compose restart nginx
```

## 🛡️ Security Best Practices

### 1. Certificate Permissions
```bash
# Ensure proper permissions
chmod 644 nginx/certs/*.crt
chmod 600 nginx/certs/*.key
```

### 2. Backup Certificates
```bash
# Create backup
tar -czf ssl-backup-$(date +%Y%m%d).tar.gz certbot/ nginx/certs/

# Store backup securely (off-server)
```

### 3. Monitor Expiry
```bash
# Add monitoring to cron
echo "0 9 * * 1 $(pwd)/scripts/check-ssl-expiry.sh | mail -s 'SSL Certificate Status' admin@insight.io.vn" | crontab -
```

## 📊 SSL Configuration Details

### Nginx SSL Settings
The nginx configuration includes:
- TLS 1.2 and 1.3 support
- Strong cipher suites
- HSTS headers
- Security headers (XSS, CSRF protection)
- Perfect Forward Secrecy

### Certificate Details
- **Type**: Let's Encrypt (Domain Validated)
- **Validity**: 90 days
- **Domains**: insight.io.vn, www.insight.io.vn
- **Auto-renewal**: Every 60 days
- **Algorithm**: RSA 2048-bit or ECDSA P-256

## 🔧 Advanced Configuration

### Custom SSL Settings
Edit `nginx/nginx.conf` to customize SSL settings:

```nginx
# Add custom SSL settings
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# Add security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
```

### Multiple Domains
To add more domains to the certificate:

```bash
# Edit the setup script and add domains
./scripts/setup-ssl.sh your-email@domain.com insight.io.vn -d www.insight.io.vn -d api.insight.io.vn
```

## 📞 Support

If you encounter issues:

1. **Check logs**: `docker-compose logs nginx`
2. **Verify DNS**: `dig insight.io.vn`
3. **Test connectivity**: `curl -I http://insight.io.vn/health`
4. **Validate nginx config**: `docker-compose exec nginx nginx -t`

For Let's Encrypt specific issues, check their [documentation](https://letsencrypt.org/docs/).

---

## 🎉 Success!

Once setup is complete, your site will be accessible at:
- **HTTPS**: https://insight.io.vn
- **HTTPS**: https://www.insight.io.vn
- **HTTP**: Automatically redirects to HTTPS

The certificates will automatically renew every 60 days, ensuring continuous SSL protection for your Insight platform.
