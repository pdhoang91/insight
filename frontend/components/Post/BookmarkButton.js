// components/Post/BookmarkButton.js - Medium 2024 Design
import React, { useState, useEffect } from 'react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { useUser } from '../../context/UserContext';

const BookmarkButton = ({ 
  postId, 
  size = 'md',
  variant = 'icon', // 'icon' | 'button' | 'text'
  showLabel = false,
  className = ''
}) => {
  const { user } = useUser();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load bookmark status from localStorage on mount
  useEffect(() => {
    if (user && postId) {
      const bookmarks = JSON.parse(localStorage.getItem(`bookmarks-${user.id}`) || '[]');
      setIsBookmarked(bookmarks.includes(postId));
    }
  }, [user, postId]);

  const handleBookmark = async () => {
    if (!user) {
      // TODO: Show login modal
      alert('Bạn cần đăng nhập để bookmark.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Get current bookmarks from localStorage
      const bookmarks = JSON.parse(localStorage.getItem(`bookmarks-${user.id}`) || '[]');
      
      let updatedBookmarks;
      if (isBookmarked) {
        // Remove bookmark
        updatedBookmarks = bookmarks.filter(id => id !== postId);
      } else {
        // Add bookmark
        updatedBookmarks = [...bookmarks, postId];
      }
      
      // Save to localStorage
      localStorage.setItem(`bookmarks-${user.id}`, JSON.stringify(updatedBookmarks));
      
      // TODO: Also save to API
      // await bookmarkPost(postId, !isBookmarked);
      
      setIsBookmarked(!isBookmarked);
      
      // TODO: Show toast notification
      // showToast(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
      
    } catch (error) {
      console.error('Failed to bookmark:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleBookmark}
        disabled={isLoading}
        className={`
          inline-flex items-center space-x-2 px-3 py-2 rounded-button
          ${isBookmarked 
            ? 'bg-medium-accent-green text-white hover:bg-medium-accent-green/90' 
            : 'bg-medium-bg-secondary text-medium-text-secondary hover:bg-medium-hover'
          }
          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        {isBookmarked ? (
          <FaBookmark className={sizeClasses[size]} />
        ) : (
          <FaRegBookmark className={sizeClasses[size]} />
        )}
        {showLabel && (
          <span className="text-sm font-medium">
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </span>
        )}
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleBookmark}
        disabled={isLoading}
        className={`
          inline-flex items-center space-x-2 text-medium-text-secondary 
          hover:text-medium-accent-green transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        {isBookmarked ? (
          <FaBookmark className={`${sizeClasses[size]} text-medium-accent-green`} />
        ) : (
          <FaRegBookmark className={sizeClasses[size]} />
        )}
        <span className="text-sm">
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      </button>
    );
  }

  // Default icon variant
  return (
    <button
      onClick={handleBookmark}
      disabled={isLoading}
      className={`
        ${buttonSizeClasses[size]} rounded-medium transition-all duration-200
        ${isBookmarked 
          ? 'text-medium-accent-green bg-medium-hover' 
          : 'text-medium-text-muted hover:text-medium-accent-green hover:bg-medium-hover'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {isBookmarked ? (
        <FaBookmark className={sizeClasses[size]} />
      ) : (
        <FaRegBookmark className={sizeClasses[size]} />
      )}
    </button>
  );
};

// Hook for managing bookmarks
export const useBookmark = (postId) => {
  const { user } = useUser();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && postId) {
      const bookmarks = JSON.parse(localStorage.getItem(`bookmarks-${user.id}`) || '[]');
      setIsBookmarked(bookmarks.includes(postId));
    }
  }, [user, postId]);

  const toggleBookmark = async () => {
    if (!user) return false;

    setIsLoading(true);
    
    try {
      const bookmarks = JSON.parse(localStorage.getItem(`bookmarks-${user.id}`) || '[]');
      
      let updatedBookmarks;
      if (isBookmarked) {
        updatedBookmarks = bookmarks.filter(id => id !== postId);
      } else {
        updatedBookmarks = [...bookmarks, postId];
      }
      
      localStorage.setItem(`bookmarks-${user.id}`, JSON.stringify(updatedBookmarks));
      
      // TODO: API call
      // await bookmarkPost(postId, !isBookmarked);
      
      setIsBookmarked(!isBookmarked);
      return !isBookmarked;
      
    } catch (error) {
      console.error('Failed to bookmark:', error);
      return isBookmarked;
    } finally {
      setIsLoading(false);
    }
  };

  const getBookmarks = () => {
    if (!user) return [];
    return JSON.parse(localStorage.getItem(`bookmarks-${user.id}`) || '[]');
  };

  const clearBookmarks = () => {
    if (!user) return;
    localStorage.removeItem(`bookmarks-${user.id}`);
    setIsBookmarked(false);
  };

  return {
    isBookmarked,
    isLoading,
    toggleBookmark,
    getBookmarks,
    clearBookmarks
  };
};

// Bookmarks List Component
export const BookmarksList = ({ className = '' }) => {
  const { user } = useUser();
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBookmarks = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const bookmarkIds = JSON.parse(localStorage.getItem(`bookmarks-${user.id}`) || '[]');
        
        // TODO: Fetch posts data from API
        // const posts = await fetchPostsByIds(bookmarkIds);
        // setBookmarkedPosts(posts);
        
        // For now, just store the IDs
        setBookmarkedPosts(bookmarkIds.map(id => ({ id })));
        
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();
  }, [user]);

  if (!user) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-medium-text-muted">
          Sign in to view your bookmarks
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-medium-bg-secondary rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-medium-bg-secondary rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!bookmarkedPosts.length) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <FaRegBookmark className="w-12 h-12 text-medium-text-muted mx-auto mb-4" />
        <h3 className="font-serif text-lg text-medium-text-primary mb-2">
          No bookmarks yet
        </h3>
        <p className="text-medium-text-muted">
          Bookmark articles to read them later
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="font-serif text-xl font-bold text-medium-text-primary mb-6">
        Your Bookmarks ({bookmarkedPosts.length})
      </h2>
      
      <div className="space-y-6">
        {bookmarkedPosts.map(post => (
          <BookmarkItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

// Individual bookmark item
const BookmarkItem = ({ post }) => {
  const { toggleBookmark } = useBookmark(post.id);

  return (
    <div className="flex items-start justify-between p-4  border border-medium-border rounded-card">
      <div className="flex-1">
        <h3 className="font-serif font-medium text-medium-text-primary mb-2">
          {post.title || `Post ${post.id}`}
        </h3>
        <p className="text-sm text-medium-text-muted">
          Bookmarked on {new Date().toLocaleDateString()}
        </p>
      </div>
      
      <BookmarkButton
        postId={post.id}
        variant="icon"
        size="sm"
      />
    </div>
  );
};

export default BookmarkButton;
