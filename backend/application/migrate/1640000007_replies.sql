/* Creating replies table */

CREATE TABLE IF NOT EXISTS replies
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_replies_comment_id ON replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_replies_user_id ON replies(user_id);
CREATE INDEX IF NOT EXISTS idx_replies_created_at ON replies(created_at);
