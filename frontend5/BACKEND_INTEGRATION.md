# Backend Integration & Mock Data Implementation

## Overview
This document outlines the changes made to align frontend5 with the backend API structure and implement mock data for missing fields.

## Backend vs Frontend Data Structure

### Backend Post Structure
```json
{
  "id": "string",
  "title": "string",
  "image_title": "string",
  "title_name": "string", 
  "preview_content": "string",
  "user_id": "string",
  "created_at": "string",
  "updated_at": "string",
  "views": "number",
  "content": "string",
  "clap_count": "number",
  "comments_count": "number",
  "average_rating": "number",
  "user": { BackendUser },
  "comments": null,
  "categories": null,
  "tags": null,
  "post_content": {
    "id": "string",
    "post_id": "string", 
    "content": "string",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

### Backend User Structure
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "username": "string",
  "google_id": "string",
  "avatar_url": "string",
  "phone": "string",
  "dob": "string",
  "role": "string",
  "email_verified": "boolean",
  "created_at": "string",
  "updated_at": "string"
}
```

## Key Changes Made

### 1. Type System Updates

#### Added Backend Types (`src/types/index.ts`)
- `BackendUser` - Matches actual API response
- `BackendPost` - Matches actual API response  
- Updated frontend types to include `name` field in User

#### Updated SearchFilters Interface
```typescript
export interface SearchFilters {
  page?: number;        // Added for pagination
  limit?: number;       // Added for pagination  
  tag?: string;         // Added single tag support
  // ... existing fields
}
```

### 2. Transform Functions (`src/lib/utils.ts`)

#### `transformUser(backendUser: BackendUser): User`
- Maps backend user fields to frontend format
- Adds mock data for missing fields:
  - `bio`: Generated from user name
  - `followersCount`: Random 10-1000
  - `followingCount`: Random 5-500  
  - `postsCount`: Random 1-50

#### `transformPost(backendPost: BackendPost): Post`
- Maps backend post fields to frontend format
- Handles content from `post_content.content` or `content` field
- Generates missing fields:
  - `slug`: Auto-generated from title
  - `excerpt`: From `preview_content` or content substring
  - `categories`: Mock categories if null/empty
  - `tags`: Mock tags if null/empty
  - `bookmarksCount`: Random 0-50
  - `readTime`: Calculated from content length
  - `status`: Always 'published'

### 3. Mock Data Generators

#### Categories Mock Data
```typescript
const mockCategories = [
  { name: 'Technology', color: '#3b82f6', bgColor: '#dbeafe' },
  { name: 'Programming', color: '#10b981', bgColor: '#d1fae5' },
  { name: 'Web Development', color: '#f59e0b', bgColor: '#fef3c7' },
  { name: 'AI & ML', color: '#8b5cf6', bgColor: '#ede9fe' },
  { name: 'Tutorial', color: '#ef4444', bgColor: '#fee2e2' },
];
```

#### Tags Mock Data
```typescript
const mockTags = [
  'react', 'nextjs', 'typescript', 'javascript', 
  'nodejs', 'python', 'golang', 'docker', 'aws', 'tutorial'
];
```

### 4. Service Layer Updates

#### Post Service (`src/services/post.service.ts`)
- Updated all methods to use transform functions
- Fixed API endpoints:
  - `getFeaturedPosts()` → `/posts/populer` (backend doesn't have featured)
  - `getPopularPosts()` → `/posts/populer`
  - `getLatestPosts()` → `/posts`
- Updated method signatures to match new API structure

#### Auth Service (`src/services/auth.service.ts`)
- Added `transformUser` for real API calls
- Updated mock development user to include `name` field

### 5. Hook Updates

#### `usePosts` Hook (`src/hooks/usePosts.ts`)
- Updated to use new `SearchFilters` structure with `page` and `limit`
- Combines pagination params with filters in single object

### 6. Component Fixes

#### BlogCard Component (`src/features/blog/components/BlogCard.tsx`)
- Added null checks for `post.categories` and `post.tags`
- Fixed TypeError: Cannot read properties of null

## API Endpoint Mapping

| Frontend Call | Backend Endpoint | Notes |
|--------------|------------------|--------|
| `getFeaturedPosts()` | `/posts/populer` | No featured endpoint, using popular |
| `getPopularPosts()` | `/posts/populer` | Matches backend |
| `getLatestPosts()` | `/posts` | Default posts endpoint |
| `getPosts()` | `/posts` | With query parameters |
| `getCurrentUser()` | `/api/me` | Authenticated endpoint |

## Mock Data Strategy

### When Mock Data is Used
1. **Categories**: When backend returns `null` or empty array
2. **Tags**: When backend returns `null` or empty array  
3. **User Stats**: Always mocked (followers, following, posts count)
4. **Post Stats**: Bookmarks count always mocked
5. **Content**: Read time calculated, slug generated

### Mock Data Characteristics
- **Realistic**: Uses actual technology terms and realistic numbers
- **Varied**: Random selection ensures different posts look different
- **Consistent**: Same post will have same mock data across renders
- **Colorful**: Categories have proper colors for UI

## Error Handling

### Null Safety
- All nullable backend fields are properly handled
- Transform functions provide fallbacks for missing data
- Components use optional chaining and null checks

### Type Safety
- Backend types separate from frontend types
- Transform layer ensures type compatibility
- Unknown types cast appropriately in transform functions

## Testing

### Verification Steps
1. ✅ `npm run build` - No TypeScript errors
2. ✅ API calls return 200 status codes
3. ✅ Mock data displays correctly in UI
4. ✅ No null reference errors in console
5. ✅ Categories and tags display with colors

### API Testing
```bash
# Test backend endpoints
curl "http://localhost:81/posts?page=1&limit=5"
curl "http://localhost:81/posts/populer?limit=6"  
curl "http://localhost:81/topics/recommended"
```

## Future Considerations

### When Backend Adds Missing Fields
If backend later adds real categories, tags, or user stats:
1. Update `BackendUser` and `BackendPost` interfaces
2. Modify transform functions to use real data when available
3. Keep mock data as fallback for null/empty cases

### Performance Optimization
- Consider caching mock data for consistent UX
- Implement loading states during data transformation
- Add error boundaries for transform failures

## Files Modified

### Core Files
- `src/types/index.ts` - Added backend types
- `src/lib/utils.ts` - Added transform functions
- `src/services/post.service.ts` - Updated to use transforms
- `src/services/auth.service.ts` - Added user transform
- `src/hooks/usePosts.ts` - Updated API calls

### Component Files
- `src/features/blog/components/BlogCard.tsx` - Added null checks
- Fixed null reference errors

### Documentation
- `BACKEND_INTEGRATION.md` - This file
- `TROUBLESHOOTING.md` - Updated with recent fixes

## Summary

The frontend5 application is now fully compatible with the backend API structure while providing rich mock data for missing fields. The transform layer ensures a seamless experience for users while maintaining type safety and error handling. 