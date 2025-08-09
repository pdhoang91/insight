import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BackendUser, BackendPost, User, Post, Category } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock data generators
const generateMockCategories = (): Category[] => {
  const mockCategories = [
    { name: 'Technology', slug: 'technology', color: '#3b82f6', bgColor: '#dbeafe' },
    { name: 'Programming', slug: 'programming', color: '#10b981', bgColor: '#d1fae5' },
    { name: 'Web Development', slug: 'web-dev', color: '#f59e0b', bgColor: '#fef3c7' },
    { name: 'AI & ML', slug: 'ai-ml', color: '#8b5cf6', bgColor: '#ede9fe' },
    { name: 'Tutorial', slug: 'tutorial', color: '#ef4444', bgColor: '#fee2e2' },
  ];

  // Return 1-3 random categories
  const count = Math.floor(Math.random() * 3) + 1;
  const shuffled = mockCategories.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((cat, index) => ({
    id: `mock-cat-${index}`,
    name: cat.name,
    slug: cat.slug,
    description: `${cat.name} related posts`,
    color: cat.color,
    bgColor: cat.bgColor,
    postsCount: Math.floor(Math.random() * 100) + 1,
    createdAt: new Date().toISOString(),
  }));
};

const generateMockTags = (): string[] => {
  const mockTags = ['react', 'nextjs', 'typescript', 'javascript', 'nodejs', 'python', 'golang', 'docker', 'aws', 'tutorial'];
  const count = Math.floor(Math.random() * 4) + 1;
  return mockTags.sort(() => 0.5 - Math.random()).slice(0, count);
};

const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const generateAvatarUrl = (name: string, userId?: string): string => {
  // Try different avatar services as fallbacks
  const avatarServices = [
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=random`,
    '/images/avatar.svg', // Local fallback
  ];
  
  // Use user ID to consistently select the same avatar service
  const index = userId ? parseInt(userId.slice(-1), 16) % avatarServices.length : 0;
  return avatarServices[index];
};

// Transform backend user to frontend user
export const transformUser = (backendUser: BackendUser): User => {
  return {
    id: backendUser.id,
    username: backendUser.username,
    email: backendUser.email,
    name: backendUser.name,
    avatar: generateAvatarUrl(backendUser.name, backendUser.id),
    bio: `${backendUser.name} is a content creator on our platform.`, // Mock bio
    followersCount: Math.floor(Math.random() * 1000) + 10, // Mock followers
    followingCount: Math.floor(Math.random() * 500) + 5, // Mock following
    postsCount: Math.floor(Math.random() * 50) + 1, // Mock posts count
    createdAt: backendUser.created_at,
    updatedAt: backendUser.updated_at,
  };
};

// Transform backend post to frontend post
export const transformPost = (backendPost: BackendPost): Post => {
  const content = backendPost.post_content?.content || backendPost.content || '';
  const excerpt = backendPost.preview_content || content.substring(0, 150) + '...';
  
  return {
    id: backendPost.id,
    title: backendPost.title,
    slug: generateSlug(backendPost.title_name || backendPost.title),
    content: content,
    excerpt: excerpt,
    image: backendPost.image_title || undefined,
    status: 'published' as const, // Mock status
    author: transformUser(backendPost.user),
    categories: (backendPost.categories as Category[] | null) || generateMockCategories(), // Use mock if null
    tags: (backendPost.tags as string[] | null) || generateMockTags(), // Use mock if null
    viewsCount: backendPost.views,
    likesCount: backendPost.clap_count,
    commentsCount: backendPost.comments_count,
    bookmarksCount: Math.floor(Math.random() * 50), // Mock bookmarks
    readTime: calculateReadTime(content),
    createdAt: backendPost.created_at,
    updatedAt: backendPost.updated_at,
    publishedAt: backendPost.created_at, // Use created_at as published date
  };
};

// Transform array of backend posts
export const transformPosts = (backendPosts: BackendPost[]): Post[] => {
  return backendPosts.map(transformPost);
};

// Utility functions
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
} 