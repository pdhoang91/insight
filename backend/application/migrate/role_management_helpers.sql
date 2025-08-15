-- Role Management Helper Functions and Procedures
-- Description: Additional helper functions for role management in PostgreSQL
-- Date: 2024-12-19

-- =====================================================
-- ROLE CONSTANTS AS STORED PROCEDURES
-- =====================================================

-- Function to get all valid roles
CREATE OR REPLACE FUNCTION get_valid_roles()
RETURNS VARCHAR[] AS $$
BEGIN
    RETURN ARRAY['user', 'admin', 'moderator'];
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get role hierarchy (higher number = more permissions)
CREATE OR REPLACE FUNCTION get_role_level(role_name VARCHAR(20))
RETURNS INTEGER AS $$
BEGIN
    CASE role_name
        WHEN 'user' THEN
            RETURN 1;
        WHEN 'moderator' THEN
            RETURN 2;
        WHEN 'admin' THEN
            RETURN 3;
        ELSE
            RETURN 0; -- Invalid role
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if role A can manage role B
CREATE OR REPLACE FUNCTION can_manage_role(manager_role VARCHAR(20), target_role VARCHAR(20))
RETURNS BOOLEAN AS $$
BEGIN
    -- Admin can manage everyone
    IF manager_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Moderator can manage users but not other moderators or admins
    IF manager_role = 'moderator' AND target_role = 'user' THEN
        RETURN TRUE;
    END IF;
    
    -- Users cannot manage anyone
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- ROLE PERMISSION MATRIX
-- =====================================================

-- Create table to store role permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(20) NOT NULL,
    permission VARCHAR(50) NOT NULL,
    granted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_name, permission)
);

-- Insert default permissions
INSERT INTO role_permissions (role_name, permission, granted) VALUES
    -- User permissions (basic)
    ('user', 'read_posts', TRUE),
    ('user', 'create_comments', TRUE),
    ('user', 'update_own_profile', TRUE),
    ('user', 'bookmark_posts', TRUE),
    
    -- Moderator permissions (includes user permissions)
    ('moderator', 'read_posts', TRUE),
    ('moderator', 'create_comments', TRUE),
    ('moderator', 'update_own_profile', TRUE),
    ('moderator', 'bookmark_posts', TRUE),
    ('moderator', 'write_posts', TRUE),
    ('moderator', 'moderate_comments', TRUE),
    ('moderator', 'delete_own_posts', TRUE),
    
    -- Admin permissions (includes all permissions)
    ('admin', 'read_posts', TRUE),
    ('admin', 'create_comments', TRUE),
    ('admin', 'update_own_profile', TRUE),
    ('admin', 'bookmark_posts', TRUE),
    ('admin', 'write_posts', TRUE),
    ('admin', 'moderate_comments', TRUE),
    ('admin', 'delete_own_posts', TRUE),
    ('admin', 'view_all_profiles', TRUE),
    ('admin', 'admin_access', TRUE),
    ('admin', 'manage_users', TRUE),
    ('admin', 'delete_any_posts', TRUE),
    ('admin', 'system_settings', TRUE)
ON CONFLICT (role_name, permission) DO NOTHING;

-- Function to check if role has permission (using permission table)
CREATE OR REPLACE FUNCTION has_role_permission(role_name VARCHAR(20), permission VARCHAR(50))
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := FALSE;
BEGIN
    SELECT granted INTO has_permission
    FROM role_permissions rp
    WHERE rp.role_name = has_role_permission.role_name 
    AND rp.permission = has_role_permission.permission;
    
    RETURN COALESCE(has_permission, FALSE);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- BULK ROLE MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to promote user to moderator
