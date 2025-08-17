# 🚀 Hướng dẫn Deploy www.insight.io.vn lên VPS

## 📋 Yêu cầu hệ thống

- VPS Ubuntu 20.04+ hoặc CentOS 7+
- RAM: tối thiểu 2GB (khuyến nghị 4GB+)
- Disk: tối thiểu 20GB
- Docker & Docker Compose đã cài đặt
- Domain www.insight.io.vn đã trỏ về IP server

## 🔧 Bước 1: Chuẩn bị Server

### Cài đặt Docker & Docker Compose
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Cài Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout và login lại để áp dụng group docker
```

### Cài đặt các công cụ cần thiết
```bash
sudo apt update
sudo apt install -y git curl wget htop
```

## 📁 Bước 2: Clone và Setup Project

```bash
# Clone project
git clone <your-repo-url> insight
cd insight

# Copy environment file
cp env.production .env
```

## ⚙️ Bước 3: Cấu hình Environment

Chỉnh sửa file `.env`:
```bash
nano .env
```

**Cập nhật các giá trị sau:**
```env
# Database - Đổi password mạnh
DB_PASSWORD=your_very_secure_password_here

# JWT Secret - Tạo chuỗi random 32+ ký tự
JWT_SECRET=your_jwt_secret_minimum_32_characters_here

# Google OAuth (nếu sử dụng)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AWS S3 (nếu sử dụng)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

## 🔐 Bước 4: Setup SSL Certificate

### Tự động với Let's Encrypt (Khuyến nghị)
```bash
# Chỉnh sửa email trong script
nano setup-ssl.sh
# Thay đổi: your-email@example.com thành email thật của bạn

# Chạy script setup SSL
./setup-ssl.sh
```

### Thủ công (nếu có certificate riêng)
```bash
# Copy certificate files vào thư mục nginx/certs/
cp your-certificate.crt nginx/certs/insight.io.vn.crt
cp your-private-key.key nginx/certs/insight.io.vn.key

# Set permissions
chmod 600 nginx/certs/insight.io.vn.key
chmod 644 nginx/certs/insight.io.vn.crt
```

## 🚀 Bước 5: Deploy Application

```bash
# Build và start tất cả services
docker-compose -f docker-compose.prod.yml up -d

# Kiểm tra status
docker-compose -f docker-compose.prod.yml ps

# Xem logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔍 Bước 6: Kiểm tra và Verify

### Kiểm tra services
```bash
# Kiểm tra tất cả containers
docker ps

# Test kết nối database
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d postgres -c "SELECT version();"

# Test API
curl -k https://www.insight.io.vn/api/health

# Test Frontend
curl -k https://www.insight.io.vn
```

### Kiểm tra SSL
```bash
# Test SSL certificate
openssl s_client -connect www.insight.io.vn:443 -servername www.insight.io.vn

# Hoặc dùng online tool: https://www.ssllabs.com/ssltest/
```

## 📊 Bước 7: Monitoring và Maintenance

### Xem logs
```bash
# Logs tất cả services
docker-compose -f docker-compose.prod.yml logs -f

# Logs service cụ thể
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f application
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Backup Database
```bash
# Tạo backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres postgres > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres postgres < backup_file.sql
```

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild và restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🔄 Bước 8: Setup Auto-renewal SSL

Tạo cron job để tự động renew SSL:
```bash
# Mở crontab
crontab -e

# Thêm dòng sau (chạy mỗi ngày lúc 2:30 AM)
30 2 * * * cd /path/to/insight && docker-compose -f docker-compose.prod.yml run --rm certbot renew && docker-compose -f docker-compose.prod.yml restart nginx
```

## 🛡️ Bước 9: Security Hardening

### Firewall Setup
```bash
# Ubuntu UFW
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS Firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Fail2ban (Optional)
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 🚨 Troubleshooting

### Lỗi thường gặp:

1. **Domain không resolve đúng IP**
   ```bash
   # Kiểm tra DNS
   dig +short www.insight.io.vn
   nslookup www.insight.io.vn
   ```

2. **SSL Certificate lỗi**
   ```bash
   # Xem logs certbot
   docker-compose -f docker-compose.prod.yml logs certbot
   
   # Renew thủ công
   docker-compose -f docker-compose.prod.yml run --rm certbot renew --dry-run
   ```

3. **Database connection lỗi**
   ```bash
   # Kiểm tra database container
   docker-compose -f docker-compose.prod.yml logs db
   
   # Test connection
   docker-compose -f docker-compose.prod.yml exec application nc -z db 5432
   ```

4. **Frontend không load**
   ```bash
   # Kiểm tra build frontend
   docker-compose -f docker-compose.prod.yml logs frontend
   
   # Rebuild frontend
   docker-compose -f docker-compose.prod.yml up -d --build frontend
   ```

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Logs của từng service
2. Network connectivity
3. DNS resolution
4. SSL certificate validity
5. Environment variables

## 🎯 Performance Tips

1. **Enable Gzip**: Đã được config trong nginx
2. **Static file caching**: Đã được config
3. **Database optimization**: Tăng shared_buffers trong PostgreSQL
4. **Monitor resources**: Sử dụng `htop`, `docker stats`

---

**🎉 Chúc mừng! Website www.insight.io.vn đã sẵn sàng hoạt động!**
