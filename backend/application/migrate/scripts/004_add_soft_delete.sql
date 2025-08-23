-- Migration: Add soft delete support
-- Description: Add deleted_at columns to posts, comments, replies, and post_contents tables for soft delete functionality

-- Add deleted_at column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON posts(deleted_at);

-- Add deleted_at column to comments table  
ALTER TABLE comments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments(deleted_at);

-- Add updated_at column to comments table if not exists
ALTER TABLE comments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add deleted_at column to replies table
ALTER TABLE replies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_replies_deleted_at ON replies(deleted_at);

-- Add updated_at column to replies table if not exists
ALTER TABLE replies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add deleted_at column to post_contents table
ALTER TABLE post_contents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_post_contents_deleted_at ON post_contents(deleted_at);

-- Update existing records to have proper updated_at timestamps
UPDATE comments SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE replies SET updated_at = created_at WHERE updated_at IS NULL;

COMMIT;
