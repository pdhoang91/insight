# Nginx Notes

## SSL Certificate Setup (Let's Encrypt)

### Root Cause of `cannot load certificate` Error

Nginx khởi động fail với lỗi:
```
[emerg] cannot load certificate "/etc/letsencrypt/live/insight.io.vn/fullchain.pem": BIO_new_file() failed (No such file or directory)
```

**Nguyên nhân:** Nginx config có block HTTPS (port 443) tham chiếu đến SSL cert, nhưng cert chưa được tạo. Nginx load toàn bộ config khi khởi động nên crash ngay lập tức, không thể serve HTTP để certbot xác thực domain.

### Cách fix (lần đầu setup)

**Bước 1:** Comment block HTTPS trong `nginx/nginx.conf` để nginx start chỉ với HTTP (port 80).

**Bước 2:** Start nginx:
```bash
docker compose up -d nginx
```

**Bước 3:** Chạy certbot để lấy cert (dùng `docker run` trực tiếp, không qua `docker compose run` vì compose run không hiện output):
```bash
docker run --rm \
  -v ./certbot/conf:/etc/letsencrypt \
  -v ./certbot/www:/var/www/certbot \
  certbot/certbot certonly \
  --webroot -w /var/www/certbot \
  -d insight.io.vn -d www.insight.io.vn \
  --email pdhoang91@gmail.com --agree-tos --non-interactive
```

**Bước 4:** Uncomment block HTTPS trong `nginx/nginx.conf`.

**Bước 5:** Restart nginx:
```bash
docker compose restart nginx
```

### Renew Certificate

Cert hết hạn sau 90 ngày (tạo 2026-03-27, hết hạn 2026-06-25). Để renew:
```bash
docker run --rm \
  -v ./certbot/conf:/etc/letsencrypt \
  -v ./certbot/www:/var/www/certbot \
  certbot/certbot renew
docker compose restart nginx
```

### Lưu ý

- `docker compose --profile ssl run certbot` không hiển thị output — dùng `docker run` trực tiếp thay thế.
- Cert được lưu tại `./certbot/conf/live/insight.io.vn/` (mount vào `/etc/letsencrypt` trong container nginx).
- Nginx cần đang chạy và serve port 80 trong khi certbot chạy để ACME challenge hoạt động.
