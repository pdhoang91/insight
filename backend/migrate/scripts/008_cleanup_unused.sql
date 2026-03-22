-- Migration 008: Remove unused tables, columns, and indexes
-- Drops: bookmarks, follows, ratings, notifications, tabs tables
-- Drops: replies.count_reply, comments.parent_id columns
-- Drops: users.verification_token, password_reset_token, password_reset_expires_at columns

-- =====================================================
-- DROP UNUSED TABLES (with their indexes via CASCADE)
-- =====================================================

DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS tabs CASCADE;

-- =====================================================
-- DROP UNUSED COLUMNS
-- =====================================================

-- replies.count_reply: declared in entity but never written to (always 0).
-- Reply counts are computed dynamically via COUNT(*) on the replies table.
ALTER TABLE replies DROP COLUMN IF EXISTS count_reply;

-- comments.parent_id: present in DB schema but absent from the Comment entity.
-- The app uses a dedicated replies table for threaded comments.
ALTER TABLE comments DROP COLUMN IF EXISTS parent_id;

-- users: email verification and password-reset flow have no routes implemented.
ALTER TABLE users DROP COLUMN IF EXISTS verification_token;
ALTER TABLE users DROP COLUMN IF EXISTS password_reset_token;
ALTER TABLE users DROP COLUMN IF EXISTS password_reset_expires_at;

-- =====================================================
-- DROP ORPHANED INDEXES (if not already dropped by CASCADE)
-- =====================================================

DROP INDEX IF EXISTS idx_bookmarks_user_id;
DROP INDEX IF EXISTS idx_bookmarks_post_id;
DROP INDEX IF EXISTS idx_follows_follower_id;
DROP INDEX IF EXISTS idx_follows_following_id;
DROP INDEX IF EXISTS idx_ratings_user_id;
DROP INDEX IF EXISTS idx_ratings_post_id;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_is_read;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_tabs_user_id;
DROP INDEX IF EXISTS idx_comments_parent_id;

-- =====================================================
-- DROP ORPHANED TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS update_ratings_updated_at ON ratings;
DROP TRIGGER IF EXISTS update_tabs_updated_at ON tabs;

DO $$
BEGIN
    RAISE NOTICE '=== MIGRATION 008: CLEANUP UNUSED SCHEMA COMPLETED ===';
    RAISE NOTICE 'Dropped tables: bookmarks, follows, ratings, notifications, tabs';
    RAISE NOTICE 'Dropped columns: replies.count_reply, comments.parent_id';
    RAISE NOTICE 'Dropped columns: users.verification_token, password_reset_token, password_reset_expires_at';
END $$;
