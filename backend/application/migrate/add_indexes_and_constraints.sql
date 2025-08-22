-- Add indexes and constraints for better performance and data integrity
-- Run this migration after the count fields migration

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User activities indexes for clap queries
CREATE INDEX IF NOT EXISTS idx_user_activities_post_action 
ON user_activities(post_id, action_type) WHERE post_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_activities_comment_action 
ON user_activities(comment_id, action_type) WHERE comment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_activities_reply_action 
ON user_activities(reply_id, action_type) WHERE reply_id IS NOT NULL;

-- User-specific clap lookup indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_user_post 
ON user_activities(user_id, post_id, action_type) WHERE post_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_activities_user_comment 
ON user_activities(user_id, comment_id, action_type) WHERE comment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_activities_user_reply 
ON user_activities(user_id, reply_id, action_type) WHERE reply_id IS NOT NULL;

-- Comments and replies count indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_replies_comment_id ON replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_replies_post_id ON replies(post_id);

-- =====================================================
-- CONSTRAINTS FOR DATA INTEGRITY
-- =====================================================

-- Ensure only one activity record per user per item per action
-- Note: We need to handle the case where multiple fields can be NULL
-- So we create separate unique constraints for each type

-- For post activities
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_post_activity 
ON user_activities(user_id, post_id, action_type) 
WHERE post_id IS NOT NULL AND comment_id IS NULL AND reply_id IS NULL;

-- For comment activities  
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_comment_activity 
ON user_activities(user_id, comment_id, action_type) 
WHERE comment_id IS NOT NULL AND post_id IS NULL AND reply_id IS NULL;

-- For reply activities
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_reply_activity 
ON user_activities(user_id, reply_id, action_type) 
WHERE reply_id IS NOT NULL AND post_id IS NULL AND comment_id IS NULL;

-- =====================================================
-- CHECK CONSTRAINTS
-- =====================================================

-- Ensure count is always positive
ALTER TABLE user_activities ADD CONSTRAINT check_positive_count 
CHECK (count > 0);

-- Ensure count_reply is non-negative
ALTER TABLE replies ADD CONSTRAINT check_non_negative_count_reply 
CHECK (count_reply >= 0);

-- Ensure at least one of post_id, comment_id, or reply_id is set
ALTER TABLE user_activities ADD CONSTRAINT check_activity_target 
CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL AND reply_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL AND reply_id IS NULL) OR  
    (post_id IS NULL AND comment_id IS NULL AND reply_id IS NOT NULL)
);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== INDEXES AND CONSTRAINTS ADDED ===';
    RAISE NOTICE 'Performance indexes created for user_activities, comments, replies';
    RAISE NOTICE 'Unique constraints added to prevent duplicate activities';
    RAISE NOTICE 'Check constraints added for data integrity';
    RAISE NOTICE 'Database optimization completed';
END $$;
