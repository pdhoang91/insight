-- Add self-referencing foreign key constraint for comments parent_id
-- This is done in a separate migration to avoid circular dependency issues

ALTER TABLE comments ADD CONSTRAINT fk_comments_parent_id 
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE;
