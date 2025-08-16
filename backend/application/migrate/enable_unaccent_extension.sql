-- Enable unaccent extension for accent-insensitive search
-- This extension allows removing accents from text for better Vietnamese search support

-- Create unaccent extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create indexes for better performance with unaccent searches
-- Posts table indexes
CREATE INDEX IF NOT EXISTS idx_posts_title_unaccent 
ON posts USING gin(to_tsvector('simple', lower(unaccent(coalesce(title, '')))));

CREATE INDEX IF NOT EXISTS idx_posts_preview_content_unaccent 
ON posts USING gin(to_tsvector('simple', lower(unaccent(coalesce(preview_content, '')))));

-- Users table indexes  
CREATE INDEX IF NOT EXISTS idx_users_name_unaccent 
ON users USING gin(to_tsvector('simple', lower(unaccent(coalesce(name, '')))));

CREATE INDEX IF NOT EXISTS idx_users_bio_unaccent 
ON users USING gin(to_tsvector('simple', lower(unaccent(coalesce(bio, '')))));

-- Combined search index for posts
CREATE INDEX IF NOT EXISTS idx_posts_combined_unaccent_search 
ON posts USING gin(to_tsvector('simple', lower(unaccent(
    coalesce(title, '') || ' ' || coalesce(preview_content, '')
))));
