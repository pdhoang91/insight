// Core entity types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  bgColor: string;
  postsCount: number;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image?: string;
  status: 'draft' | 'published' | 'archived';
  author: User;
  categories: Category[];
  tags: string[];
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  post: Post;
  parent?: Comment;
  replies: Comment[];
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface PostForm {
  title: string;
  content: string;
  excerpt: string;
  image?: File | string;
  categories: string[];
  tags: string[];
  status: 'draft' | 'published';
}

// UI Component types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Search and Filter types
export interface SearchFilters {
  query?: string;
  search?: string;
  category?: string;
  author?: string;
  tags?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  sortBy?: 'newest' | 'oldest' | 'popular' | 'trending';
}

export interface SearchResults {
  posts: Post[];
  users: User[];
  categories: Category[];
  total: number;
} 