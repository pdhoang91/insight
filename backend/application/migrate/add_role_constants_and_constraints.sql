-- Migration: Add Role Constants and Constraints
-- Description: Create PostgreSQL constants for user roles and add validation constraints
-- Date: 2024-12-19

-- =====================================================
-- ROLE CONSTANTS DECLARATION
-- =====================================================

DO $$
DECLARE
    -- User Role Constants
    ROLE_USER CONSTANT VARCHAR(20) := 'user';
    ROLE_ADMIN CONSTANT VARCHAR(20) := 'admin';
    
    -- Permission Constants
    PERMISSION_WRITE_POSTS CONSTANT VARCHAR(50) := 'write_posts';
    PERMISSION_VIEW_ALL_PROFILES CONSTANT VARCHAR(50) := 'view_all_profiles';
    PERMISSION_ADMIN_ACCESS CONSTANT VARCHAR(50) := 'admin_access';
    
BEGIN
    -- Log the constants being created
    RAISE NOTICE 'Creating role constants: %, %, %', ROLE_USER, ROLE_ADMIN, ROLE_MODERATOR;
END $$;

-- =====================================================
-- CREATE ENUM TYPE FOR ROLES (Alternative approach)
-- =====================================================

-- Drop existing enum if it exists
DROP TYPE IF EXISTS user_role_enum CASCADE;

-- Create enum type for user roles
CREATE TYPE user_role_enum AS ENUM ('user', 'admin', 'moderator');

-- =====================================================
-- CREATE ROLE VALIDATION FUNCTIONS
-- =====================================================

-- Function to validate if a role is valid
CREATE OR REPLACE FUNCTION is_valid_role(role_name VARCHAR(20))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN role_name IN ('user', 'admin', 'moderator');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get default role
CREATE OR REPLACE FUNCTION get_default_role()
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN 'user';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if role has specific permission
CREATE OR REPLACE FUNCTION role_has_permission(role_name VARCHAR(20), permission VARCHAR(50))
RETURNS BOOLEAN AS $$
BEGIN
    CASE permission
        WHEN 'write_posts' THEN
            RETURN role_name IN ('admin', 'moderator');
        WHEN 'view_all_profiles' THEN
            RETURN role_name = 'admin';
        WHEN 'admin_access' THEN
            RETURN role_name = 'admin';
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get role display name
CREATE OR REPLACE FUNCTION get_role_display_name(role_name VARCHAR(20))
RETURNS VARCHAR(50) AS $$
BEGIN
    CASE role_name
        WHEN 'admin' THEN
            RETURN 'Super Admin';
        WHEN 'moderator' THEN
            RETURN 'Moderator';
        WHEN 'user' THEN
            RETURN 'User';
        ELSE
            RETURN 'Unknown';
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- UPDATE USERS TABLE WITH ROLE CONSTRAINTS
-- =====================================================

-- Add check constraint to ensure role is valid
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_role_check' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_role_check;
    END IF;
    
    -- Add new constraint using our validation function
    ALTER TABLE users ADD CONSTRAINT users_role_check 
        CHECK (is_valid_role(role::VARCHAR));
        
    -- Ensure role column has a default value
    ALTER TABLE users ALTER COLUMN role SET DEFAULT get_default_role();
    
    RAISE NOTICE 'Added role validation constraints to users table';
END $$;

