# SSL Certificate Management Scripts

This directory contains scripts for managing SSL certificates for the Insight application.

## 🚀 Quick Start - One Script Does Everything!

### `install-ssl.sh` - Complete SSL Installation
**The only script you need!** Handles everything automatically:

```bash
# Complete SSL installation (recommended)
./nginx/scripts/install-ssl.sh
```

**What it does:**
- ✅ Creates temporary SSL certificates
- ✅ Fixes docker-compose.yml issues  
- ✅ Starts all containers
- ✅ Gets real SSL certificates from Let's Encrypt
- ✅ Sets up auto-renewal
- ✅ Tests everything

**Options:**
```bash
# Install temporary SSL only
./nginx/scripts/install-ssl.sh --temp-only

# Get real SSL certificates only (if temp SSL already installed)
./nginx/scripts/install-ssl.sh --real-only

# Show help
./nginx/scripts/install-ssl.sh --help
```

## Other Scripts

### `check-ssl.sh` - SSL Status Checker
Check your SSL certificate status and website accessibility.

```bash
./nginx/scripts/check-ssl.sh
```

### `renew-ssl.sh` - Certificate Renewal
Automatically created by `install-ssl.sh`. Renews SSL certificates.

```bash
./nginx/scripts/renew-ssl.sh
```

## 🎯 Complete Setup Guide

### Step 1: Run the installer
```bash
cd /root/workspace/insight
./nginx/scripts/install-ssl.sh
```

### Step 2: That's it! 
The script handles everything automatically:
- Creates temporary certificates so nginx can start
- Fixes any docker-compose issues
- Tries to get real SSL certificates
- Sets up auto-renewal

### Step 3: Check status
```bash
./nginx/scripts/check-ssl.sh
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
