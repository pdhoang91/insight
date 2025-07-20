# State Management in Insight Application

This document outlines the state management approach used in the Insight application.

## Types of State

The application manages several types of state:

1. **Local Component State**: For UI state that only affects a single component
2. **Global Application State**: For state that needs to be shared across multiple components
3. **Server State**: For data fetched from the API
4. **Form State**: For managing form inputs and validation
5. **URL State**: For state that should be reflected in the URL

## State Management Tools

### 1. React Context + useReducer

For global application state, we use a combination of React Context and useReducer. This provides a centralized store with predictable state updates.

Key files:
- `context/AppContext.js`: The main context provider that combines UI state and authentication state
- `context/UserContext.js`: Legacy context for user state (now integrated into AppContext)

### 2. SWR for Server State

For server state, we use SWR (stale-while-revalidate) to handle data fetching, caching, and synchronization.

Key files:
- `utils/swrConfig.js`: Global SWR configuration
- `hooks/useOptimizedInfiniteData.js`: Reusable hook for infinite loading with SWR

### 3. Custom Hooks

We use custom hooks to encapsulate state logic and provide a clean API for components.

Key hooks:
- `hooks/useAuth.js`: Authentication state management
- `hooks/useOptimizedPosts.js`: Optimized hook for fetching posts
- Various other domain-specific hooks

## State Management Patterns

### 1. Centralized Global State

Global state is centralized in the AppContext, which combines:
- UI state (modals, sidebar, theme)
- Authentication state (user, loading)

### 2. Optimized Server State

Server state is managed with SWR, which provides:
- Automatic revalidation
- Deduplication of requests
- Caching
- Optimistic updates
- Error handling

### 3. Separation of Concerns

State is organized by domain and separated into:
- UI state: Managed in AppContext
- Authentication state: Managed in useAuth hook and exposed through AppContext
- Server state: Managed with SWR and domain-specific hooks

## Best Practices

1. **Use Local State for UI-Only Concerns**: Keep state local to components when it doesn't need to be shared.

2. **Centralize Shared State**: Use AppContext for state that needs to be shared across components.

3. **Optimize Server State**: Use SWR for all API data to benefit from caching and automatic revalidation.

4. **Memoize Expensive Calculations**: Use useMemo and useCallback to prevent unnecessary re-renders.

5. **Batch Related State Updates**: Use useReducer for related state updates to ensure consistency.

6. **Keep State Minimal**: Only store what you need in state, derive the rest.

## Example Usage

### Using Global State

```jsx
import { useApp } from '../context/AppContext';

function MyComponent() {
  const { state, toggleModal } = useApp();
  
  return (
    <button onClick={() => toggleModal('login', true)}>
      Login
    </button>
  );
}
```

### Using Server State

```jsx
import { useOptimizedPosts } from '../hooks/useOptimizedPosts';

function PostsList() {
  const { posts, isLoading, loadMore } = useOptimizedPosts('ForYou');
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
      <button onClick={loadMore}>Load More</button>
    </div>
  );
}
``` 