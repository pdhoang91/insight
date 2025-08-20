/* Adding clap_count column to user_activities table */

-- Add clap_count column to track multiple claps from same user
ALTER TABLE user_activities 
ADD COLUMN IF NOT EXISTS clap_count integer DEFAULT 1;

-- Update existing records to have clap_count = 1
UPDATE user_activities 
SET clap_count = 1 
WHERE clap_count IS NULL;

-- Create index for better performance on clap_count queries
CREATE INDEX IF NOT EXISTS idx_user_activities_clap_count ON user_activities(clap_count) WHERE action_type LIKE 'clap_%';
