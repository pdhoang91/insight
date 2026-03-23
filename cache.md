# Cache System Overview

Hệ thống sử dụng kiến trúc **Two-Tier Cache** (L1 + L2), với L1 là in-memory cache và L2 là Redis.

---

## Kiến trúc tổng quan

```
Request
   │
   ▼
┌─────────────┐   HIT   ──▶ trả về kết quả
│  L1: Memory │
│  (sync.Map) │   MISS
└─────────────┘
        │
        ▼
┌─────────────┐   HIT   ──▶ promote lên L1 (TTL 30s) → trả về kết quả
│  L2: Redis  │
│  (DB 0)     │   MISS
└─────────────┘
        │
        ▼
   PostgreSQL (database)
```

- Khi **Set**: ghi đồng thời cả L1 và L2 (write-through).
- Khi **Get**: ưu tiên L1 → nếu miss thì đọc L2 → nếu hit thì promote lên L1 với TTL 30 giây.
- Khi **Delete/DeletePrefix**: xóa đồng thời cả L1 và L2.
- Redis là **tùy chọn** — nếu không có `REDIS_URL` hoặc Redis không kết nối được, hệ thống tự động fallback về in-memory only.

---

## Cấu hình Redis

| Thông số | Giá trị |
|---|---|
| Image | `redis:7-alpine` |
| Port | `6379` |
| Database | `DB 0` |
| Max memory | `64 MB` |
| Eviction policy | `allkeys-lru` (LRU toàn bộ khi đầy bộ nhớ) |
| Key prefix | `insight:` |
| Serialization | `encoding/gob` |

Biến môi trường: `REDIS_URL=redis://localhost:6379`

---

## Cấu trúc Cache Key

Tất cả key trong Redis đều có prefix `insight:`, ví dụ: `insight:post_slug:my-post`.

| Key Pattern | Dữ liệu | TTL |
|---|---|---|
| `post_id:<uuid>` | `*dto.PostResponse` — chi tiết bài viết theo ID | 60 giây |
| `post_slug:<slug>` | `*dto.PostResponse` — chi tiết bài viết theo slug | 60 giây |
| `list_posts:<limit>:<offset>` | `[]*dto.PostResponse` — danh sách bài viết phân trang | 2 phút |
| `list_posts:<limit>:<offset>:total` | `int64` — tổng số bài viết | 2 phút |
| `latest_posts:<limit>` | `[]*dto.PostResponse` — bài viết mới nhất | 2 phút |
| `popular_posts:<limit>` | `[]*dto.PostResponse` — bài viết phổ biến | 5 phút |
| `home_data` | `*dto.HomeResponse` — dữ liệu trang chủ | 2 phút |
| `archive_summary` | `[]*repository.ArchiveSummaryItem` — tóm tắt archive | 10 phút |
| `categories:<limit>:<offset>` | `[]*dto.CategoryResponse` — danh sách category | 10 phút |
| `categories:<limit>:<offset>:total` | `int64` — tổng số category | 10 phút |
| `tags:<limit>:<offset>` | `[]*dto.TagResponse` — danh sách tag | 10 phút |
| `tags:<limit>:<offset>:total` | `int64` — tổng số tag | 10 phút |
| `popular_tags:<limit>` | `[]*dto.TagResponse` — tag phổ biến | 5 phút |

**Tổng hợp TTL:**

| TTL | Áp dụng cho |
|---|---|
| 30 giây | L1 promotion (khi L2 hit → copy lên L1) |
| 60 giây | Chi tiết bài viết (by ID, by slug) |
| 2 phút | Danh sách bài viết, latest posts, home data |
| 5 phút | Popular posts, popular tags |
| 10 phút | Archive summary, categories, tags |

---

## Cache Invalidation

Cache bị xóa tự động khi có thao tác ghi (create/update/delete):

**Bài viết:**
- Xóa prefix `list_posts:`, `latest_posts:`, `popular_posts:` và key `home_data`
- Xóa key `post_slug:<slug>` và `post_id:<uuid>` của bài viết bị thay đổi

**Category:**
- Xóa prefix `categories:` và key `home_data`

**Tag:**
- Xóa prefix `tags:` và prefix `popular_tags:`

**Background job (mỗi 5 phút):**
- `RecalculateEngagementScores()` xóa prefix `popular_posts:` và key `home_data`

**Lưu ý:** Comments và User/Auth **không được cache** — luôn đọc thẳng từ database.

---

## File liên quan

