-- Migration: Performance indexes for high-frequency queries
-- Description: Add indexes to reduce DB query time on posts, categories, tags, and activity tables

CREATE INDEX IF NOT EXISTS idx_posts_created_at     ON posts(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_post_categories_post ON post_categories(post_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_cat  ON post_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_post       ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post        ON comments(post_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_activities_post_type ON user_activities(post_id, action_type);

COMMIT;
