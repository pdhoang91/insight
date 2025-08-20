/* Creating search indexes for Vietnamese and English content */

-- Full-text search indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_title_search ON posts USING gin (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_posts_preview_content_search ON posts USING gin (to_tsvector('english', preview_content));

-- Trigram indexes for fuzzy search
CREATE INDEX IF NOT EXISTS idx_posts_title_trigram ON posts USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_posts_preview_content_trigram ON posts USING gin (preview_content gin_trgm_ops);

-- Vietnamese search support with unaccent (simplified)
-- Note: Complex expressions with unaccent may need custom immutable functions
-- For now, using basic trigram indexes for Vietnamese search

-- Category and tag search indexes
CREATE INDEX IF NOT EXISTS idx_categories_name_trigram ON categories USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tags_name_trigram ON tags USING gin (name gin_trgm_ops);

-- Basic text search indexes (can be enhanced later with custom functions)
CREATE INDEX IF NOT EXISTS idx_posts_title_text ON posts USING gin(to_tsvector('simple', coalesce(title, '')));
CREATE INDEX IF NOT EXISTS idx_posts_preview_content_text ON posts USING gin(to_tsvector('simple', coalesce(preview_content, '')));
