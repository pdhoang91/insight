/* Creating categories table */

CREATE TABLE IF NOT EXISTS categories
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(255) UNIQUE NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
