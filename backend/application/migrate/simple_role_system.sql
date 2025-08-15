-- Simple Role System Migration
-- Description: Create simple 2-role system (user, admin) with PostgreSQL constants
-- Date: 2024-12-19

-- =====================================================
-- ROLE CONSTANTS DECLARATION
-- =====================================================

DO $$
DECLARE
    -- User Role Constants
    ROLE_USER CONSTANT VARCHAR(20) := 'user';
    ROLE_ADMIN CONSTANT VARCHAR(20) := 'admin';
    
BEGIN
    RAISE NOTICE 'Creating simple role system with roles: %, %', ROLE_USER, ROLE_ADMIN;
END $$;

-- =====================================================
-- CREATE ENUM TYPE FOR ROLES
-- =====================================================

-- Drop existing enum if it exists
DROP TYPE IF EXISTS user_role_enum CASCADE;

-- Create simple enum type for user roles
CREATE TYPE user_role_enum AS ENUM ('user', 'admin');

-- =====================================================
-- CREATE SIMPLE VALIDATION FUNCTIONS
-- =====================================================

-- Function to validate if a role is valid
CREATE OR REPLACE FUNCTION is_valid_role(role_name VARCHAR(20))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN role_name IN ('user', 'admin');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get default role
CREATE OR REPLACE FUNCTION get_default_role()
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN 'user';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if role has admin permissions
CREATE OR REPLACE FUNCTION is_admin_role(role_name VARCHAR(20))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN role_name = 'admin';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- UPDATE USERS TABLE
-- =====================================================

DO $$
BEGIN
    -- Check if users table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        
        -- Clean up any invalid roles first
        UPDATE users 
        SET role = 'user' 
        WHERE role::VARCHAR NOT IN ('user', 'admin');
        
        -- Convert role column to enum type
        ALTER TABLE users 
        ALTER COLUMN role TYPE user_role_enum 
        USING role::VARCHAR::user_role_enum;
        
        -- Set default value and constraints
        ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'::user_role_enum;
        ALTER TABLE users ALTER COLUMN role SET NOT NULL;
        
        RAISE NOTICE 'Updated users table with simple role system';
    ELSE
        RAISE NOTICE 'Users table does not exist yet - will be created with proper role type';
    END IF;
END $$;

-- =====================================================
-- CREATE SIMPLE ROLE CHECK FUNCTIONS
-- =====================================================

-- Function to check if user can write posts (admin only)
CREATE OR REPLACE FUNCTION can_write_posts(role_name VARCHAR(20))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN role_name = 'admin';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if user can view all profiles (admin only)
CREATE OR REPLACE FUNCTION can_view_all_profiles(role_name VARCHAR(20))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN role_name = 'admin';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if user can manage system (admin only)
CREATE OR REPLACE FUNCTION has_admin_access(role_name VARCHAR(20))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN role_name = 'admin';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- CREATE SIMPLE STATISTICS VIEW
-- =====================================================

CREATE OR REPLACE VIEW simple_role_stats AS
SELECT 
    role::VARCHAR as role_name,
    COUNT(*) as user_count,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users)), 2) as percentage
FROM users
GROUP BY role
ORDER BY 
    CASE role::VARCHAR 
        WHEN 'admin' THEN 1 
        WHEN 'user' THEN 2 
    END;

-- =====================================================
-- CREATE INDEX FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_simple_role ON users(role);

-- =====================================================
-- VERIFICATION AND COMPLETION
-- =====================================================

DO $$
DECLARE
    total_users INTEGER;
    admin_count INTEGER;
    user_count INTEGER;
BEGIN
    -- Get counts
    SELECT COUNT(*) INTO total_users FROM users WHERE 1=1;
    SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'admin';
    SELECT COUNT(*) INTO user_count FROM users WHERE role = 'user';
    
    RAISE NOTICE '=== SIMPLE ROLE SYSTEM CREATED ===';
    RAISE NOTICE 'Total users: %', total_users;
    RAISE NOTICE 'Admin users: % (%.1f%%)', admin_count, 
        CASE WHEN total_users > 0 THEN (admin_count * 100.0 / total_users) ELSE 0 END;
    RAISE NOTICE 'Regular users: % (%.1f%%)', user_count,
        CASE WHEN total_users > 0 THEN (user_count * 100.0 / total_users) ELSE 0 END;
    RAISE NOTICE '';
    RAISE NOTICE 'Available functions:';
    RAISE NOTICE '- is_valid_role(role) - Check if role is valid';
    RAISE NOTICE '- get_default_role() - Get default role (user)';
    RAISE NOTICE '- is_admin_role(role) - Check if role is admin';
    RAISE NOTICE '- can_write_posts(role) - Check write permission';
    RAISE NOTICE '- can_view_all_profiles(role) - Check profile view permission';
    RAISE NOTICE '- has_admin_access(role) - Check admin access';
    RAISE NOTICE '';
    RAISE NOTICE 'Available views:';
    RAISE NOTICE '- simple_role_stats - Role distribution statistics';
    RAISE NOTICE '';
    RAISE NOTICE '=== MIGRATION COMPLETED SUCCESSFULLY ===';
END $$;
