-- Migration 010: Remove clap system
-- Drops: clap_count column from posts, comments, replies
-- Drops: user_activities table and related indexes

-- Drop denormalized clap_count columns
ALTER TABLE posts DROP COLUMN IF EXISTS clap_count;
ALTER TABLE comments DROP COLUMN IF EXISTS clap_count;
ALTER TABLE replies DROP COLUMN IF EXISTS clap_count;

-- Drop user_activities table (only used for clap tracking)
DROP TABLE IF EXISTS user_activities CASCADE;

DO $$
BEGIN
    RAISE NOTICE '=== MIGRATION 010: REMOVE CLAP SYSTEM COMPLETED ===';
    RAISE NOTICE 'Dropped columns: posts.clap_count, comments.clap_count, replies.clap_count';
    RAISE NOTICE 'Dropped table: user_activities';
END $$;
