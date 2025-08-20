# Database Migration System

## Automatic Migration with Docker Compose

Hệ thống migration được tích hợp trực tiếp vào docker-compose và chạy tự động.

## Quick Setup (Chỉ cần 1 lệnh!)

```bash
docker-compose up -d
```

**Thế thôi!** Migration sẽ chạy tự động trước khi application khởi động.

## Cách hoạt động:

1. **`docker-compose up -d`** khởi động database
2. **Migration service** chạy tự động và tạo tất cả tables
3. **Application** và **Search Service** khởi động sau khi migration hoàn thành
4. **Frontend** khởi động và kết nối với backend

## Thứ tự khởi động:
```
db (PostgreSQL) → migrate → application + search-service → frontend
```

## Migration Files

### Core Tables (in order):
1. **`1640000000_extensions.sql`** - Database extensions (uuid-ossp, unaccent, pg_trgm)
2. **`1640000001_users.sql`** - Users table with authentication
3. **`1640000002_categories.sql`** - Categories table
4. **`1640000003_tags.sql`** - Tags table
5. **`1640000004_posts.sql`** - Posts table
6. **`1640000005_post_content.sql`** - Post content table
7. **`1640000006_comments.sql`** - Comments table
8. **`1640000007_replies.sql`** - Replies table
9. **`1640000008_user_activities.sql`** - User activities (with action_type for claps)
10. **`1640000009_images.sql`** - Images table
11. **`1640000010_image_references.sql`** - Image references table
12. **`1640000011_junction_tables.sql`** - Many-to-many relationship tables
13. **`1640000012_additional_tables.sql`** - Bookmarks, follows, ratings, etc.
14. **`1640000013_search_indexes.sql`** - Vietnamese and English search indexes

## Features

### ✅ **Complete Schema Creation:**
- All tables with proper relationships
- Foreign key constraints with CASCADE deletes
- Comprehensive indexes for performance
- Vietnamese and English search support

### ✅ **Safe Migrations:**
- Uses `CREATE TABLE IF NOT EXISTS` - won't fail if table exists
- Uses `CREATE INDEX IF NOT EXISTS` - won't fail if index exists
- Each migration is atomic and can be re-run safely

### ✅ **Production Ready:**
- Proper data types and constraints
- Optimized indexes for common queries
- Full-text search capabilities
- Image management system

## Files Overview

### ✅ Active Migration Files:
- **14 timestamp-based SQL files** - Complete database schema
- **`migrate.sh`** - Migration runner script (runs inside Docker)
- **`Dockerfile`** - Migration service container
- **`README.md`** - This guide

### ⚠️ Legacy Files (for reference only):
- **`init.sql`** - Old complex setup (kept for reference)

## Benefits

1. **Explicit Schema**: Every table and column is explicitly defined
2. **Version Control**: Each migration is timestamped and tracked
3. **Safe Execution**: Can be re-run without errors
4. **No Dependencies**: No need for GORM auto-migration
5. **Production Ready**: Proper constraints and indexes
6. **Rollback Friendly**: Each migration is a separate file

## Development Workflow

1. **New Table**: Create new `164000001X_table_name.sql` file
2. **Schema Changes**: Create new migration file with ALTER statements  
3. **Test**: `docker-compose up -d` - migration runs automatically
4. **Version Control**: Commit migration files with your code

## After Running Migrations

Your database will have:
- ✅ All tables with proper relationships
- ✅ `action_type` column in `user_activities` (fixes clap functionality)
- ✅ Complete image management system
- ✅ Search indexes for Vietnamese content
- ✅ All foreign key constraints
- ✅ Performance-optimized indexes

**No GORM auto-migration needed - everything is explicitly created!**
