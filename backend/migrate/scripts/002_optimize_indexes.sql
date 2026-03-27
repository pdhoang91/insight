-- =============================================================
-- Migration 002 — Remove unnecessary indexes
-- Keep only indexes essential for fast post loading.
-- Search-related indexes (FTS, trigram) are dropped.
-- =============================================================

-- users: FTS not needed
DROP INDEX IF EXISTS idx_users_name_fts;
DROP INDEX IF EXISTS idx_users_bio_fts;

-- posts: search & secondary sort indexes not needed
DROP INDEX IF EXISTS idx_posts_document;
DROP INDEX IF EXISTS idx_posts_title_en;
DROP INDEX IF EXISTS idx_posts_title_vi;
DROP INDEX IF EXISTS idx_posts_excerpt_vi;
DROP INDEX IF EXISTS trgm_idx_posts_title;
DROP INDEX IF EXISTS trgm_idx_posts_excerpt;
DROP INDEX IF EXISTS idx_posts_views;
DROP INDEX IF EXISTS idx_posts_engagement;
DROP INDEX IF EXISTS idx_posts_comment_count;
DROP INDEX IF EXISTS idx_posts_deleted_at;

-- post_contents: GIN on JSONB content & deleted_at not needed
DROP INDEX IF EXISTS idx_post_contents_content;
DROP INDEX IF EXISTS idx_post_contents_deleted_at;

-- comments: querying by user not needed
DROP INDEX IF EXISTS idx_comments_user_id;
DROP INDEX IF EXISTS idx_comments_deleted_at;

-- replies: covered by composite index idx_replies_comment_active
DROP INDEX IF EXISTS idx_replies_post_id;
DROP INDEX IF EXISTS idx_replies_user_id;
DROP INDEX IF EXISTS idx_replies_deleted_at;

-- categories & tags: small tables, sequential scan is fine; FTS not needed
DROP INDEX IF EXISTS idx_categories_name;
DROP INDEX IF EXISTS idx_categories_name_fts;
DROP INDEX IF EXISTS idx_tags_name;
DROP INDEX IF EXISTS idx_tags_name_fts;

-- images: not on the critical post-loading path
DROP INDEX IF EXISTS idx_images_user_id;
DROP INDEX IF EXISTS idx_images_storage_key;
DROP INDEX IF EXISTS idx_images_image_type;
DROP INDEX IF EXISTS idx_image_references_image_id;
