-- Migration: Add engagement_score column to posts
-- Description: Pre-computed score (views * 0.7 + comments * 0.3) used by GET /posts/popular
-- to replace expensive correlated subquery in ORDER BY

ALTER TABLE posts ADD COLUMN IF NOT EXISTS engagement_score FLOAT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_posts_engagement ON posts(engagement_score DESC) WHERE deleted_at IS NULL;

-- Backfill existing posts
UPDATE posts
SET engagement_score = (
    views * 0.7 +
    COALESCE((
        SELECT COUNT(*) FROM comments
        WHERE comments.post_id = posts.id AND comments.deleted_at IS NULL
    ), 0) * 0.3
)
WHERE deleted_at IS NULL;

COMMIT;
