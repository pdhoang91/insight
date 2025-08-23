# SSL Scripts cho insight.io.vn

3 scripts đơn giản để quản lý SSL certificates.

## 📋 Scripts

### 1. `create-ssl.sh` - Tạo SSL
```bash
./nginx/scripts/create-ssl.sh
```
**Chức năng:**
- Tạo SSL certificates từ Let's Encrypt
- Tự động fallback về temporary SSL nếu domain chưa accessible
- Copy certificates vào nginx
- Test HTTPS

### 2. `renew-ssl.sh` - Gia hạn SSL  
```bash
./nginx/scripts/renew-ssl.sh
```
**Chức năng:**
- Gia hạn SSL certificates
- Copy certificates mới
- Reload nginx
- Test HTTPS

### 3. `check-ssl.sh` - Kiểm tra SSL
```bash
./nginx/scripts/check-ssl.sh
```
**Chức năng:**
- Kiểm tra certificate files
- Kiểm tra nginx status
- Test HTTP/HTTPS access
- Kiểm tra certificate expiry
- Show summary

## 🚀 Hướng dẫn sử dụng

### Lần đầu setup SSL:
```bash
cd /root/workspace/insight
./nginx/scripts/create-ssl.sh
```

### Kiểm tra SSL:
```bash
./nginx/scripts/check-ssl.sh
```

### Gia hạn SSL (cron job):
```bash
# Thêm vào crontab
0 2 1 * * /root/workspace/insight/nginx/scripts/renew-ssl.sh
```

## ⚠️ Yêu cầu

1. **Domain DNS**: `insight.io.vn` và `www.insight.io.vn` trỏ về VPS IP
2. **Firewall**: Mở ports 80, 443
3. **Docker**: `docker-compose up -d`
4. **Email**: Scripts dùng `pdhoang91@gmail.com`

## 🔧 Troubleshooting

### SSL không work:
```bash
./nginx/scripts/check-ssl.sh
```

### Tạo lại SSL:
```bash
./nginx/scripts/create-ssl.sh
```

### Kiểm tra logs:
```bash
docker-compose logs nginx
cat nginx/logs/ssl-renewal.log
```

---
**Domain:** insight.io.vn  
**Email:** pdhoang91@gmail.com