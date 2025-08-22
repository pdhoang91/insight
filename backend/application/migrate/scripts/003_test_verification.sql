-- Migration 003: Test and Verification Scripts
-- This migration contains verification queries to check system health
-- Run this after other migrations to verify everything is working correctly

-- Check current state of tables
SELECT 'Current posts count:' as info, COUNT(*) as count FROM posts;
SELECT 'Current images count:' as info, COUNT(*) as count FROM images;  
SELECT 'Current image_references count:' as info, COUNT(*) as count FROM image_references;
SELECT 'Current user_activities count:' as info, COUNT(*) as count FROM user_activities;

-- Check for any orphaned image references (should be 0 after fix)
SELECT 'Orphaned image references (should be 0):' as info, COUNT(*) as count 
FROM image_references ir 
LEFT JOIN posts p ON ir.post_id = p.id 
WHERE p.id IS NULL;

-- Check for any image references pointing to non-existent images
SELECT 'Invalid image references (should be 0):' as info, COUNT(*) as count
FROM image_references ir 
LEFT JOIN images i ON ir.image_id = i.id 
WHERE i.id IS NULL;

-- Check table structures
SELECT 'user_activities table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_activities' 
ORDER BY ordinal_position;

SELECT 'replies table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'replies' 
ORDER BY ordinal_position;

-- Check indexes
SELECT 'Indexes on user_activities:' as info;
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'user_activities' 
ORDER BY indexname;

-- Check constraints
SELECT 'Constraints added:' as info;
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name IN ('user_activities', 'replies') 
AND constraint_type IN ('CHECK', 'UNIQUE')
ORDER BY table_name, constraint_name;

-- Sample data verification
SELECT 'Sample user_activities data:' as info;
SELECT action_type, COUNT(*) as total_records, SUM(count) as total_claps 
FROM user_activities 
GROUP BY action_type 
ORDER BY action_type;

-- Show recent posts with their image reference counts
SELECT 
    'Recent posts with image references:' as info;
    
SELECT 
    p.id,
    p.title,
    p.created_at,
    COUNT(ir.id) as image_ref_count
FROM posts p 
LEFT JOIN image_references ir ON p.id = ir.post_id 
WHERE p.created_at > NOW() - INTERVAL '1 day'
GROUP BY p.id, p.title, p.created_at
ORDER BY p.created_at DESC
LIMIT 10;

-- Show any constraint violations that might exist
SELECT 'Checking foreign key constraints...' as info;

-- This query will show any constraint violations
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    confrelid::regclass as referenced_table
FROM pg_constraint 
WHERE conrelid = 'image_references'::regclass 
AND contype = 'f';

-- Final verification message
DO $$
BEGIN
    RAISE NOTICE '=== MIGRATION 003: VERIFICATION COMPLETED ===';
    RAISE NOTICE 'System health check completed';
    RAISE NOTICE 'Review the output above for any issues';
END $$;
