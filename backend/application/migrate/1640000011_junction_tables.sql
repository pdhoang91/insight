/* Creating junction tables for many-to-many relationships */

-- Post Categories junction table
CREATE TABLE IF NOT EXISTS post_categories
(
    post_id uuid NOT NULL,
    category_id uuid NOT NULL,
    PRIMARY KEY (post_id, category_id),
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Post Tags junction table
CREATE TABLE IF NOT EXISTS post_tags
(
    post_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_categories_post_id ON post_categories(post_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_category_id ON post_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);
