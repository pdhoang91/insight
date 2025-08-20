/* Adding performance indexes for search and common queries */

-- Full-text search indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_title_search 
ON posts USING gin(to_tsvector('english', title)) 
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_posts_preview_search 
ON posts USING gin(to_tsvector('english', preview_content)) 
WHERE status = 'published' AND preview_content IS NOT NULL;

-- Trigram indexes for fuzzy search
CREATE INDEX IF NOT EXISTS idx_posts_title_trigram 
ON posts USING gin(title gin_trgm_ops) 
WHERE status = 'published';

-- Time-based indexes for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_posts_created_status 
ON posts(created_at DESC, status) 
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_posts_views_status 
ON posts(views DESC, status) 
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_comments_created_status 
ON comments(created_at DESC, status) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_replies_created_status 
ON replies(created_at DESC, status) 
WHERE status = 'active';

-- User activity indexes for analytics
CREATE INDEX IF NOT EXISTS idx_user_activities_created_type 
ON user_activities(created_at DESC, action_type);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_created 
ON user_activities(user_id, created_at DESC);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_posts_user_created_status 
ON posts(user_id, created_at DESC, status);

CREATE INDEX IF NOT EXISTS idx_comments_post_created_status 
ON comments(post_id, created_at DESC, status);

CREATE INDEX IF NOT EXISTS idx_replies_comment_created_status 
ON replies(comment_id, created_at DESC, status);

-- Indexes for clap count aggregation
CREATE INDEX IF NOT EXISTS idx_user_activities_post_clap_sum 
ON user_activities(post_id, clap_count) 
WHERE action_type = 'clap_post';

CREATE INDEX IF NOT EXISTS idx_user_activities_comment_clap_sum 
ON user_activities(comment_id, clap_count) 
WHERE action_type = 'clap_comment';

CREATE INDEX IF NOT EXISTS idx_user_activities_reply_clap_sum 
ON user_activities(reply_id, clap_count) 
WHERE action_type = 'clap_reply';

-- Partial indexes for active content only
CREATE INDEX IF NOT EXISTS idx_posts_active_title_name 
ON posts(title_name) 
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_comments_active_post 
ON comments(post_id, created_at DESC) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_replies_active_comment 
ON replies(comment_id, created_at DESC) 
WHERE status = 'active';
