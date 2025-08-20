/* Adding audit fields for tracking modifications */

-- Add edited_at field to comments table
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS edited_at timestamp with time zone;

-- Add edited_at field to replies table
ALTER TABLE replies 
ADD COLUMN IF NOT EXISTS edited_at timestamp with time zone;

-- Add updated_at field to user_activities table
ALTER TABLE user_activities 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT NOW();

-- Create indexes for audit fields
CREATE INDEX IF NOT EXISTS idx_comments_edited_at ON comments(edited_at) WHERE edited_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_replies_edited_at ON replies(edited_at) WHERE edited_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_activities_updated_at ON user_activities(updated_at);

-- Create composite indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_comments_user_edited ON comments(user_id, edited_at) WHERE edited_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_replies_user_edited ON replies(user_id, edited_at) WHERE edited_at IS NOT NULL;
