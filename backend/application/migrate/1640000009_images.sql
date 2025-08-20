/* Creating images table */

CREATE TABLE IF NOT EXISTS images
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    storage_key varchar(500) NOT NULL,
    storage_provider varchar(50) DEFAULT 's3',
    original_filename varchar(500) NOT NULL,
    content_type varchar(100) NOT NULL,
    file_size bigint NOT NULL,
    image_type varchar(50) NOT NULL,
    user_id uuid NOT NULL,
    width integer,
    height integer,
    alt text,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_storage_key ON images(storage_key);
CREATE INDEX IF NOT EXISTS idx_images_image_type ON images(image_type);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);
