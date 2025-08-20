/* Adding status fields for content moderation */

-- Add status field to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'published';

-- Add status field to comments table  
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'active';

-- Add status field to replies table
ALTER TABLE replies 
ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'active';

-- Create indexes for status fields
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_replies_status ON replies(status);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_user_status ON posts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_comments_post_status ON comments(post_id, status);
CREATE INDEX IF NOT EXISTS idx_replies_comment_status ON replies(comment_id, status);

-- Add check constraints for valid status values
ALTER TABLE posts 
ADD CONSTRAINT IF NOT EXISTS chk_posts_status 
CHECK (status IN ('draft', 'published', 'archived', 'deleted'));

ALTER TABLE comments 
ADD CONSTRAINT IF NOT EXISTS chk_comments_status 
CHECK (status IN ('active', 'deleted', 'moderated', 'pending'));

ALTER TABLE replies 
ADD CONSTRAINT IF NOT EXISTS chk_replies_status 
CHECK (status IN ('active', 'deleted', 'moderated', 'pending'));
