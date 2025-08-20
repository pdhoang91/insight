/* Creating tags table */

CREATE TABLE IF NOT EXISTS tags
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(255) UNIQUE NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
