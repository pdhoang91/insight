-- Master Migration Script for Role System
-- Description: Runs all role-related migrations in correct order
-- Date: 2024-12-19
-- Usage: psql -d your_database -f run_role_migrations.sql

-- =====================================================
-- MIGRATION EXECUTION LOG
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== STARTING ROLE SYSTEM MIGRATION ===';
    RAISE NOTICE 'Timestamp: %', CURRENT_TIMESTAMP;
    RAISE NOTICE 'Database: %', CURRENT_DATABASE();
    RAISE NOTICE '==========================================';
END $$;

-- =====================================================
-- STEP 1: CREATE ROLE CONSTANTS AND CONSTRAINTS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'STEP 1: Creating role constants and constraints...';
END $$;

\i add_role_constants_and_constraints.sql

-- =====================================================
-- STEP 2: UPDATE EXISTING USERS WITH ROLE ENUM
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'STEP 2: Updating existing users with role enum...';
END $$;

\i update_existing_users_with_role_enum.sql

-- =====================================================
-- STEP 3: CREATE ROLE MANAGEMENT HELPERS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'STEP 3: Creating role management helpers...';
END $$;

\i role_management_helpers.sql

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================

DO $$
DECLARE
    total_users INTEGER;
    total_functions INTEGER;
    total_views INTEGER;
    enum_exists BOOLEAN;
BEGIN
    RAISE NOTICE '=== FINAL VERIFICATION ===';
    
    -- Check user count
    SELECT COUNT(*) INTO total_users FROM users;
    RAISE NOTICE 'Total users in system: %', total_users;
    
    -- Check if enum exists
    SELECT EXISTS(
        SELECT 1 FROM pg_type WHERE typname = 'user_role_enum'
    ) INTO enum_exists;
    RAISE NOTICE 'user_role_enum type exists: %', enum_exists;
    
    -- Check functions created
    SELECT COUNT(*) INTO total_functions
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name LIKE '%role%';
    RAISE NOTICE 'Role-related functions created: %', total_functions;
    
    -- Check views created
    SELECT COUNT(*) INTO total_views
    FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name LIKE '%role%';
    RAISE NOTICE 'Role-related views created: %', total_views;
    
    -- Display role distribution
    RAISE NOTICE '=== ROLE DISTRIBUTION ===';
    FOR rec IN (SELECT * FROM role_statistics) LOOP
        RAISE NOTICE '% users: % (%.1f%%)', 
            rec.role_name, rec.user_count, rec.percentage;
    END LOOP;
    
    RAISE NOTICE '========================';
END $$;

-- =====================================================
-- MIGRATION COMPLETION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== ROLE SYSTEM MIGRATION COMPLETED SUCCESSFULLY ===';
    RAISE NOTICE 'Completed at: %', CURRENT_TIMESTAMP;
    RAISE NOTICE '';
    RAISE NOTICE 'What was created:';
    RAISE NOTICE '✓ PostgreSQL role constants and enum type';
    RAISE NOTICE '✓ Role validation functions';
    RAISE NOTICE '✓ Role management functions (promote/demote)';
    RAISE NOTICE '✓ Role permission system';
    RAISE NOTICE '✓ Role change audit system';
    RAISE NOTICE '✓ Performance indexes';
    RAISE NOTICE '✓ Utility views and reporting functions';
    RAISE NOTICE '✓ Data validation and constraints';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test the role functions with sample data';
    RAISE NOTICE '2. Update your application code to use the new enum type';
    RAISE NOTICE '3. Consider creating your first admin user';
    RAISE NOTICE '4. Review the role_statistics view for current distribution';
    RAISE NOTICE '';
    RAISE NOTICE '=== MIGRATION SUCCESS ===';
END $$;
