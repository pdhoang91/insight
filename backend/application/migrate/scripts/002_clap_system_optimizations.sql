-- Migration 002: Clap System Optimizations
-- Apply all optimizations for post/comment/reply clap system
-- This migration adds count fields, indexes, and constraints for better performance

-- =====================================================
-- STEP 1: Apply count fields migration (if not already done)
-- =====================================================

-- Add count field to user_activities table if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_activities' AND column_name = 'count') THEN
        ALTER TABLE user_activities ADD COLUMN count BIGINT DEFAULT 1;
        RAISE NOTICE 'Added count column to user_activities table';
    ELSE
        RAISE NOTICE 'Count column already exists in user_activities table';
    END IF;
END $$;

-- Add count_reply field to replies table if not exists  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'replies' AND column_name = 'count_reply') THEN
        ALTER TABLE replies ADD COLUMN count_reply BIGINT DEFAULT 0;
        RAISE NOTICE 'Added count_reply column to replies table';
    ELSE
        RAISE NOTICE 'Count_reply column already exists in replies table';
    END IF;
END $$;

-- Update existing user_activities records to have count = 1
UPDATE user_activities SET count = 1 WHERE count IS NULL OR count = 0;

-- =====================================================
-- STEP 2: Add performance indexes
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
-- STEP 3: Add data integrity constraints
-- =====================================================

-- Clean up duplicate activities before adding unique constraints
-- Remove duplicate post activities (keep the one with highest count)
WITH duplicates AS (
    SELECT user_id, post_id, action_type, 
           ROW_NUMBER() OVER (PARTITION BY user_id, post_id, action_type ORDER BY count DESC, created_at DESC) as rn
    FROM user_activities 
    WHERE post_id IS NOT NULL AND comment_id IS NULL AND reply_id IS NULL
)
DELETE FROM user_activities 
WHERE id IN (
    SELECT ua.id 
    FROM user_activities ua
    JOIN duplicates d ON ua.user_id = d.user_id AND ua.post_id = d.post_id AND ua.action_type = d.action_type
    WHERE d.rn > 1 AND ua.post_id IS NOT NULL AND ua.comment_id IS NULL AND ua.reply_id IS NULL
);

-- Unique constraints for preventing duplicate activities
-- For post activities
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_post_activity 
ON user_activities(user_id, post_id, action_type) 
WHERE post_id IS NOT NULL AND comment_id IS NULL AND reply_id IS NULL;

-- Clean up duplicate comment activities
WITH duplicates AS (
    SELECT user_id, comment_id, action_type, 
           ROW_NUMBER() OVER (PARTITION BY user_id, comment_id, action_type ORDER BY count DESC, created_at DESC) as rn
    FROM user_activities 
    WHERE comment_id IS NOT NULL AND post_id IS NULL AND reply_id IS NULL
)
DELETE FROM user_activities 
WHERE id IN (
    SELECT ua.id 
    FROM user_activities ua
    JOIN duplicates d ON ua.user_id = d.user_id AND ua.comment_id = d.comment_id AND ua.action_type = d.action_type
    WHERE d.rn > 1 AND ua.comment_id IS NOT NULL AND ua.post_id IS NULL AND ua.reply_id IS NULL
);

-- For comment activities  
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_comment_activity 
ON user_activities(user_id, comment_id, action_type) 
WHERE comment_id IS NOT NULL AND post_id IS NULL AND reply_id IS NULL;

-- Clean up duplicate reply activities
WITH duplicates AS (
    SELECT user_id, reply_id, action_type, 
           ROW_NUMBER() OVER (PARTITION BY user_id, reply_id, action_type ORDER BY count DESC, created_at DESC) as rn
    FROM user_activities 
    WHERE reply_id IS NOT NULL AND post_id IS NULL AND comment_id IS NULL
)
DELETE FROM user_activities 
WHERE id IN (
    SELECT ua.id 
    FROM user_activities ua
    JOIN duplicates d ON ua.user_id = d.user_id AND ua.reply_id = d.reply_id AND ua.action_type = d.action_type
    WHERE d.rn > 1 AND ua.reply_id IS NOT NULL AND ua.post_id IS NULL AND ua.comment_id IS NULL
);

-- For reply activities
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_reply_activity 
ON user_activities(user_id, reply_id, action_type) 
WHERE reply_id IS NOT NULL AND post_id IS NULL AND comment_id IS NULL;

-- Check constraints (add only if they don't exist)
DO $$
BEGIN
    -- Check if constraint exists before adding
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'check_positive_count') THEN
        ALTER TABLE user_activities ADD CONSTRAINT check_positive_count 
        CHECK (count > 0);
        RAISE NOTICE 'Added check_positive_count constraint';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'check_non_negative_count_reply') THEN
        ALTER TABLE replies ADD CONSTRAINT check_non_negative_count_reply 
        CHECK (count_reply >= 0);
        RAISE NOTICE 'Added check_non_negative_count_reply constraint';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'check_activity_target') THEN
        ALTER TABLE user_activities ADD CONSTRAINT check_activity_target 
        CHECK (
            (post_id IS NOT NULL AND comment_id IS NULL AND reply_id IS NULL) OR
            (post_id IS NULL AND comment_id IS NOT NULL AND reply_id IS NULL) OR  
            (post_id IS NULL AND comment_id IS NULL AND reply_id IS NOT NULL)
        );
        RAISE NOTICE 'Added check_activity_target constraint';
    END IF;
END $$;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== MIGRATION 002: CLAP SYSTEM OPTIMIZATIONS COMPLETED ===';
    RAISE NOTICE 'Applied improvements:';
    RAISE NOTICE '1. ✅ Added count fields to user_activities and replies tables';
    RAISE NOTICE '2. ✅ Added performance indexes for faster queries';
    RAISE NOTICE '3. ✅ Added data integrity constraints';
    RAISE NOTICE 'Migration 002 completed successfully';
END $$;
