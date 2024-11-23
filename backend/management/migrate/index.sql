CREATE INDEX idx_posts_title ON posts USING gin (to_tsvector('english', title));
CREATE INDEX idx_posts_content ON posts USING gin (to_tsvector('english', content));
CREATE INDEX idx_categories_name ON categories (name);
CREATE INDEX idx_tags_name ON tags (name);