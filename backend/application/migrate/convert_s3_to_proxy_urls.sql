-- Migration: Convert S3 URLs to proxy URLs in post content
-- This migration converts existing direct S3 URLs to proxy URLs
-- Run this ONCE after deploying the write-time conversion changes

-- Create backup table first (recommended)
CREATE TABLE IF NOT EXISTS post_contents_backup AS 
SELECT * FROM post_contents WHERE 1=0;

INSERT INTO post_contents_backup 
SELECT * FROM post_contents 
WHERE content LIKE '%https://insight.storage.s3.amazonaws.com/uploads/%';

-- Update post_contents table to use proxy URLs instead of direct S3 URLs
-- Replace with your actual image service URL
UPDATE post_contents 
SET content = REPLACE(
    content, 
    'https://insight.storage.s3.amazonaws.com/uploads/', 
    'http://localhost:82/images/proxy/'  -- Update this URL based on your environment
),
updated_at = CURRENT_TIMESTAMP
WHERE content LIKE '%https://insight.storage.s3.amazonaws.com/uploads/%';

-- Verify the changes
SELECT 
    COUNT(*) as total_posts_with_proxy_urls
FROM post_contents 
WHERE content LIKE '%/images/proxy/%';

SELECT 
    COUNT(*) as remaining_s3_urls
FROM post_contents 
WHERE content LIKE '%https://insight.storage.s3.amazonaws.com/uploads/%';

-- Show sample converted content (first 200 characters)
SELECT 
    id,
    LEFT(content, 200) as content_preview,
    updated_at
FROM post_contents 
WHERE content LIKE '%/images/proxy/%'
LIMIT 5; 