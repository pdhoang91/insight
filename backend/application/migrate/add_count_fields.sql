-- Add count field to user_activities table
ALTER TABLE user_activities ADD COLUMN count BIGINT DEFAULT 1;

-- Add count_reply field to replies table  
ALTER TABLE replies ADD COLUMN count_reply BIGINT DEFAULT 0;

-- Update existing user_activities records to have count = 1
UPDATE user_activities SET count = 1 WHERE count IS NULL OR count = 0;
