/* Creating image_references table */

CREATE TABLE IF NOT EXISTS image_references
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_id uuid NOT NULL,
    post_id uuid NOT NULL,
    ref_type varchar(50) NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_image_references_image_id ON image_references(image_id);
CREATE INDEX IF NOT EXISTS idx_image_references_post_id ON image_references(post_id);
CREATE INDEX IF NOT EXISTS idx_image_references_ref_type ON image_references(ref_type);
