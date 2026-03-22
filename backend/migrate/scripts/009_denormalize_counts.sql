-- C10: Denormalize clap_count and comment_count onto posts table
-- Eliminates 2 aggregate queries per post read

ALTER TABLE posts ADD COLUMN IF NOT EXISTS clap_count   BIGINT NOT NULL DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comment_count BIGINT NOT NULL DEFAULT 0;

-- Backfill existing data
UPDATE posts
SET
    clap_count = COALESCE((
        SELECT SUM(count)
        FROM user_activities
        WHERE post_id = posts.id AND action_type = 'clap_post'
    ), 0),
    comment_count = (
        SELECT COUNT(*)
        FROM comments
        WHERE post_id = posts.id AND deleted_at IS NULL
    );

CREATE INDEX IF NOT EXISTS idx_posts_clap_count    ON posts(clap_count);
CREATE INDEX IF NOT EXISTS idx_posts_comment_count ON posts(comment_count);

-- C1: Direct S3/CDN URL stored on image record
ALTER TABLE images ADD COLUMN IF NOT EXISTS public_url  TEXT;
-- C8: Image variant URLs (thumb 400w, medium 800w)
ALTER TABLE images ADD COLUMN IF NOT EXISTS thumb_url   TEXT;
ALTER TABLE images ADD COLUMN IF NOT EXISTS medium_url  TEXT;
