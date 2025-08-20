/* Adding denormalized count fields for better performance */

-- Add denormalized count fields to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS comments_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS claps_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS views_count bigint DEFAULT 0; -- Rename from views for consistency

-- Add denormalized count fields to comments table
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS replies_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS claps_count integer DEFAULT 0;

-- Add denormalized count fields to replies table
ALTER TABLE replies 
ADD COLUMN IF NOT EXISTS claps_count integer DEFAULT 0;

-- Create indexes for count fields
CREATE INDEX IF NOT EXISTS idx_posts_comments_count ON posts(comments_count DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_claps_count ON posts(claps_count DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_views_count ON posts(views_count DESC) WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_comments_replies_count ON comments(replies_count DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_comments_claps_count ON comments(claps_count DESC) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_replies_claps_count ON replies(claps_count DESC) WHERE status = 'active';

-- Create composite indexes for sorting by multiple criteria
CREATE INDEX IF NOT EXISTS idx_posts_popularity 
ON posts(claps_count DESC, comments_count DESC, views_count DESC) 
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_posts_engagement 
ON posts(comments_count DESC, claps_count DESC, created_at DESC) 
WHERE status = 'published';

-- Initialize count fields with current data
-- Update posts comments_count
UPDATE posts 
SET comments_count = (
    SELECT COUNT(*) 
    FROM comments 
    WHERE comments.post_id = posts.id 
    AND comments.status = 'active'
)
WHERE comments_count = 0;

-- Update posts claps_count
UPDATE posts 
SET claps_count = (
    SELECT COALESCE(SUM(clap_count), 0) 
    FROM user_activities 
    WHERE user_activities.post_id = posts.id 
    AND user_activities.action_type = 'clap_post'
)
WHERE claps_count = 0;

-- Update posts views_count from existing views field
UPDATE posts 
SET views_count = views 
WHERE views_count = 0;

-- Update comments replies_count
UPDATE comments 
SET replies_count = (
    SELECT COUNT(*) 
    FROM replies 
    WHERE replies.comment_id = comments.id 
    AND replies.status = 'active'
)
WHERE replies_count = 0;

-- Update comments claps_count
UPDATE comments 
SET claps_count = (
    SELECT COALESCE(SUM(clap_count), 0) 
    FROM user_activities 
    WHERE user_activities.comment_id = comments.id 
    AND user_activities.action_type = 'clap_comment'
)
WHERE claps_count = 0;

-- Update replies claps_count
UPDATE replies 
SET claps_count = (
    SELECT COALESCE(SUM(clap_count), 0) 
    FROM user_activities 
    WHERE user_activities.reply_id = replies.id 
    AND user_activities.action_type = 'clap_reply'
)
WHERE claps_count = 0;
