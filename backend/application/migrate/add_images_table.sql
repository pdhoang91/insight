-- Migration: Add images and image_references tables
-- This migration creates the new image management system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create images table
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    storage_key VARCHAR NOT NULL,
    storage_provider VARCHAR NOT NULL DEFAULT 's3',
    original_filename VARCHAR NOT NULL,
    content_type VARCHAR NOT NULL,
    file_size BIGINT NOT NULL,
    image_type VARCHAR NOT NULL,
    user_id UUID NOT NULL,
    width INTEGER,
    height INTEGER,
    alt VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for images table
CREATE INDEX IF NOT EXISTS idx_images_storage_key ON images(storage_key);
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_image_type ON images(image_type);
CREATE INDEX IF NOT EXISTS idx_images_storage_provider ON images(storage_provider);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);

-- Create image_references table to track which images are used in which posts
CREATE TABLE IF NOT EXISTS image_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_id UUID NOT NULL,
    post_id UUID NOT NULL,
    ref_type VARCHAR NOT NULL, -- 'content', 'title'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for image_references table
CREATE INDEX IF NOT EXISTS idx_image_references_image_id ON image_references(image_id);
CREATE INDEX IF NOT EXISTS idx_image_references_post_id ON image_references(post_id);
CREATE INDEX IF NOT EXISTS idx_image_references_ref_type ON image_references(ref_type);

-- Add foreign key constraints
ALTER TABLE images 
ADD CONSTRAINT IF NOT EXISTS fk_images_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE image_references 
ADD CONSTRAINT IF NOT EXISTS fk_image_references_image_id 
FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE;

ALTER TABLE image_references 
ADD CONSTRAINT IF NOT EXISTS fk_image_references_post_id 
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- Add unique constraint to prevent duplicate references
ALTER TABLE image_references 
ADD CONSTRAINT IF NOT EXISTS uk_image_references_unique 
UNIQUE (image_id, post_id, ref_type);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for images table
DROP TRIGGER IF EXISTS update_images_updated_at ON images;
CREATE TRIGGER update_images_updated_at
    BEFORE UPDATE ON images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the tables were created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('images', 'image_references')
ORDER BY table_name, ordinal_position;
