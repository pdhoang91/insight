# Image Management API Documentation

## Overview

The Image Management API provides comprehensive functionality for uploading, managing, and serving images with S3 storage backend. It supports different image types (avatar, title, content, general) and environment-based bucket management.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   S3 Storage    │
│                 │    │                 │    │                 │
│ - Upload Form   │───▶│ - Image API     │───▶│ - Dev Bucket    │
│ - Image Display │    │ - S3 Service    │    │ - Staging Bucket│
│ - Post Editor   │    │ - Lifecycle Mgmt│    │ - Prod Bucket   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## S3 Configuration

### Hardcoded Settings
- **Region**: `us-east-1` (hardcoded in config)
- **Bucket**: `insight` (hardcoded in config)
- **No environment variables needed** for region/bucket

### S3 Key Structure
```
uploads/{type}/{user_id}/{filename}
```

Example:
```
uploads/avatar/31781f8b-cb7b-4bf2-bf25-2bf9aa9258bd/avatar_1703123456.jpg
```

## API Endpoints

### 1. Upload Image

**POST** `/images/upload/v2/{type}`

Upload an image to S3 and create database record.

#### Parameters
- `type` (path): Image type (`avatar`, `title`, `content`, `general`)

#### Request
```bash
curl -X POST "http://localhost:81/images/upload/v2/avatar" \
  -H "Authorization: Bearer {jwt_token}" \
  -F "image=@avatar.jpg"
```

#### Response
```json
{
  "success": true,
  "data": {
    "image_id": "123e4567-e89b-12d3-a456-426614174000",
    "url": "https://insight-dev.s3.us-east-1.amazonaws.com/uploads/development/avatar/user_id/filename.jpg",
    "s3_key": "uploads/development/avatar/user_id/filename.jpg",
    "filename": "avatar_1703123456.jpg",
    "content_type": "image/jpeg",
    "size": 245760,
    "width": 512,
    "height": 512
  }
}
```

### 2. Delete Image

**DELETE** `/images/{id}`

Delete an image from S3 and mark as deleted in database.

#### Request
```bash
curl -X DELETE "http://localhost:81/images/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer {jwt_token}"
```

#### Response
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

### 3. Get User Images

**GET** `/images/my`

Get paginated list of user's images.

#### Parameters
- `page` (query): Page number (default: 1)
- `limit` (query): Items per page (default: 20, max: 100)
- `type` (query): Filter by image type (optional)

#### Request
```bash
curl "http://localhost:81/images/my?page=1&limit=20&type=avatar" \
  -H "Authorization: Bearer {jwt_token}"
```

#### Response
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "user_id": "31781f8b-cb7b-4bf2-bf25-2bf9aa9258bd",
        "original_url": "https://insight-dev.s3.us-east-1.amazonaws.com/uploads/...",
        "s3_key": "uploads/development/avatar/user_id/filename.jpg",
        "filename": "avatar.jpg",
        "content_type": "image/jpeg",
        "size": 245760,
        "width": 512,
        "height": 512,
        "type": "avatar",
        "status": "active",
        "created_at": "2023-12-21T10:30:00Z"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  }
}
```

### 4. Get Image Info

**GET** `/images/{id}/info`

Get information about a specific image (public endpoint).

#### Request
```bash
curl "http://localhost:81/images/123e4567-e89b-12d3-a456-426614174000/info"
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "original_url": "https://insight-dev.s3.us-east-1.amazonaws.com/uploads/...",
    "filename": "avatar.jpg",
    "content_type": "image/jpeg",
    "size": 245760,
    "width": 512,
    "height": 512,
    "type": "avatar",
    "created_at": "2023-12-21T10:30:00Z"
  }
}
```

### 5. Link Image to Post

**POST** `/images/link`

Create relationship between an image and a post.

#### Request
```json
{
  "image_id": "123e4567-e89b-12d3-a456-426614174000",
  "post_id": "456e7890-e89b-12d3-a456-426614174000",
  "usage": "title",
  "order": 0
}
```

#### Response
```json
{
  "success": true,
  "message": "Image linked to post successfully"
}
```

## Image Lifecycle Management

### Post Creation Flow
1. User uploads images → Images stored in S3 with `active` status
2. User creates post with content containing image references
3. System links images to post via `post_images` table
4. Images now have permanent relationship with post

### Post Update Flow
1. System analyzes new content for image references
2. Removes old image links
3. Creates new image links based on current content
4. Orphaned images marked as `orphaned` status

### Post Deletion Flow
1. System removes all image links for the post
2. Images without any post links marked as `orphaned`
3. Background job cleans up orphaned images after 7 days

### Image Status Lifecycle
```
upload → active → orphaned → deleted → permanently_removed
                ↘ linked_to_post → active
