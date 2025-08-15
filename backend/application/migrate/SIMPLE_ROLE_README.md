# Simple Role System Migration

## Overview
Simple 2-role system with PostgreSQL constants: `user` and `admin`.

## Roles & Permissions

### User (Default)
- ✅ View posts
- ✅ View own profile  
- ✅ Update own profile
- ❌ Write posts
- ❌ View other profiles
- ❌ Admin access

### Admin
- ✅ **Full access to everything**
- ✅ Write posts
- ✅ View all profiles
- ✅ Update any profile
- ✅ Delete posts
- ✅ Admin panel access

## Migration

### Run Migration
```bash
psql -d your_database -f simple_role_system.sql
```

### What it creates:
- `user_role_enum` type with ('user', 'admin')
- Simple validation functions
- Role statistics view
- Performance index

## Usage Examples

### Database Functions
```sql
-- Check if role is valid
SELECT is_valid_role('admin'); -- Returns true

-- Check admin permissions
SELECT is_admin_role('admin'); -- Returns true
SELECT can_write_posts('user'); -- Returns false
SELECT can_view_all_profiles('admin'); -- Returns true

-- Get role statistics
SELECT * FROM simple_role_stats;
```

### Application Code

#### Frontend (JavaScript)
```javascript
import { USER_ROLES, canWritePosts, isAdmin } from '../constants/roles';

// Check permissions
if (canWritePosts(userRole)) {
  // Show write button
}

if (isAdmin(userRole)) {
  // Show admin features
}
```

#### Backend (Go)
```go
import "github.com/pdhoang91/blog/constants"

// Check permissions
if constants.CanWritePosts(user.Role) {
    // Allow post creation
}

if constants.IsAdmin(user.Role) {
    // Allow admin access
}
```

## Database Schema
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR NOT NULL,
    name VARCHAR,
    username VARCHAR,
    role user_role_enum DEFAULT 'user'::user_role_enum NOT NULL,
    -- other fields...
);
```

That's it! Simple and clean. 🎯
