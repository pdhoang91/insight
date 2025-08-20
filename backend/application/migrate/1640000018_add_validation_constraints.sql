/* Adding content validation constraints */

-- Add content validation constraints to prevent empty content
ALTER TABLE posts 
ADD CONSTRAINT IF NOT EXISTS chk_posts_title_not_empty 
CHECK (length(trim(title)) > 0);

ALTER TABLE posts 
ADD CONSTRAINT IF NOT EXISTS chk_posts_title_length 
CHECK (length(title) <= 500);

ALTER TABLE comments 
ADD CONSTRAINT IF NOT EXISTS chk_comments_content_not_empty 
CHECK (length(trim(content)) > 0);

ALTER TABLE comments 
ADD CONSTRAINT IF NOT EXISTS chk_comments_content_length 
CHECK (length(content) <= 10000);

ALTER TABLE replies 
ADD CONSTRAINT IF NOT EXISTS chk_replies_content_not_empty 
CHECK (length(trim(content)) > 0);

ALTER TABLE replies 
ADD CONSTRAINT IF NOT EXISTS chk_replies_content_length 
CHECK (length(content) <= 5000);

-- Add constraint for title_name uniqueness and format
ALTER TABLE posts 
ADD CONSTRAINT IF NOT EXISTS chk_posts_title_name_format 
CHECK (title_name ~ '^[a-z0-9-]+$' AND length(title_name) > 0);

-- Add constraint for action_type validation
ALTER TABLE user_activities 
ADD CONSTRAINT IF NOT EXISTS chk_user_activities_action_type 
CHECK (action_type IN ('clap_post', 'clap_comment', 'clap_reply', 'view_post', 'bookmark_post', 'follow_user'));

-- Add constraint for clap_count validation
ALTER TABLE user_activities 
ADD CONSTRAINT IF NOT EXISTS chk_user_activities_clap_count_positive 
CHECK (clap_count > 0);

-- Add constraint to ensure only one target is set per activity
ALTER TABLE user_activities 
ADD CONSTRAINT IF NOT EXISTS chk_user_activities_single_target 
CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL AND reply_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL AND reply_id IS NULL) OR  
    (post_id IS NULL AND comment_id IS NULL AND reply_id IS NOT NULL)
);
