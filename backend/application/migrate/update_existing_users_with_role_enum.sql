-- Migration: Update Existing Users with Role Enum
-- Description: Convert existing role data to use the new enum type and apply constraints
-- Date: 2024-12-19
-- Prerequisites: add_role_constants_and_constraints.sql must be run first

-- =====================================================
-- BACKUP EXISTING DATA
-- =====================================================

-- Create backup table for safety
CREATE TABLE IF NOT EXISTS users_role_backup AS 
SELECT id, role, created_at, updated_at 
FROM users 
WHERE 1=1; -- Copy all rows

-- Log backup creation
DO $$
DECLARE
    backup_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO backup_count FROM users_role_backup;
    RAISE NOTICE 'Created backup of % user records', backup_count;
END $$;

-- =====================================================
-- DATA VALIDATION AND CLEANUP
-- =====================================================

-- Check for invalid roles in existing data
DO $$
DECLARE
    invalid_count INTEGER;
    invalid_roles TEXT;
BEGIN
    -- Count invalid roles
    SELECT COUNT(*) INTO invalid_count 
    FROM users 
    WHERE role::VARCHAR NOT IN ('user', 'admin', 'moderator');
    
    IF invalid_count > 0 THEN
        -- Get list of invalid roles
        SELECT STRING_AGG(DISTINCT role::VARCHAR, ', ') INTO invalid_roles
        FROM users 
        WHERE role::VARCHAR NOT IN ('user', 'admin', 'moderator');
        
        RAISE NOTICE 'Found % users with invalid roles: %', invalid_count, invalid_roles;
        
        -- Fix invalid roles by setting them to default
        UPDATE users 
        SET role = get_default_role()::user_role_enum
        WHERE role::VARCHAR NOT IN ('user', 'admin', 'moderator');
        
        RAISE NOTICE 'Updated % users with invalid roles to default role: %', invalid_count, get_default_role();
    ELSE
        RAISE NOTICE 'All existing roles are valid';
    END IF;
END $$;

-- =====================================================
-- UPDATE ROLE COLUMN TO USE ENUM TYPE
-- =====================================================

-- First, let's check current role column type
DO $$
DECLARE
    current_type TEXT;
BEGIN
    SELECT data_type INTO current_type
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role';
    
    RAISE NOTICE 'Current role column type: %', current_type;
    
    -- If it's not already user_role_enum, convert it
    IF current_type != 'USER-DEFINED' THEN
        RAISE NOTICE 'Converting role column to use user_role_enum...';
        
        -- Convert the column to use enum type
        ALTER TABLE users 
        ALTER COLUMN role TYPE user_role_enum 
        USING role::VARCHAR::user_role_enum;
        
        RAISE NOTICE 'Successfully converted role column to user_role_enum type';
    ELSE
        RAISE NOTICE 'Role column already uses enum type';
    END IF;
END $$;

-- =====================================================
-- ENSURE DEFAULT VALUES AND CONSTRAINTS
-- =====================================================

-- Set default value for role column
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'::user_role_enum;

-- Ensure NOT NULL constraint
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

-- =====================================================
-- DATA VERIFICATION
-- =====================================================

-- Verify all roles are now valid
DO $$
DECLARE
    total_users INTEGER;
    user_count INTEGER;
    admin_count INTEGER;
    moderator_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users FROM users;
    SELECT COUNT(*) INTO user_count FROM users WHERE role = 'user';
    SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'admin';
    SELECT COUNT(*) INTO moderator_count FROM users WHERE role = 'moderator';
    
    RAISE NOTICE '=== ROLE DISTRIBUTION ===';
    RAISE NOTICE 'Total users: %', total_users;
    RAISE NOTICE 'Regular users: % (%.1f%%)', user_count, (user_count * 100.0 / total_users);
    RAISE NOTICE 'Admins: % (%.1f%%)', admin_count, (admin_count * 100.0 / total_users);
    RAISE NOTICE 'Moderators: % (%.1f%%)', moderator_count, (moderator_count * 100.0 / total_users);
    RAISE NOTICE '========================';
END $$;

-- =====================================================
-- CREATE SAMPLE ADMIN USER (Optional)
-- =====================================================

-- Uncomment and modify this section if you want to create a sample admin user
/*
DO $$
DECLARE
    admin_email CONSTANT VARCHAR(255) := 'admin@insight.io.vn';
    admin_exists BOOLEAN;
BEGIN
    -- Check if admin user already exists
    SELECT EXISTS(SELECT 1 FROM users WHERE email = admin_email) INTO admin_exists;
    
    IF NOT admin_exists THEN
        INSERT INTO users (
            email, 
            name, 
            username, 
            role, 
            avatar_url,
            email_verified,
            created_at,
            updated_at
        ) VALUES (
            admin_email,
            'System Administrator',
            '@admin',
            'admin'::user_role_enum,
            'https://www.w3schools.com/w3images/avatar2.png',
            true,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Created sample admin user: %', admin_email;
    ELSE
        RAISE NOTICE 'Admin user already exists: %', admin_email;
    END IF;
END $$;
*/

-- =====================================================
-- PERFORMANCE OPTIMIZATION
-- =====================================================

-- Update table statistics
ANALYZE users;

-- Reindex role-related indexes
REINDEX INDEX idx_users_role;

-- =====================================================
-- CLEANUP BACKUP TABLE (Optional)
-- =====================================================

-- Uncomment this section after verifying everything works correctly
/*
DROP TABLE IF EXISTS users_role_backup;
RAISE NOTICE 'Cleaned up backup table';
*/

-- =====================================================
-- MIGRATION COMPLETION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== EXISTING USERS ROLE MIGRATION COMPLETED ===';
    RAISE NOTICE 'Successfully:';
    RAISE NOTICE '- Backed up existing data';
    RAISE NOTICE '- Validated and cleaned role data';
    RAISE NOTICE '- Converted role column to enum type';
    RAISE NOTICE '- Applied constraints and defaults';
    RAISE NOTICE '- Verified data integrity';
    RAISE NOTICE '=== MIGRATION SUCCESS ===';
END $$;
