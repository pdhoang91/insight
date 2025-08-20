/* Fix replies table - add post_id column */

-- Add post_id column to replies table
ALTER TABLE replies 
ADD COLUMN IF NOT EXISTS post_id uuid;

-- Update existing replies to get post_id from their comments
UPDATE replies 
SET post_id = (
    SELECT c.post_id 
    FROM comments c 
    WHERE c.id = replies.comment_id
)
WHERE post_id IS NULL;

-- Make post_id NOT NULL after updating existing records
ALTER TABLE replies 
ALTER COLUMN post_id SET NOT NULL;

-- Add foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_replies_post_id' 
        AND table_name = 'replies'
    ) THEN
        ALTER TABLE replies 
        ADD CONSTRAINT fk_replies_post_id 
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_replies_post_id ON replies(post_id);
