# 🔐 SSL Certificate Troubleshooting Guide

## 🚨 Lỗi "Connection refused" khi setup SSL

### **Nguyên nhân chính:**

1. **Domain chưa trỏ đúng IP server**
2. **Port 80/443 bị block bởi firewall**
3. **Nginx không accessible từ internet**
4. **DNS chưa propagate**

---

## 🔍 **Bước 1: Kiểm tra DNS Resolution**

```bash
# Kiểm tra domain có trỏ đúng IP không
dig +short www.insight.io.vn
dig +short insight.io.vn

# Kiểm tra IP public của server
curl -s ifconfig.me
```

**✅ Kết quả mong muốn:** IP domain = IP server

**❌ Nếu khác nhau:** Cập nhật DNS records:
- A record: `insight.io.vn` → `YOUR_SERVER_IP`
- A record: `www.insight.io.vn` → `YOUR_SERVER_IP`

---

## 🔍 **Bước 2: Kiểm tra Firewall**

### Ubuntu/Debian (UFW):
```bash
# Kiểm tra status
sudo ufw status

# Mở ports cần thiết
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### CentOS/RHEL (Firewalld):
```bash
# Kiểm tra status
sudo firewall-cmd --state
sudo firewall-cmd --list-all

# Mở ports
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Cloud Provider Security Groups:
- **AWS**: EC2 → Security Groups → Inbound Rules
- **DigitalOcean**: Networking → Firewalls
- **Google Cloud**: VPC → Firewall rules

**Cần mở:**
- Port 22 (SSH)
- Port 80 (HTTP) - **Quan trọng cho Let's Encrypt**
- Port 443 (HTTPS)

---

## 🔍 **Bước 3: Test Accessibility**

```bash
# Test local
curl -I http://localhost/health

# Test external (thay YOUR_SERVER_IP)
curl -I http://YOUR_SERVER_IP/health

# Test domain
curl -I http://www.insight.io.vn/health
```

**✅ Kết quả mong muốn:** HTTP 200 OK

---

## 🔍 **Bước 4: Kiểm tra DNS Propagation**

```bash
# Kiểm tra từ nhiều DNS servers
nslookup www.insight.io.vn 8.8.8.8
nslookup www.insight.io.vn 1.1.1.1

# Online tools
# https://dnschecker.org/
# https://www.whatsmydns.net/
```

**⏰ DNS có thể mất 24-48h để propagate hoàn toàn**

---

## 🛠️ **Các giải pháp theo từng tình huống**

### **Tình huống 1: Domain chưa trỏ đúng IP**

```bash
# 1. Cập nhật DNS records tại nhà cung cấp domain
# 2. Đợi DNS propagate
# 3. Verify bằng dig/nslookup
# 4. Chạy lại script SSL
```

### **Tình huống 2: Firewall block ports**

```bash
# Ubuntu
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Test lại
curl -I http://YOUR_SERVER_IP/health
```

### **Tình huống 3: Nginx không start được**

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs nginx

# Common issues:
# - Port already in use
# - Config syntax error
# - Permission issues
```

### **Tình huống 4: Let's Encrypt rate limit**

```bash
# Let's Encrypt có rate limit:
# - 50 certificates per registered domain per week
# - 5 failed validations per account per hostname per hour

# Giải pháp:
# 1. Đợi rate limit reset
# 2. Dùng staging environment để test:
#    --staging flag trong certbot
```

---

## 🚀 **Script Setup SSL Cải tiến**

Sử dụng script mới với error handling tốt hơn:

```bash
./setup-ssl-improved.sh
```

**Script này sẽ:**
1. ✅ Kiểm tra DNS resolution
2. ✅ Kiểm tra firewall
3. ✅ Test accessibility
4. ✅ Thử cả standalone và webroot mode
5. ✅ Detailed error messages

---

## 🔄 **Manual SSL Setup (nếu script fail)**

### **Bước 1: Stop tất cả services**
```bash
docker-compose -f docker-compose.prod.yml down
```

### **Bước 2: Tạo minimal nginx cho ACME challenge**
```bash
# Tạo config minimal
cat > nginx/conf.d/acme-only.conf << 'EOF'
server {
    listen 80;
    server_name insight.io.vn www.insight.io.vn;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 200 'ACME Challenge Server';
        add_header Content-Type text/plain;
    }
}
EOF

# Start nginx
docker run -d --name nginx_acme \
    -p 80:80 \
    -v $(pwd)/nginx/conf.d/acme-only.conf:/etc/nginx/conf.d/default.conf \
    -v $(pwd)/certbot/www:/var/www/certbot \
    nginx:latest
```

### **Bước 3: Test accessibility**
```bash
curl -I http://YOUR_SERVER_IP/
curl -I http://www.insight.io.vn/
```

### **Bước 4: Generate certificates**
```bash
# Standalone mode (dễ hơn)
docker stop nginx_acme
docker run --rm -p 80:80 \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    certbot/certbot certonly \
    --standalone \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    -d www.insight.io.vn \
    -d insight.io.vn
```

### **Bước 5: Copy certificates**
```bash
cp certbot/conf/live/www.insight.io.vn/fullchain.pem nginx/certs/insight.io.vn.crt
cp certbot/conf/live/www.insight.io.vn/privkey.pem nginx/certs/insight.io.vn.key
chmod 644 nginx/certs/insight.io.vn.crt
chmod 600 nginx/certs/insight.io.vn.key
```

### **Bước 6: Cleanup và start production**
```bash
docker stop nginx_acme && docker rm nginx_acme
rm nginx/conf.d/acme-only.conf
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 **Debug Commands**

```bash
# Check DNS from multiple locations
dig @8.8.8.8 www.insight.io.vn
dig @1.1.1.1 www.insight.io.vn

# Check port accessibility
nc -zv YOUR_SERVER_IP 80
nc -zv YOUR_SERVER_IP 443

# Check nginx config
docker run --rm -v $(pwd)/nginx/conf.d:/etc/nginx/conf.d nginx:latest nginx -t

# Check certificates
openssl x509 -in nginx/certs/insight.io.vn.crt -text -noout

# Test SSL
openssl s_client -connect www.insight.io.vn:443 -servername www.insight.io.vn
```

---

## ⚡ **Quick Fix Checklist**

- [ ] Domain trỏ đúng IP server
- [ ] Port 80/443 mở trong firewall
- [ ] Port 80/443 mở trong cloud security groups
- [ ] DNS đã propagate (check dnschecker.org)
- [ ] Nginx accessible từ internet
- [ ] Email hợp lệ cho Let's Encrypt
- [ ] Không bị rate limit

---

**🎯 Nếu vẫn gặp vấn đề, hãy chạy từng bước manual setup ở trên và gửi logs cụ thể để được hỗ trợ.**
