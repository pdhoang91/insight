// components/Post/AuthorInfo.js - Medium 2024 Design
import React from 'react';
import Link from 'next/link';
import Avatar from '../UI/Avatar';
import Button from '../UI/Button';
import TimeAgo from '../Utils/TimeAgo';

const AuthorInfo = ({ 
  author, 
  publishedAt,
  variant = 'compact',
  showFollowButton = false,
  className = ''
}) => {
  if (!author) {
    return <AuthorInfoSkeleton />;
  }

  if (variant === 'detailed') {
    return (
      <div className={`flex items-start space-x-4 ${className}`}>
        <Link href={`/${author.username}`}>
          <Avatar
            src={author.avatar_url}
            name={author.name}
            size="lg"
            className="hover:ring-2 hover:ring-medium-accent-green/20 transition-all"
          />
        </Link>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <Link 
              href={`/${author.username}`}
              className="font-medium text-medium-text-primary hover:text-medium-accent-green transition-colors"
            >
              {author.name}
            </Link>
            {showFollowButton && (
              <Button variant="outline" size="sm">
                Follow
              </Button>
            )}
          </div>
          
          {author.bio && (
            <p className="text-sm text-medium-text-secondary mb-3 line-clamp-2">
              {author.bio}
            </p>
          )}
          
          <div className="flex items-center space-x-3 text-sm text-medium-text-muted">
            {publishedAt && (
              <>
                <TimeAgo timestamp={publishedAt} />
                <span>•</span>
              </>
            )}
            <span>{author.followers_count || 0} followers</span>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant (default)
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Link href={`/${author.username}`}>
        <Avatar
          src={author.avatar_url}
          name={author.name}
          size="sm"
          className="hover:ring-2 hover:ring-medium-accent-green/20 transition-all"
        />
      </Link>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <Link 
            href={`/${author.username}`}
            className="font-medium text-medium-text-primary hover:text-medium-accent-green transition-colors truncate"
          >
            {author.name}
          </Link>
          {showFollowButton && (
            <Button variant="ghost" size="sm" className="text-xs">
              Follow
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-medium-text-muted">
          {publishedAt && <TimeAgo timestamp={publishedAt} />}
        </div>
      </div>
    </div>
  );
};

// Loading skeleton
const AuthorInfoSkeleton = ({ variant = 'compact' }) => {
  if (variant === 'detailed') {
    return (
      <div className="flex items-start space-x-4 animate-pulse">
        <div className="w-12 h-12  rounded-full"></div>
        <div className="flex-1">
          <div className="h-4  rounded w-32 mb-2"></div>
          <div className="h-3  rounded w-48 mb-3"></div>
          <div className="h-3  rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 animate-pulse">
      <div className="w-8 h-8  rounded-full"></div>
      <div className="flex-1">
        <div className="h-4  rounded w-24 mb-1"></div>
        <div className="h-3  rounded w-16"></div>
      </div>
    </div>
  );
};

export default AuthorInfo;
export { AuthorInfoSkeleton };