| File | Mô tả |
|---|---|
| `backend/application/pkg/cache/cache.go` | Interface `Cache` |
| `backend/application/pkg/cache/memory_cache.go` | L1 in-memory cache (sync.Map + janitor) |
| `backend/application/pkg/cache/redis_cache.go` | L2 Redis cache (gob serialization, SCAN để xóa prefix) |
| `backend/application/pkg/cache/two_tier_cache.go` | Two-tier logic (L1 + L2) |
| `backend/application/main.go` | Khởi tạo cache, đăng ký gob types |
| `backend/application/internal/service/post.go` | Cache logic cho bài viết |
| `backend/application/internal/service/category.go` | Cache logic cho category |
| `backend/application/internal/service/tag.go` | Cache logic cho tag |

---

## Redis CLI — Các lệnh thường dùng

### Kết nối Redis

```bash
# Kết nối vào Redis trong Docker
docker exec -it insight-redis-1 redis-cli

# Hoặc nếu chạy local
redis-cli -h localhost -p 6379
```

### Xem dữ liệu

```bash
# Liệt kê tất cả key có prefix "insight:"
KEYS insight:*

# Liệt kê key theo pattern (dùng SCAN thay KEYS cho production — không block)
SCAN 0 MATCH insight:post_* COUNT 100

# Xem giá trị của một key (dữ liệu dạng binary/gob, không đọc được trực tiếp)
GET insight:home_data

# Xem TTL còn lại của một key (đơn vị: giây)
TTL insight:home_data

# Xem TTL chính xác hơn (đơn vị: millisecond)
PTTL insight:home_data

# Kiểm tra key có tồn tại không
EXISTS insight:post_slug:my-post

# Xem kiểu dữ liệu của key
TYPE insight:home_data

# Xem thông tin memory của key
OBJECT ENCODING insight:home_data
OBJECT IDLETIME insight:home_data
```

### Xóa cache

```bash
# Xóa một key cụ thể
DEL insight:home_data

# Xóa nhiều key cùng lúc
DEL insight:post_id:abc123 insight:post_slug:my-post

# Xóa tất cả key theo pattern (dùng SCAN — an toàn hơn KEYS trên production)
redis-cli --scan --pattern "insight:list_posts:*" | xargs redis-cli DEL

# Xóa tất cả key có prefix "insight:popular_posts:"
redis-cli --scan --pattern "insight:popular_posts:*" | xargs redis-cli DEL

# Xóa toàn bộ cache của hệ thống (cẩn thận!)
redis-cli --scan --pattern "insight:*" | xargs redis-cli DEL

# Flush toàn bộ DB 0 (xóa hết, cực kỳ cẩn thận!)
FLUSHDB
```

### Insert / Set dữ liệu thủ công

> **Lưu ý:** Dữ liệu cache trong hệ thống được encode bằng `encoding/gob` (binary), nên không thể set thủ công từ redis-cli cho các key phức tạp. Tuy nhiên, có thể set key đơn giản để test:

```bash
# Set một key string với TTL 60 giây
SET insight:test_key "hello" EX 60

# Set key không có TTL
SET insight:test_key "hello"

# Set key chỉ khi key chưa tồn tại (NX = Not eXists)
SET insight:test_key "hello" EX 60 NX

# Cập nhật TTL của một key đang tồn tại
EXPIRE insight:home_data 120

# Xóa TTL (làm key tồn tại vĩnh viễn)
PERSIST insight:home_data
```

### Monitor & Debug

```bash
# Theo dõi real-time tất cả lệnh đang chạy (dừng bằng Ctrl+C)
MONITOR

# Xem thống kê tổng quan Redis
INFO

# Xem thống kê memory
INFO memory

# Xem thống kê keyspace (số key, hit/miss)
INFO keyspace

# Xem thống kê stats (hit/miss rate)
INFO stats

# Xem số lượng key trong DB 0
DBSIZE

# Xem cấu hình đang chạy
CONFIG GET maxmemory
CONFIG GET maxmemory-policy

# Xem các key chiếm nhiều bộ nhớ nhất (top 10)
redis-cli --bigkeys
```

### Ví dụ thực tế

```bash
# Xem cache home_data còn TTL bao lâu
TTL insight:home_data

# Xóa cache home_data để force refresh trang chủ
DEL insight:home_data

# Xóa toàn bộ cache bài viết
redis-cli --scan --pattern "insight:post_*" | xargs redis-cli DEL
redis-cli --scan --pattern "insight:list_posts:*" | xargs redis-cli DEL
redis-cli --scan --pattern "insight:latest_posts:*" | xargs redis-cli DEL

# Xóa toàn bộ cache (restart cache)
redis-cli --scan --pattern "insight:*" | xargs redis-cli DEL

# Kiểm tra Redis có hoạt động không
PING
# → PONG
```
