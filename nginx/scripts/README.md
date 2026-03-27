# SSL Scripts cho insight.io.vn

## Scripts

### `init-ssl.sh` — Bootstrap SSL lần đầu

```bash
./nginx/scripts/init-ssl.sh
```

Dùng cho lần đầu setup, khi cert chưa tồn tại. Không cần sửa `nginx.conf` thủ công.

Cách hoạt động:
1. Tạo dummy self-signed cert tại `./certbot/conf/live/insight.io.vn/`
2. Start nginx (HTTPS block load được vì cert file đã tồn tại)
3. Chạy certbot lấy cert thật từ Let's Encrypt (nginx đang serve port 80)
4. Restart nginx dùng cert thật

---

### `renew-ssl.sh` — Gia hạn SSL

```bash
./nginx/scripts/renew-ssl.sh
```

Gia hạn cert khi sắp hết hạn (cert hết hạn sau 90 ngày). Nginx đọc cert trực tiếp từ `./certbot/conf` nên chỉ cần reload sau khi renew.

---

## Hướng dẫn sử dụng

### Lần đầu setup:
```bash
cd /root/workspace/insight
./nginx/scripts/init-ssl.sh
```

### Gia hạn cert (cron job):
```bash
# Thêm vào crontab — chạy lúc 2:00 sáng ngày 1 hàng tháng
0 2 1 * * /root/workspace/insight/nginx/scripts/renew-ssl.sh
```

### Kiểm tra logs:
```bash
docker-compose logs nginx
cat nginx/logs/ssl-renewal.log
```

---

## Yêu cầu

- DNS: `insight.io.vn` và `www.insight.io.vn` trỏ về VPS IP
- Firewall: mở ports 80 và 443
- Docker đã được cài đặt

---

**Domain:** insight.io.vn  
**Email:** pdhoang91@gmail.com  
**Cert path:** `./certbot/conf/live/insight.io.vn/`
