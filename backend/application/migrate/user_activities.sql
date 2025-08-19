-- Create user_activities table for clap system
-- Run this if the table doesn't exist in your database

CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    post_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_user_activities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_activities_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate claps
    CONSTRAINT unique_user_post_activity UNIQUE(user_id, post_id, activity_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activities_post_id ON user_activities(post_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_post_type ON user_activities(post_id, activity_type);

-- Insert some sample data (optional)
-- You can uncomment these if you want to test with sample claps
/*
INSERT INTO user_activities (user_id, post_id, activity_type) VALUES
    ('31781f8b-cb7b-4bf2-bf25-2bf9aa9258bd', '6cc59f58-4de6-4df7-941b-a2386f94c4f2', 'clap')
ON CONFLICT (user_id, post_id, activity_type) DO NOTHING;
*/
