-- Apply count fields migration
-- Run this SQL script on your database

-- Add count field to user_activities table
ALTER TABLE user_activities ADD COLUMN IF NOT EXISTS count BIGINT DEFAULT 1;

-- Add count_reply field to replies table  
ALTER TABLE replies ADD COLUMN IF NOT EXISTS count_reply BIGINT DEFAULT 0;

-- Update existing user_activities records to have count = 1
UPDATE user_activities SET count = 1 WHERE count IS NULL OR count = 0;

-- Verify the changes
SELECT 'user_activities table updated' as status;
SELECT COUNT(*) as total_activities, SUM(count) as total_claps FROM user_activities;

SELECT 'replies table updated' as status;
SELECT COUNT(*) as total_replies, SUM(count_reply) as total_reply_counts FROM replies;
