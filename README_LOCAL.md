# 🚀 Insight - Local Development Setup

## 📋 Yêu cầu

- Docker & Docker Compose
- Git

## 🏃‍♂️ Chạy ứng dụng

```bash
# Clone project
git clone <your-repo-url>
cd insight

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 🌐 Truy cập

- **Frontend**: http://localhost
- **API**: http://localhost/api
- **Database**: localhost:5433 (postgres/postgres)

## 📁 Cấu trúc

```
insight/
├── docker-compose.yml          # Main compose file
├── nginx/
│   └── nginx.conf             # Nginx configuration
├── frontend/                  # Next.js frontend
├── backend/
│   ├── application/          # Go API server
│   └── search-service/       # Search service
└── README_LOCAL.md           # This file
```

## 🔧 Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart nginx

# View logs
docker-compose logs -f [service_name]

# Rebuild and start
docker-compose up -d --build

# Clean up everything
docker-compose down -v --remove-orphans
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Check what's using port 80
lsof -i :80

# Or use different port
# Edit docker-compose.yml: "8080:80"
# Then access: http://localhost:8080
```

### Database connection issues
```bash
# Check database logs
docker-compose logs db

# Reset database
docker-compose down -v
docker-compose up -d
```

### Frontend not loading
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up -d --build frontend
```

## 📊 Services

- **nginx**: Reverse proxy (port 80)
- **frontend**: Next.js app (internal port 3000)
- **application**: Go API server (internal port 81)
- **search-service**: Search API (internal port 83)
- **database**: PostgreSQL (port 5433)

## 🔐 SSL Certificate Management

### Generate/Renew SSL Certificates
```bash
# Generate SSL certificates for your domain
./generate-cert.sh your-domain.com your-email@example.com

# Example
./generate-cert.sh insight.io.vn pdhoang91@gmail.com
```

### Check Certificate Status
```bash
# Check all certificates
./check-cert.sh

# Check specific domain
./check-cert.sh insight.io.vn
```

### Remove SSL (back to HTTP-only)
```bash
# Remove SSL configuration and restore HTTP-only
./remove-ssl.sh
```

### Features:
- ✅ **No docker-compose changes needed** - Scripts handle everything
- ✅ **Automatic nginx config update** - Adds SSL support while keeping localhost HTTP
- ✅ **Let's Encrypt integration** - Free SSL certificates
- ✅ **Certificate renewal** - Run the same script to renew
- ✅ **Easy rollback** - Remove SSL anytime with one command

📖 **Chi tiết**: Xem `SSL_SETUP_GUIDE.md`

---

**🎯 Simple local development setup - có thể dễ dàng chuyển sang production với SSL!**