```

## Content Processing

### Image References in Content

#### Storage Format (Database)
```html
<p>This is a post with an image:</p>
[image:123e4567-e89b-12d3-a456-426614174000]
<p>And another image:</p>
<img data-image-id="456e7890-e89b-12d3-a456-426614174000" alt="Description">
```

#### Display Format (Frontend)
```html
<p>This is a post with an image:</p>
<img src="https://insight-dev.s3.amazonaws.com/uploads/..." alt="filename.jpg" class="content-image">
<p>And another image:</p>
<img src="https://insight-dev.s3.amazonaws.com/uploads/..." alt="Description">
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Invalid image type. Allowed: avatar, title, content, general"
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

#### 404 Not Found
```json
{
  "error": "Image not found or access denied"
}
```

#### 413 Payload Too Large
```json
{
  "error": "File size exceeds maximum limit (10MB)"
}
```

#### 415 Unsupported Media Type
```json
{
  "error": "Invalid file type: .txt"
}
```

## File Validation

### Supported Formats
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)

### Size Limits
- Maximum file size: 10MB
- Recommended dimensions:
  - Avatar: 512x512px
  - Title: 1200x630px (social media optimized)
  - Content: Max 1920px width

## Security Considerations

### Access Control
- All upload/delete operations require authentication
- Users can only access their own images
- Image info endpoint is public (read-only)

### File Validation
- MIME type validation
- File extension validation
- Image dimension extraction
- Malicious file detection

### S3 Security
- Public read access for images
- Bucket policies for environment separation
- IAM roles with minimal required permissions

## Performance Optimization

### CDN Integration
```env
CDN_ENABLED=true
CDN_BASE_URL=https://cdn.insight.io.vn
```

When enabled, image URLs use CDN instead of direct S3 URLs.

### Thumbnail Generation
Future enhancement: Generate thumbnails on upload for different sizes.

### Lazy Loading
Frontend should implement lazy loading for content images.

## Monitoring & Analytics

### Image Usage Stats
```json
{
  "total_images": 1250,
  "by_type": {
    "avatar": 45,
    "title": 200,
    "content": 1000,
    "general": 5
  },
  "orphaned_count": 12,
  "total_size_bytes": 52428800,
  "total_size_mb": 50.0
}
```

### Background Services
- **Orphaned image cleanup**: Every 6 hours (simple goroutine)
- **Deleted image cleanup**: Every 24 hours (simple goroutine) 
- **Automatic startup**: Services start with application
- **No external dependencies**: Pure Go goroutines, no job queues needed

## Development Setup

### LocalStack Configuration
For local development with LocalStack:
```env
AWS_S3_ENDPOINT=http://localhost:4566
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_S3_USE_SSL=false
```

### Database Migration
Images and post_images tables are auto-migrated on application startup.

### Testing
```bash
# Upload test image
curl -X POST "http://localhost:81/images/upload/v2/avatar" \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test-avatar.jpg"

# List images
curl "http://localhost:81/images/my" \
  -H "Authorization: Bearer $TOKEN"
```
