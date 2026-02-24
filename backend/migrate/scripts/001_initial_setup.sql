-- Migration 001: Initial Database Setup
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
-- FUNCTIONS FOR JSON CONTENT SEARCH
-- =====================================================

-- Immutable wrapper for unaccent (required for index expressions)
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text AS $$
BEGIN
  RETURN unaccent($1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Extract plain text from TipTap/ProseMirror JSON document tree
CREATE OR REPLACE FUNCTION extract_text_from_json_doc(doc jsonb)
RETURNS text AS $$
DECLARE
  result text := '';
  child jsonb;
BEGIN
  IF doc IS NULL THEN RETURN ''; END IF;
  IF doc->>'text' IS NOT NULL THEN
    result := result || ' ' || (doc->>'text');
  END IF;
  IF doc->'content' IS NOT NULL AND jsonb_typeof(doc->'content') = 'array' THEN
    FOR child IN SELECT jsonb_array_elements(doc->'content')
    LOOP
      result := result || extract_text_from_json_doc(child);
    END LOOP;
  END IF;
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- ADDITIONAL INDEXES (beyond what GORM creates)
-- =====================================================

-- Basic search indexes
CREATE INDEX IF NOT EXISTS idx_posts_title ON posts USING gin (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories (name);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags (name);

-- Full-text search optimization
-- Add document column for posts (title + excerpt)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'document') THEN
        ALTER TABLE posts ADD COLUMN document tsvector GENERATED ALWAYS AS (
            to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, ''))
        ) STORED;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_document ON posts USING GIN (document);

-- Trigram indexes for fuzzy search
CREATE INDEX IF NOT EXISTS trgm_idx_title ON posts USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS trgm_idx_excerpt ON posts USING gin (excerpt gin_trgm_ops);

-- Vietnamese search support
CREATE INDEX IF NOT EXISTS idx_posts_title_vietnamese 
ON posts USING gin(to_tsvector('simple', coalesce(title, '')));

CREATE INDEX IF NOT EXISTS idx_posts_excerpt_vietnamese 
ON posts USING gin(to_tsvector('simple', coalesce(excerpt, '')));

CREATE INDEX IF NOT EXISTS idx_users_name_vietnamese 
ON users USING gin(to_tsvector('simple', coalesce(name, '')));

CREATE INDEX IF NOT EXISTS idx_users_bio_vietnamese 
ON users USING gin(to_tsvector('simple', coalesce(bio, '')));

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== MIGRATION 001: INITIAL SETUP COMPLETED ===';
    RAISE NOTICE 'Extensions enabled: uuid-ossp, unaccent, pg_trgm';
    RAISE NOTICE 'Functions created: immutable_unaccent, extract_text_from_json_doc';
    RAISE NOTICE 'Search indexes created for Vietnamese and English content';
    RAISE NOTICE 'Ready for application startup';
END $$;
