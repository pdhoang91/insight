/* Creating post_content table */

CREATE TABLE IF NOT EXISTS post_content
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id uuid UNIQUE NOT NULL,
    content text,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_content_post_id ON post_content(post_id);
