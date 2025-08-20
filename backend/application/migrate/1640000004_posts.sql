/* Creating posts table */

CREATE TABLE IF NOT EXISTS posts
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title varchar(500) NOT NULL,
    image_title text,
    title_name varchar(500) UNIQUE,
    preview_content text,
    user_id uuid NOT NULL,
    views bigint DEFAULT 0,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_title_name ON posts(title_name);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_views ON posts(views);
