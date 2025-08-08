export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  category: {
    name: string;
    slug: string;
    color: string;
  };
  tags: string[];
  publishedAt: string;
  readTime: number;
  featured: boolean;
  image: {
    url: string;
    alt: string;
  };
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  postCount: number;
}

export interface Author {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
} 