CREATE OR REPLACE FUNCTION promote_to_moderator(user_id UUID, promoted_by UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    current_role VARCHAR(20);
    success BOOLEAN := FALSE;
BEGIN
    -- Get current role
    SELECT role::VARCHAR INTO current_role FROM users WHERE id = user_id;
    
    IF current_role IS NULL THEN
        RAISE EXCEPTION 'User not found: %', user_id;
    END IF;
    
    IF current_role = 'user' THEN
        UPDATE users SET role = 'moderator'::user_role_enum WHERE id = user_id;
        
        -- Log the promotion
        INSERT INTO user_role_audit (user_id, old_role, new_role, changed_by, reason)
        VALUES (user_id, current_role, 'moderator', promoted_by, 'Promoted to moderator');
        
        success := TRUE;
        RAISE NOTICE 'User % promoted from % to moderator', user_id, current_role;
    ELSE
        RAISE NOTICE 'User % is already % - cannot promote to moderator', user_id, current_role;
    END IF;
    
    RETURN success;
END;
$$ LANGUAGE plpgsql;

-- Function to promote user to admin
CREATE OR REPLACE FUNCTION promote_to_admin(user_id UUID, promoted_by UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    current_role VARCHAR(20);
    success BOOLEAN := FALSE;
BEGIN
    -- Get current role
    SELECT role::VARCHAR INTO current_role FROM users WHERE id = user_id;
    
    IF current_role IS NULL THEN
        RAISE EXCEPTION 'User not found: %', user_id;
    END IF;
    
    IF current_role IN ('user', 'moderator') THEN
        UPDATE users SET role = 'admin'::user_role_enum WHERE id = user_id;
        
        -- Log the promotion
        INSERT INTO user_role_audit (user_id, old_role, new_role, changed_by, reason)
        VALUES (user_id, current_role, 'admin', promoted_by, 'Promoted to admin');
        
        success := TRUE;
        RAISE NOTICE 'User % promoted from % to admin', user_id, current_role;
    ELSE
        RAISE NOTICE 'User % is already admin', user_id;
    END IF;
    
    RETURN success;
END;
$$ LANGUAGE plpgsql;

-- Function to demote user
CREATE OR REPLACE FUNCTION demote_user(user_id UUID, demoted_by UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    current_role VARCHAR(20);
    new_role VARCHAR(20);
    success BOOLEAN := FALSE;
BEGIN
    -- Get current role
    SELECT role::VARCHAR INTO current_role FROM users WHERE id = user_id;
    
    IF current_role IS NULL THEN
        RAISE EXCEPTION 'User not found: %', user_id;
    END IF;
    
    -- Determine new role
    CASE current_role
        WHEN 'admin' THEN
            new_role := 'moderator';
        WHEN 'moderator' THEN
            new_role := 'user';
        ELSE
            RAISE NOTICE 'User % is already at lowest role: %', user_id, current_role;
            RETURN FALSE;
    END CASE;
    
    -- Update role
    UPDATE users SET role = new_role::user_role_enum WHERE id = user_id;
    
    -- Log the demotion
    INSERT INTO user_role_audit (user_id, old_role, new_role, changed_by, reason)
    VALUES (user_id, current_role, new_role, demoted_by, 'Demoted from ' || current_role);
    
    success := TRUE;
    RAISE NOTICE 'User % demoted from % to %', user_id, current_role, new_role;
    
    RETURN success;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROLE REPORTING FUNCTIONS
-- =====================================================

-- Function to get role change history for a user
CREATE OR REPLACE FUNCTION get_user_role_history(user_id UUID)
RETURNS TABLE(
    change_date TIMESTAMP,
    old_role VARCHAR,
    new_role VARCHAR,
    changed_by UUID,
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ura.changed_at,
        ura.old_role,
        ura.new_role,
        ura.changed_by,
        ura.reason
    FROM user_role_audit ura
    WHERE ura.user_id = get_user_role_history.user_id
    ORDER BY ura.changed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get recent role changes
CREATE OR REPLACE FUNCTION get_recent_role_changes(days INTEGER DEFAULT 30)
RETURNS TABLE(
    user_id UUID,
    username VARCHAR,
    email VARCHAR,
    old_role VARCHAR,
    new_role VARCHAR,
    changed_at TIMESTAMP,
    changed_by UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.username,
        u.email,
        ura.old_role,
        ura.new_role,
        ura.changed_at,
        ura.changed_by
    FROM user_role_audit ura
    JOIN users u ON u.id = ura.user_id
    WHERE ura.changed_at >= CURRENT_TIMESTAMP - INTERVAL '%s days' % days
    ORDER BY ura.changed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROLE VALIDATION TRIGGERS
-- =====================================================

-- Function to validate role changes
CREATE OR REPLACE FUNCTION validate_role_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent direct role changes without using proper functions for sensitive roles
    IF OLD.role != NEW.role THEN
        -- Allow changes to/from user role
        IF OLD.role = 'user' OR NEW.role = 'user' THEN
            RETURN NEW;
        END IF;
        
        -- For admin/moderator changes, log a warning
        RAISE NOTICE 'Direct role change detected: % -> % for user %', OLD.role, NEW.role, NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation trigger
DROP TRIGGER IF EXISTS validate_role_change_trigger ON users;
CREATE TRIGGER validate_role_change_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    WHEN (OLD.role IS DISTINCT FROM NEW.role)
    EXECUTE FUNCTION validate_role_change();

-- =====================================================
-- UTILITY VIEWS
-- =====================================================

-- View for easy role statistics
CREATE OR REPLACE VIEW role_statistics AS
SELECT 
    role::VARCHAR as role_name,
    COUNT(*) as user_count,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users)), 2) as percentage
FROM users
GROUP BY role
ORDER BY user_count DESC;

-- View for users with their role levels
CREATE OR REPLACE VIEW users_with_role_levels AS
SELECT 
    u.id,
    u.email,
    u.username,
    u.name,
    u.role::VARCHAR as role_name,
    get_role_level(u.role::VARCHAR) as role_level,
    get_role_display_name(u.role::VARCHAR) as role_display_name,
    u.created_at
FROM users u
ORDER BY get_role_level(u.role::VARCHAR) DESC, u.created_at;

-- =====================================================
-- EXAMPLE USAGE QUERIES
-- =====================================================

/*
-- Get role statistics
SELECT * FROM role_statistics;

-- Get all users with their role levels
SELECT * FROM users_with_role_levels;

-- Check if a user can manage another user
SELECT can_manage_role('admin', 'moderator'); -- Returns true
SELECT can_manage_role('moderator', 'admin'); -- Returns false

-- Promote a user to moderator
SELECT promote_to_moderator('user-uuid-here');

-- Get recent role changes in last 7 days
SELECT * FROM get_recent_role_changes(7);

-- Get role change history for specific user
SELECT * FROM get_user_role_history('user-uuid-here');

-- Check role permissions
SELECT has_role_permission('admin', 'manage_users'); -- Returns true
SELECT has_role_permission('user', 'admin_access'); -- Returns false
*/

-- =====================================================
-- COMPLETION LOG
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== ROLE MANAGEMENT HELPERS CREATED ===';
    RAISE NOTICE 'Available functions:';
    RAISE NOTICE '- get_valid_roles()';
    RAISE NOTICE '- get_role_level(role)';
    RAISE NOTICE '- can_manage_role(manager, target)';
    RAISE NOTICE '- has_role_permission(role, permission)';
    RAISE NOTICE '- promote_to_moderator(user_id)';
    RAISE NOTICE '- promote_to_admin(user_id)';
    RAISE NOTICE '- demote_user(user_id)';
    RAISE NOTICE '- get_user_role_history(user_id)';
    RAISE NOTICE '- get_recent_role_changes(days)';
    RAISE NOTICE 'Available views:';
    RAISE NOTICE '- role_statistics';
    RAISE NOTICE '- users_with_role_levels';
    RAISE NOTICE '=== SETUP COMPLETE ===';
END $$;
