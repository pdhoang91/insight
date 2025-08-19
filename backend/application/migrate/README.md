# Database Migration Guide

## Simplified Migration System

Hệ thống migration đã được đơn giản hóa để phù hợp với database mới không có dữ liệu legacy.

## Setup Instructions

### 1. Database Initialization
Sau khi tạo database PostgreSQL, chạy file init.sql **MỘT LẦN DUY NHẤT**:

```bash
# Kết nối với PostgreSQL và chạy:
psql -U your_username -d your_database -f migrate/init.sql
```

Hoặc từ trong PostgreSQL shell:
```sql
\i migrate/init.sql
```

### 2. Application Startup
Khi khởi động application, GORM sẽ tự động:
- Tạo tất cả tables từ models
- Tạo foreign keys và constraints
- Tạo basic indexes

## What's Included

### init.sql contains:
- ✅ **Extensions**: uuid-ossp, unaccent, pg_trgm
- ✅ **Search Indexes**: Full-text search cho tiếng Việt và tiếng Anh
- ✅ **Performance Indexes**: Trigram, unaccent cho fuzzy search

### GORM Auto-Migration handles:
- ✅ **Table Creation**: Từ model structs
- ✅ **Schema Updates**: Thêm/sửa columns tự động
- ✅ **Constraints**: Foreign keys, unique constraints
- ✅ **Basic Indexes**: Từ gorm tags

## What Was Removed

❌ **Deleted Complex Migrations**:
- `add_role_constants_and_constraints.sql` (286 lines of unnecessary functions)
- `convert_s3_to_proxy_urls.sql` (legacy data migration)
- `migrate_legacy_images.sql` (208 lines of complex logic)
- `add_images_table.sql` (now handled by GORM)
- `add_user_phone_dob_bio.sql` (now handled by GORM)

## Benefits

1. **Đơn giản**: Chỉ 1 file SQL cần chạy thủ công
2. **Tự động**: GORM xử lý việc tạo/cập nhật tables
3. **Linh hoạt**: Thêm fields mới chỉ cần update model struct
4. **Ít lỗi**: Không có complex logic có thể fail
5. **Dễ maintain**: Code ít hơn, logic rõ ràng hơn

## Development Workflow

1. **Thêm field mới**: Update model struct → restart app → GORM tự động migrate
2. **Thêm table mới**: Tạo model struct → thêm vào AutoMigrate() → restart app
3. **Thêm index mới**: Thêm vào init.sql (nếu cần thiết cho performance)

## Migration History

- ✅ Simplified from 8 complex files to 1 simple file
- ✅ Moved table creation to GORM auto-migration
- ✅ Kept only essential search extensions and indexes
- ✅ Removed 500+ lines of unnecessary SQL code
