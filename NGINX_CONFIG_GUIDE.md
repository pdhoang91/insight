# 🔧 Nginx Configuration Guide

## 📁 **Cấu trúc thư mục nginx**

```
nginx/
├── conf.d/
│   └── default.conf          # Production config (với SSL)
├── local/
│   └── default.conf          # Local development config (không SSL)
└── certs/
    ├── insight.io.vn.crt     # SSL certificate
    └── insight.io.vn.key     # SSL private key
```

## 🚀 **Cách sử dụng**

### **Local Development:**
```bash
docker-compose up -d
# Sử dụng nginx/local/default.conf
# HTTP only, không cần SSL
# Accessible tại: http://localhost
```

### **Production:**
```bash
docker-compose -f docker-compose.prod.yml up -d
# Sử dụng nginx/conf.d/default.conf
# HTTPS với SSL certificates
# Accessible tại: https://www.insight.io.vn
```

## ⚠️ **Lỗi thường gặp và cách khắc phục**

### **1. Lỗi "limit_req_zone already bound"**

**Nguyên nhân:** Nginx load nhiều config files cùng lúc, dẫn đến duplicate `limit_req_zone` definitions.

**Giải pháp:**
- ✅ Local development: Chỉ mount `nginx/local/` directory
- ✅ Production: Chỉ mount `nginx/conf.d/` directory
- ❌ Không mount cả 2 thư mục cùng lúc

### **2. Lỗi "SSL certificate not found"**

**Nguyên nhân:** Chạy production config mà chưa có SSL certificates.

**Giải pháp:**
```bash
# Generate SSL certificates trước
./setup-ssl-improved.sh

# Hoặc dùng self-signed cho testing
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/insight.io.vn.key \
  -out nginx/certs/insight.io.vn.crt \
  -subj "/CN=www.insight.io.vn"
```

### **3. Lỗi "Connection refused" khi setup SSL**

**Nguyên nhân:** Domain chưa trỏ đúng IP hoặc firewall block port 80/443.

**Giải pháp:** Xem `SSL_TROUBLESHOOTING.md`

## 🔄 **Switching giữa Local và Production**

### **Từ Local sang Production:**
```bash
# 1. Stop local
docker-compose down

# 2. Setup SSL (nếu chưa có)
./setup-ssl-improved.sh

# 3. Start production
docker-compose -f docker-compose.prod.yml up -d
```

### **Từ Production về Local:**
```bash
# 1. Stop production
docker-compose -f docker-compose.prod.yml down

# 2. Start local
docker-compose up -d
```

## 📝 **Config Files Explained**

### **nginx/local/default.conf** (Development)
- ✅ HTTP only (port 80)
- ✅ Rate limiting
- ✅ Basic security headers
- ✅ Gzip compression
- ❌ Không có SSL
- ❌ Không có HSTS headers

### **nginx/conf.d/default.conf** (Production)
- ✅ HTTPS (port 443) + HTTP redirect
- ✅ SSL/TLS configuration
- ✅ Full security headers (HSTS, CSP, etc.)
- ✅ Rate limiting
- ✅ Gzip compression
- ✅ Static file caching
- ✅ HTTP/2 support

## 🛠️ **Customization**

### **Thay đổi Rate Limiting:**
```nginx
# Trong config file
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;     # API: 10 req/s
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s; # General: 30 req/s

# Trong location blocks
limit_req zone=api burst=20 nodelay;        # API routes
limit_req zone=general burst=50 nodelay;    # Frontend routes
```

### **Thêm Custom Headers:**
```nginx
# Trong server block
add_header X-Custom-Header "Your Value" always;
```

### **Thay đổi SSL Configuration:**
```nginx
# Stronger SSL settings
ssl_protocols TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
```

## 🔍 **Debug Commands**

```bash
# Test nginx config syntax
docker run --rm -v $(pwd)/nginx/local:/etc/nginx/conf.d nginx:latest nginx -t

# Check what config is loaded
docker exec nginx_proxy nginx -T

# Reload nginx config without restart
docker exec nginx_proxy nginx -s reload

# Check nginx processes
docker exec nginx_proxy ps aux | grep nginx
```

## 📊 **Monitoring**

### **Access Logs:**
```bash
# Real-time access logs
docker-compose logs -f nginx

# Specific log patterns
docker-compose logs nginx | grep "GET /"
docker-compose logs nginx | grep "404"
```

### **Performance Metrics:**
```bash
# Connection stats
docker exec nginx_proxy ss -tuln

# Memory usage
docker stats nginx_proxy
```

## 🎯 **Best Practices**

1. **✅ Separate configs** cho development và production
2. **✅ Use rate limiting** để protect APIs
3. **✅ Enable gzip** cho better performance
4. **✅ Set proper security headers**
5. **✅ Use HTTP/2** cho modern browsers
6. **✅ Cache static files** với proper expires headers
7. **❌ Không expose** sensitive information trong headers
8. **❌ Không hardcode** IPs trong config

---

**🚀 Happy nginx configuration!**
