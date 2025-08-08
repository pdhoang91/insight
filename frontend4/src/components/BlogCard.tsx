import React from 'react';
import Image from 'next/image';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image: string;
  categories: Array<{
    name: string;
    color: string;
    bgColor: string;
  }>;
}

interface BlogCardProps {
  post: BlogPost;
  variant?: 'large' | 'medium' | 'small' | 'featured';
}

const BlogCard: React.FC<BlogCardProps> = ({ post, variant = 'medium' }) => {
  const getCardClasses = () => {
    switch (variant) {
      case 'large':
        return 'flex flex-col gap-8 flex-1';
      case 'featured':
        return 'flex flex-row gap-8 flex-1';
      case 'small':
        return 'flex flex-row gap-6';
      default:
        return 'flex flex-col gap-8 flex-1';
    }
  };

  const getImageClasses = () => {
    switch (variant) {
      case 'large':
        return 'w-full h-[240px] object-cover rounded-lg';
      case 'featured':
        return 'w-full h-[246px] object-cover rounded-lg';
      case 'small':
        return 'w-80 h-[200px] object-cover rounded-lg';
      default:
        return 'w-full h-[200px] object-cover rounded-lg';
    }
  };

  const getTitleClasses = () => {
    switch (variant) {
      case 'large':
        return 'text-2xl font-semibold text-[#1a1a1a] leading-[1.33]';
      case 'featured':
        return 'text-2xl font-semibold text-[#1a1a1a] leading-[1.33]';
      default:
        return 'text-lg font-semibold text-[#1a1a1a] leading-[1.56]';
    }
  };

  return (
    <article className={getCardClasses()}>
      <div className={variant === 'featured' ? 'flex-1' : ''}>
        <Image
          src={post.image}
          alt={post.title}
          width={variant === 'small' ? 320 : 800}
          height={variant === 'featured' ? 246 : variant === 'large' ? 240 : 200}
          className={getImageClasses()}
        />
      </div>
      
      <div className={`flex flex-col gap-6 ${variant === 'featured' ? 'flex-1' : ''}`}>
        <div className="flex flex-col gap-3">
          {/* Author and Date */}
          <p className="text-sm font-semibold text-[#6941c6] leading-[1.43]">
            {post.author} • {post.date}
          </p>
          
          {/* Title and Arrow */}
          <div className="flex items-start gap-4">
            <h2 className={`flex-1 ${getTitleClasses()}`}>
              {post.title}
            </h2>
            <div className="pt-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
                <path d="m7 7 10 10"/>
                <path d="M7 17V7h10"/>
              </svg>
            </div>
          </div>
          
          {/* Excerpt */}
          <p className="text-base text-[#667085] leading-6">
            {post.excerpt}
          </p>
        </div>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {post.categories.map((category, index) => (
            <span
              key={index}
              className={`px-2.5 py-0.5 rounded-2xl text-sm font-medium text-center ${category.bgColor} ${category.color}`}
            >
              {category.name}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default BlogCard; 