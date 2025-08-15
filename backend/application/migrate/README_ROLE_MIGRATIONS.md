# Role System Migration Guide

## Overview
This migration system creates a comprehensive role-based access control (RBAC) system in PostgreSQL with constants, validation, and management functions.

## Migration Files

### 1. `add_role_constants_and_constraints.sql`
- Creates PostgreSQL constants for user roles
- Defines `user_role_enum` type
- Creates role validation functions
- Adds table constraints and audit system
- Creates performance indexes

### 2. `update_existing_users_with_role_enum.sql`
- Backs up existing user data
- Validates and cleans existing role data
- Converts role column to use enum type
- Applies constraints and defaults
- Verifies data integrity

### 3. `role_management_helpers.sql`
- Creates advanced role management functions
- Implements role permission matrix
- Provides bulk role operations (promote/demote)
- Creates reporting and statistics functions
- Adds utility views

### 4. `run_role_migrations.sql`
- Master script that runs all migrations in correct order
- Provides verification and logging
- Shows final system status

## Quick Start

### Option 1: Run All Migrations at Once
```bash
psql -d your_database -f run_role_migrations.sql
```

### Option 2: Run Individual Migrations
```bash
# Step 1: Create constants and constraints
psql -d your_database -f add_role_constants_and_constraints.sql

# Step 2: Update existing data
psql -d your_database -f update_existing_users_with_role_enum.sql

# Step 3: Add management helpers
psql -d your_database -f role_management_helpers.sql
```

## Role System Features

### Constants and Enum Type
```sql
-- Available roles
'user'      -- Default role for new users
'moderator' -- Can write posts and moderate content
'admin'     -- Full system access

-- Enum type
user_role_enum
```

### Core Functions

#### Role Validation
```sql
-- Check if role is valid
SELECT is_valid_role('admin'); -- Returns true

-- Get default role
SELECT get_default_role(); -- Returns 'user'

-- Get role display name
SELECT get_role_display_name('admin'); -- Returns 'Super Admin'
```

#### Permission Checking
```sql
-- Check role permissions
SELECT role_has_permission('admin', 'write_posts'); -- Returns true
SELECT role_has_permission('user', 'admin_access'); -- Returns false

-- Using permission table
SELECT has_role_permission('moderator', 'write_posts'); -- Returns true
```

#### Role Management
```sql
-- Promote user to moderator
SELECT promote_to_moderator('user-uuid-here');

-- Promote user to admin
SELECT promote_to_admin('user-uuid-here');

-- Demote user (admin -> moderator -> user)
SELECT demote_user('user-uuid-here');

-- Safe role update
SELECT update_user_role('user-uuid-here', 'moderator');
```

### Reporting and Statistics

#### Role Statistics
```sql
-- View role distribution
SELECT * FROM role_statistics;

-- Get users by role
SELECT * FROM get_users_by_role('admin');

-- Get users with role levels
SELECT * FROM users_with_role_levels;
```

#### Audit and History
```sql
-- Get role change history for user
SELECT * FROM get_user_role_history('user-uuid-here');

-- Get recent role changes (last 30 days)
SELECT * FROM get_recent_role_changes(30);
```

## Permission Matrix

| Role | write_posts | view_all_profiles | admin_access | manage_users |
|------|-------------|-------------------|--------------|--------------|
| user | ❌ | ❌ | ❌ | ❌ |
| moderator | ✅ | ❌ | ❌ | ❌ |
| admin | ✅ | ✅ | ✅ | ✅ |

## Security Features

### Automatic Audit Trail
- All role changes are automatically logged in `user_role_audit` table
- Includes timestamp, old/new roles, and who made the change

### Data Validation
- Enum type ensures only valid roles can be stored
- Check constraints prevent invalid data
- Validation functions for all operations

### Role Hierarchy
- Clear hierarchy: user (1) < moderator (2) < admin (3)
- Functions to check if one role can manage another

## Application Integration

### Backend (Go)
Update your Go models to use the new enum:
```go
// In your user model
Role UserRole `json:"role" gorm:"type:user_role_enum;default:'user'"`
```

### Database Queries
```sql
-- Create new user with default role
INSERT INTO users (email, name, username) 
VALUES ('user@example.com', 'John Doe', '@johndoe');
-- Role will automatically be set to 'user'

-- Query users by role
SELECT * FROM users WHERE role = 'admin';

-- Check user permissions in queries
SELECT * FROM posts p
JOIN users u ON p.user_id = u.id
WHERE role_has_permission(u.role::VARCHAR, 'write_posts');
```

## Maintenance

### Regular Tasks
```sql
-- Check role distribution
SELECT * FROM role_statistics;

-- Review recent role changes
SELECT * FROM get_recent_role_changes(7);

-- Verify data integrity
SELECT COUNT(*) FROM users WHERE NOT is_valid_role(role::VARCHAR);
```

### Backup Considerations
- The migration creates backup tables automatically
- Consider regular backups of `user_role_audit` table
- Test role functions in staging environment first

## Troubleshooting

### Common Issues

1. **Migration fails on existing data**
   - Check for invalid roles in existing data
   - The migration will automatically fix invalid roles

2. **Enum type conflicts**
   - Drop existing enum if needed: `DROP TYPE IF EXISTS user_role_enum CASCADE;`
   - Re-run the migration

3. **Permission denied errors**
   - Ensure database user has sufficient privileges
   - May need SUPERUSER privileges for some operations

### Rollback (if needed)
```sql
-- Restore from backup (if migration created issues)
-- Note: Only use if absolutely necessary
/*
DROP TABLE IF EXISTS users CASCADE;
ALTER TABLE users_role_backup RENAME TO users;
*/
```

## Testing

### Sample Test Queries
```sql
-- Test role validation
SELECT is_valid_role('admin'), is_valid_role('invalid');

-- Test permissions
SELECT 
    role_has_permission('user', 'write_posts') as user_can_write,
    role_has_permission('moderator', 'write_posts') as mod_can_write,
    role_has_permission('admin', 'admin_access') as admin_access;

-- Test role management
SELECT promote_to_moderator('test-user-id');
SELECT get_user_role_history('test-user-id');
```

## Support

For issues or questions:
1. Check the migration logs for error messages
2. Verify your PostgreSQL version supports the features used
3. Test in a development environment first
4. Review the audit tables for unexpected changes

---

**Created**: 2024-12-19  
**Compatible with**: PostgreSQL 12+  
**Dependencies**: None (pure PostgreSQL)
