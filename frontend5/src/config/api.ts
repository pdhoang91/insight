// config/api.ts
export const BASE_API_URL_SIMPLE = process.env.NEXT_PUBLIC_BASE_API_URL_SIMPLE || 'http://localhost:82';
export const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:81';
export const BASE_AIAPI_URL = process.env.NEXT_PUBLIC_BASE_AIAPI_URL || 'http://localhost:8080';
export const BASE_FE_URL = process.env.NEXT_PUBLIC_BASE_FE_URL || 'http://localhost:3000';

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:8081',
  IMAGE_URL: process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8082',
  SEARCH_URL: process.env.NEXT_PUBLIC_SEARCH_URL || 'http://localhost:8083',
  AI_URL: process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8084',
  TIMEOUT: 10000,
} as const;

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/api/me',
    REFRESH: '/auth/refresh',
  },
  
  // Post endpoints
  POSTS: {
    LIST: '/api/posts',
    CREATE: '/api/posts',
    UPDATE: (id: string) => `/api/posts/${id}`,
    DELETE: (id: string) => `/api/posts/${id}`,
    BY_ID: (id: string) => `/api/posts/${id}`,
    BY_SLUG: (slug: string) => `/api/posts/slug/${slug}`,
    BY_CATEGORY: (categoryId: string) => `/api/posts/category/${categoryId}`,
    BY_AUTHOR: (authorId: string) => `/api/posts/author/${authorId}`,
    LIKE: (id: string) => `/api/posts/${id}/like`,
    BOOKMARK: (id: string) => `/api/posts/${id}/bookmark`,
  },
  
  // User endpoints
  USERS: {
    PROFILE: (id: string) => `/api/users/${id}`,
    UPDATE_PROFILE: '/api/users/profile',
    FOLLOW: (id: string) => `/api/users/${id}/follow`,
    FOLLOWERS: (id: string) => `/api/users/${id}/followers`,
    FOLLOWING: (id: string) => `/api/users/${id}/following`,
  },
  
  // Category endpoints
  CATEGORIES: {
    LIST: '/api/categories',
    BY_ID: (id: string) => `/api/categories/${id}`,
    BY_SLUG: (slug: string) => `/api/categories/slug/${slug}`,
  },
  
  // Comment endpoints
  COMMENTS: {
    BY_POST: (postId: string) => `/api/posts/${postId}/comments`,
    CREATE: (postId: string) => `/api/posts/${postId}/comments`,
    UPDATE: (id: string) => `/api/comments/${id}`,
    DELETE: (id: string) => `/api/comments/${id}`,
    LIKE: (id: string) => `/api/comments/${id}/like`,
  },
  
  // Search endpoints
  SEARCH: {
    POSTS: '/search/posts',
    USERS: '/search/users',
    ALL: '/search',
  },
  
  // Image endpoints
  IMAGES: {
    UPLOAD: '/images/upload',
    DELETE: (id: string) => `/images/${id}`,
  },
  
  // AI endpoints
  AI: {
    SUMMARIZE: '/ai/summarize',
    GENERATE: '/ai/generate',
  },
} as const; 