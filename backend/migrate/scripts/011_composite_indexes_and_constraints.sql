-- E3: Composite indexes for hot query paths
-- Posts by user (filter + sort + soft delete)
CREATE INDEX IF NOT EXISTS idx_posts_user_created
    ON posts(user_id, created_at DESC)
    WHERE deleted_at IS NULL;

-- Junction tables: filter by category/tag then join post
CREATE INDEX IF NOT EXISTS idx_post_categories_category_post
    ON post_categories(category_id, post_id);

CREATE INDEX IF NOT EXISTS idx_post_tags_tag_post
    ON post_tags(tag_id, post_id);

-- Comments by post (filter + sort + soft delete)
CREATE INDEX IF NOT EXISTS idx_comments_post_active
    ON comments(post_id, created_at DESC)
    WHERE deleted_at IS NULL;

-- Replies by comment (filter + sort + soft delete)
CREATE INDEX IF NOT EXISTS idx_replies_comment_active
    ON replies(comment_id, created_at ASC)
    WHERE deleted_at IS NULL;

-- E6: Enforce 1:1 relationship between posts and post_contents at DB level
ALTER TABLE post_contents
    ADD CONSTRAINT uq_post_contents_post_id UNIQUE (post_id);
