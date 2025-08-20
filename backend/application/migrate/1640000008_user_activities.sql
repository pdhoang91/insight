/* Creating user_activities table */

CREATE TABLE IF NOT EXISTS user_activities
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    post_id uuid,
    comment_id uuid,
    reply_id uuid,
    action_type varchar(50) NOT NULL DEFAULT 'clap_post',
    created_at timestamp with time zone DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_id) REFERENCES replies(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_post_id ON user_activities(post_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_comment_id ON user_activities(comment_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_reply_id ON user_activities(reply_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_action_type ON user_activities(action_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_post_action ON user_activities(post_id, action_type) WHERE post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_activities_comment_action ON user_activities(comment_id, action_type) WHERE comment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_activities_reply_action ON user_activities(reply_id, action_type) WHERE reply_id IS NOT NULL;
