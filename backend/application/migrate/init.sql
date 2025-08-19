-- Initial Database Setup
-- This file contains essential database initialization that cannot be handled by GORM auto-migration
-- Run this ONCE after database creation and before starting the application

-- =====================================================
-- EXTENSIONS
-- =====================================================

-- UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Unaccent extension for accent-insensitive Vietnamese search
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- ADDITIONAL INDEXES (beyond what GORM creates)
-- =====================================================

-- Basic search indexes
CREATE INDEX IF NOT EXISTS idx_posts_title ON posts USING gin (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_posts_content ON posts USING gin (to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories (name);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags (name);

-- Full-text search optimization
-- Add document column for combined search (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'document') THEN
        ALTER TABLE posts ADD COLUMN document tsvector GENERATED ALWAYS AS (
            to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
        ) STORED;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_document ON posts USING GIN (document);

-- Trigram indexes for fuzzy search
CREATE INDEX IF NOT EXISTS trgm_idx_title ON posts USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS trgm_idx_preview_content ON posts USING gin (preview_content gin_trgm_ops);

-- Vietnamese search support with unaccent
CREATE INDEX IF NOT EXISTS idx_posts_title_unaccent 
ON posts USING gin(to_tsvector('simple', lower(unaccent(coalesce(title, '')))));

CREATE INDEX IF NOT EXISTS idx_posts_preview_content_unaccent 
ON posts USING gin(to_tsvector('simple', lower(unaccent(coalesce(preview_content, '')))));

CREATE INDEX IF NOT EXISTS idx_users_name_unaccent 
ON users USING gin(to_tsvector('simple', lower(unaccent(coalesce(name, '')))));

CREATE INDEX IF NOT EXISTS idx_users_bio_unaccent 
ON users USING gin(to_tsvector('simple', lower(unaccent(coalesce(bio, '')))));

-- Combined search index for posts
CREATE INDEX IF NOT EXISTS idx_posts_combined_unaccent_search 
ON posts USING gin(to_tsvector('simple', lower(unaccent(
    coalesce(title, '') || ' ' || coalesce(preview_content, '')
))));

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== DATABASE INITIALIZATION COMPLETED ===';
    RAISE NOTICE 'Extensions enabled: uuid-ossp, unaccent, pg_trgm';
    RAISE NOTICE 'Search indexes created for Vietnamese and English content';
    RAISE NOTICE 'Ready for application startup';
END $$;
