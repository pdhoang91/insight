# Clap System Setup Guide

## Quick Fix for "user_activities does not exist" Error

If you're getting this error:
```json
{
    "error": "Database error: ERROR: relation \"user_activities\" does not exist (SQLSTATE 42P01)"
}
```

### Option 1: Run SQL Migration (Recommended)

1. Connect to your PostgreSQL database:
```bash
psql -h localhost -p 5432 -U postgres -d insight
```

2. Run the migration script:
```sql
-- Create user_activities table
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    post_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_user_activities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_activities_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate claps
    CONSTRAINT unique_user_post_activity UNIQUE(user_id, post_id, activity_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activities_post_id ON user_activities(post_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_post_type ON user_activities(post_id, activity_type);
```

3. Or run from file:
```bash
psql -h localhost -p 5432 -U postgres -d insight -f migrate/user_activities.sql
```

### Option 2: Use GORM AutoMigrate

1. Make sure your environment variables are set:
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=your_password
export DB_NAME=insight
export JWT_SECRET=your-secret-key
```

2. Run the migration tool:
```bash
go run cmd/migrate.go
```

### Option 3: Use Docker Compose (if applicable)

If you're using Docker, make sure to run migrations after the database is up:
```bash
docker-compose up -d postgres
docker-compose exec backend go run cmd/migrate.go
```

## Testing the Clap System

After migration, these endpoints should work:

### 1. Clap a post:
```bash
POST /api/post/:id/clap
Authorization: Bearer <your-jwt-token>

Response:
{
  "message": "Post clapped successfully",
  "clapped": true,
  "clap_count": 1
}
```

### 2. Get popular posts (sorted by claps):
```bash
GET /posts/popular?limit=5

Response:
{
  "data": [
    {
      "id": "post-123",
      "title": "Popular Post",
      "clap_count": 15,
      // ... other fields
    }
  ]
}
```

### 3. All post endpoints now include clap_count:
- `GET /posts`
- `GET /posts/latest`  
- `GET /posts/popular`
- `GET /p/:title_name`

## Troubleshooting

### Error: "connection refused"
- Make sure PostgreSQL is running
- Check your database connection settings

### Error: "table doesn't exist"
- Run the migration SQL script above
- Or use the migration tool: `go run cmd/migrate.go`

### Error: "permission denied"
- Make sure you have the right database permissions
- Try running with sudo if needed

## Features

✅ **Toggle Clap/Unclap**: One endpoint handles both actions  
✅ **Duplicate Prevention**: Users can't clap the same post twice  
✅ **Real-time Counts**: Clap counts update immediately  
✅ **Popular Posts**: Posts sorted by clap count  
✅ **Performance**: Proper database indexes  
✅ **Error Handling**: Graceful degradation if system not setup  

## Database Schema

```sql
Table: user_activities
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users.id)
- post_id (UUID, Foreign Key → posts.id)  
- activity_type (VARCHAR, 'clap' | 'view' | 'comment')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

Unique Constraint: (user_id, post_id, activity_type)
```

This ensures each user can only clap each post once, and provides foundation for future activity tracking.
