# SSL Certificate Management Scripts

This directory contains scripts for managing SSL certificates for the Insight application.

## Scripts Overview

### 1. `create-temp-ssl.sh`
Creates temporary self-signed SSL certificates so nginx can start without errors.

**Usage:**
```bash
./nginx/scripts/create-temp-ssl.sh
```

**When to use:**
- First time setup
- When you need nginx to start immediately
- For development/testing

**Note:** Browsers will show security warnings for self-signed certificates.

### 2. `setup-ssl.sh`
Complete SSL setup script that obtains real SSL certificates from Let's Encrypt.

**Usage:**
```bash
./nginx/scripts/setup-ssl.sh
```

**Prerequisites:**
- Domain must point to your server
- Port 80 must be accessible
- Docker containers must be running

**What it does:**
- Checks domain accessibility
- Creates temporary certificates
- Starts nginx
- Obtains real SSL certificates from Let's Encrypt
- Sets up auto-renewal

### 3. `renew-ssl.sh`
Renews SSL certificates and reloads nginx configuration.

**Usage:**
```bash
# Normal renewal (only if needed)
./nginx/scripts/renew-ssl.sh

# Force renewal
./nginx/scripts/renew-ssl.sh --force

# Check if renewal is needed
./nginx/scripts/renew-ssl.sh --check
```

**Automatic renewal:**
Add to crontab to run monthly:
```bash
0 2 1 * * /path/to/your/project/nginx/scripts/renew-ssl.sh
```

### 4. `check-ssl.sh`
Comprehensive SSL certificate status checker.

**Usage:**
```bash
./nginx/scripts/check-ssl.sh
```

**What it checks:**
- Certificate file existence
- Certificate expiry date
- HTTPS connectivity
- Nginx status
- External SSL validation

## Quick Start Guide

### For First Time Setup:

1. **Create temporary certificates:**
   ```bash
   ./nginx/scripts/create-temp-ssl.sh
   ```

2. **Start your application:**
   ```bash
   docker-compose up -d
   ```

3. **Setup real SSL certificates:**
   ```bash
   ./nginx/scripts/setup-ssl.sh
   ```

### For Existing Setup:

1. **Check SSL status:**
   ```bash
   ./nginx/scripts/check-ssl.sh
   ```

2. **Renew certificates if needed:**
   ```bash
   ./nginx/scripts/renew-ssl.sh
   ```

## File Structure

```
nginx/
├── certs/                          # SSL certificate files
│   ├── insight.io.vn.crt          # SSL certificate
│   └── insight.io.vn.key          # Private key
├── logs/                           # SSL renewal logs
│   └── ssl-renewal.log            # Renewal log file
└── scripts/                       # SSL management scripts
    ├── README.md                  # This file
    ├── create-temp-ssl.sh         # Create temporary certificates
    ├── setup-ssl.sh               # Complete SSL setup
    ├── renew-ssl.sh               # Certificate renewal
    └── check-ssl.sh               # SSL status checker
```

## Troubleshooting

### Nginx won't start
```bash
# Check if certificates exist
ls -la nginx/certs/

# Create temporary certificates if missing
./nginx/scripts/create-temp-ssl.sh

# Check nginx configuration
docker-compose exec nginx nginx -t
```

### SSL certificate errors
```bash
# Check certificate status
./nginx/scripts/check-ssl.sh

# Force renewal
./nginx/scripts/renew-ssl.sh --force
```

### Domain not accessible
- Ensure DNS points to your server
- Check firewall settings (ports 80, 443)
- Verify docker containers are running

## Security Notes

- Private keys are stored with 600 permissions
- Certificates are stored with 644 permissions
- Self-signed certificates should only be used temporarily
- Real certificates from Let's Encrypt are recommended for production

## Support

For issues with SSL setup:
1. Check the logs: `./nginx/logs/ssl-renewal.log`
2. Run the SSL checker: `./nginx/scripts/check-ssl.sh`
3. Verify nginx configuration: `docker-compose exec nginx nginx -t`
