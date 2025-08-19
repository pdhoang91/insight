-- Migration: Migrate legacy images to new system
-- This script creates image records for existing images referenced in post_contents
-- Run this AFTER creating the images table and BEFORE switching to the new system

-- Step 1: Create a function to extract image info from legacy URLs
CREATE OR REPLACE FUNCTION extract_legacy_image_info(url TEXT)
RETURNS TABLE (
    user_id_str TEXT,
    date_str TEXT,
    image_type TEXT,
    filename TEXT,
    storage_key TEXT
) AS $$
BEGIN
    -- Extract from proxy URL format: /images/proxy/{userID}/{date}/{type}/{filename}
    RETURN QUERY
    SELECT 
        (regexp_matches(url, '/images/proxy/([^/]+)/([^/]+)/([^/]+)/([^/]+)'))[1] as user_id_str,
        (regexp_matches(url, '/images/proxy/([^/]+)/([^/]+)/([^/]+)/([^/]+)'))[2] as date_str,
        (regexp_matches(url, '/images/proxy/([^/]+)/([^/]+)/([^/]+)/([^/]+)'))[3] as image_type,
        (regexp_matches(url, '/images/proxy/([^/]+)/([^/]+)/([^/]+)/([^/]+)'))[4] as filename,
        'uploads/' || 
        (regexp_matches(url, '/images/proxy/([^/]+)/([^/]+)/([^/]+)/([^/]+)'))[1] || '/' ||
        (regexp_matches(url, '/images/proxy/([^/]+)/([^/]+)/([^/]+)/([^/]+)'))[2] || '/' ||
        (regexp_matches(url, '/images/proxy/([^/]+)/([^/]+)/([^/]+)/([^/]+)'))[3] || '/' ||
        (regexp_matches(url, '/images/proxy/([^/]+)/([^/]+)/([^/]+)/([^/]+)'))[4] as storage_key
    WHERE url ~ '/images/proxy/[^/]+/[^/]+/[^/]+/[^/]+';
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create temporary table to hold extracted image data
CREATE TEMP TABLE temp_legacy_images AS
WITH image_urls AS (
    -- Extract all image URLs from post content
    SELECT DISTINCT
        pc.post_id,
        regexp_split_to_table(pc.content, '<img[^>]*src=[''"]([^''"]*)[''"][^>]*>') as url_match
    FROM post_contents pc
    WHERE pc.content ~ '/images/proxy/'
),
parsed_urls AS (
    SELECT 
        iu.post_id,
        iu.url_match as original_url,
        eli.*
    FROM image_urls iu
    CROSS JOIN LATERAL extract_legacy_image_info(iu.url_match) eli
    WHERE iu.url_match ~ '/images/proxy/'
)
SELECT DISTINCT
    pu.user_id_str::uuid as user_id,
    pu.date_str,
    pu.image_type,
    pu.filename,
    pu.storage_key,
    pu.original_url,
    -- Estimate file info (we don't have access to actual files)
    'image/' || CASE 
        WHEN pu.filename ~* '\.(jpg|jpeg)$' THEN 'jpeg'
        WHEN pu.filename ~* '\.png$' THEN 'png'
        WHEN pu.filename ~* '\.gif$' THEN 'gif'
        WHEN pu.filename ~* '\.webp$' THEN 'webp'
        ELSE 'jpeg'
    END as estimated_content_type,
    -- Estimate file size (default to 1MB for unknown)
    1048576 as estimated_file_size
FROM parsed_urls pu
WHERE pu.user_id_str IS NOT NULL
  AND pu.user_id_str ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

-- Step 3: Insert legacy images into the images table
INSERT INTO images (
    storage_key,
    storage_provider,
    original_filename,
    content_type,
    file_size,
    image_type,
    user_id,
    created_at,
    updated_at
)
SELECT DISTINCT
    tli.storage_key,
    's3' as storage_provider,
    tli.filename as original_filename,
    tli.estimated_content_type,
    tli.estimated_file_size,
    tli.image_type,
    tli.user_id,
    COALESCE(
        to_timestamp(tli.date_str, 'YYYY-MM-DD'),
        CURRENT_TIMESTAMP
    ) as created_at,
    CURRENT_TIMESTAMP as updated_at
FROM temp_legacy_images tli
WHERE NOT EXISTS (
    SELECT 1 FROM images i 
    WHERE i.storage_key = tli.storage_key
);

-- Step 4: Create image references for content images
INSERT INTO image_references (image_id, post_id, ref_type, created_at)
SELECT DISTINCT
    i.id as image_id,
    pc.post_id,
    'content' as ref_type,
    CURRENT_TIMESTAMP as created_at
FROM post_contents pc
CROSS JOIN LATERAL (
    SELECT unnest(regexp_split_to_array(pc.content, '<img[^>]*src=[''"]([^''"]*)[''"][^>]*>')) as url
) urls
JOIN temp_legacy_images tli ON urls.url = tli.original_url
JOIN images i ON i.storage_key = tli.storage_key
WHERE pc.content ~ '/images/proxy/'
  AND NOT EXISTS (
    SELECT 1 FROM image_references ir 
    WHERE ir.image_id = i.id AND ir.post_id = pc.post_id AND ir.ref_type = 'content'
  );

-- Step 5: Handle title images (stored in posts.image_title)
INSERT INTO image_references (image_id, post_id, ref_type, created_at)
SELECT DISTINCT
    i.id as image_id,
    p.id as post_id,
    'title' as ref_type,
    CURRENT_TIMESTAMP as created_at
FROM posts p
JOIN temp_legacy_images tli ON p.image_title = tli.original_url
JOIN images i ON i.storage_key = tli.storage_key
WHERE p.image_title ~ '/images/proxy/'
  AND NOT EXISTS (
    SELECT 1 FROM image_references ir 
    WHERE ir.image_id = i.id AND ir.post_id = p.id AND ir.ref_type = 'title'
  );

-- Step 6: Update post_contents to use data-image-id format
UPDATE post_contents 
SET content = (
    SELECT string_agg(
        CASE 
            WHEN part ~ '/images/proxy/' THEN
                CASE 
                    WHEN i.id IS NOT NULL THEN 
                        regexp_replace(part, 'src=[''"]([^''"]*)[''"]', 'data-image-id="' || i.id || '"')
                    ELSE part
                END
            ELSE part
        END,
        ''
    )
    FROM (
        SELECT 
            unnest(regexp_split_to_array(content, '(<img[^>]*>)')) as part
    ) parts
    LEFT JOIN temp_legacy_images tli ON parts.part ~ tli.original_url
    LEFT JOIN images i ON i.storage_key = tli.storage_key
),
updated_at = CURRENT_TIMESTAMP
WHERE content ~ '/images/proxy/';

-- Step 7: Clean up
DROP FUNCTION IF EXISTS extract_legacy_image_info(TEXT);

-- Step 8: Verification queries
SELECT 'Migration Summary:' as status;

SELECT 
    COUNT(*) as total_migrated_images,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT image_type) as image_types
FROM images 
WHERE created_at >= CURRENT_DATE;

SELECT 
    image_type,
    COUNT(*) as count
FROM images 
WHERE created_at >= CURRENT_DATE
GROUP BY image_type;

SELECT 
    COUNT(*) as total_image_references,
    ref_type,
    COUNT(DISTINCT post_id) as unique_posts
FROM image_references 
WHERE created_at >= CURRENT_DATE
GROUP BY ref_type;

SELECT 
    COUNT(*) as posts_with_data_image_id
FROM post_contents 
WHERE content ~ 'data-image-id=';

SELECT 
    COUNT(*) as remaining_proxy_urls
FROM post_contents 
WHERE content ~ '/images/proxy/';

-- Show sample converted content
SELECT 
    id,
    LEFT(content, 200) as content_preview,
    updated_at
FROM post_contents 
WHERE content ~ 'data-image-id='
LIMIT 3;