-- =====================================================
-- CREATE ROLE MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to safely update user role
CREATE OR REPLACE FUNCTION update_user_role(user_id UUID, new_role VARCHAR(20))
RETURNS BOOLEAN AS $$
BEGIN
    -- Validate the new role
    IF NOT is_valid_role(new_role) THEN
        RAISE EXCEPTION 'Invalid role: %. Valid roles are: user, admin, moderator', new_role;
    END IF;
    
    -- Update the user role
    UPDATE users SET role = new_role::user_role_enum WHERE id = user_id;
    
    -- Check if update was successful
    IF FOUND THEN
        RAISE NOTICE 'Successfully updated user % role to %', user_id, new_role;
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'User % not found', user_id;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get users by role
CREATE OR REPLACE FUNCTION get_users_by_role(target_role VARCHAR(20))
RETURNS TABLE(
    id UUID,
    email VARCHAR,
    name VARCHAR,
    username VARCHAR,
    role VARCHAR,
    created_at TIMESTAMP
) AS $$
BEGIN
    -- Validate the role
    IF NOT is_valid_role(target_role) THEN
        RAISE EXCEPTION 'Invalid role: %. Valid roles are: user, admin, moderator', target_role;
    END IF;
    
    RETURN QUERY
    SELECT u.id, u.email, u.name, u.username, u.role::VARCHAR, u.created_at
    FROM users u
    WHERE u.role::VARCHAR = target_role
    ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE ROLE STATISTICS FUNCTIONS
-- =====================================================

-- Function to get role statistics
CREATE OR REPLACE FUNCTION get_role_statistics()
RETURNS TABLE(
    role_name VARCHAR,
    user_count BIGINT,
    percentage NUMERIC(5,2)
) AS $$
DECLARE
    total_users BIGINT;
BEGIN
    -- Get total user count
    SELECT COUNT(*) INTO total_users FROM users;
    
    -- Return role statistics
    RETURN QUERY
    SELECT 
        u.role::VARCHAR as role_name,
        COUNT(*) as user_count,
        ROUND((COUNT(*) * 100.0 / total_users), 2) as percentage
    FROM users u
    GROUP BY u.role
    ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE AUDIT TRIGGER FOR ROLE CHANGES
-- =====================================================

-- Create audit table for role changes
CREATE TABLE IF NOT EXISTS user_role_audit (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    old_role VARCHAR(20),
    new_role VARCHAR(20) NOT NULL,
    changed_by UUID, -- ID of admin who made the change
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT
);

-- Create trigger function for role change audit
CREATE OR REPLACE FUNCTION audit_role_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if role actually changed
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        INSERT INTO user_role_audit (user_id, old_role, new_role, changed_at)
        VALUES (NEW.id, OLD.role::VARCHAR, NEW.role::VARCHAR, CURRENT_TIMESTAMP);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS user_role_change_audit ON users;
CREATE TRIGGER user_role_change_audit
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION audit_role_change();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Create index on role column for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create index on audit table
CREATE INDEX IF NOT EXISTS idx_user_role_audit_user_id ON user_role_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_audit_changed_at ON user_role_audit(changed_at);

-- =====================================================
-- SAMPLE QUERIES AND USAGE EXAMPLES
-- =====================================================

-- Example usage (commented out for migration):
/*
-- Check if a role is valid
SELECT is_valid_role('admin'); -- Returns true
SELECT is_valid_role('invalid'); -- Returns false

-- Check role permissions
SELECT role_has_permission('admin', 'write_posts'); -- Returns true
SELECT role_has_permission('user', 'admin_access'); -- Returns false

-- Get role statistics
SELECT * FROM get_role_statistics();

-- Get all admin users
SELECT * FROM get_users_by_role('admin');

-- Update user role safely
SELECT update_user_role('user-uuid-here', 'moderator');

-- Get role display name
SELECT get_role_display_name('admin'); -- Returns 'Super Admin'
*/

-- =====================================================
-- MIGRATION COMPLETION LOG
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== ROLE CONSTANTS AND CONSTRAINTS MIGRATION COMPLETED ===';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '- user_role_enum type';
    RAISE NOTICE '- Role validation functions';
    RAISE NOTICE '- Role management functions';
    RAISE NOTICE '- Role statistics functions';
    RAISE NOTICE '- Role change audit system';
    RAISE NOTICE '- Performance indexes';
    RAISE NOTICE '- Table constraints';
    RAISE NOTICE '=== MIGRATION SUCCESS ===';
END $$;
