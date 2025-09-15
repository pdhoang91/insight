// components/Post/EngagementActions.js - Fully theme-based design
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaComment, FaBookmark, FaEllipsisH, FaFlag, FaCopy } from 'react-icons/fa';
import { FaHandsClapping } from "react-icons/fa6";
import { useUser } from '../../context/UserContext';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const EngagementActions = ({ 
  post,
  commentsCount = 0,
  layout = 'horizontal', // 'horizontal' | 'vertical'
  size = 'md', // 'sm' | 'md' | 'lg'
  showLabels = false,
  className = ''
}) => {
  const { user } = useUser();
  const { clapsCount, loading: clapsLoading, mutate: mutateClaps } = useClapsCount('post', post.id);
  const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const moreMenuRef = useRef();


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClap = async () => {
    if (!user) {
      // TODO: Show login modal
      alert('Bạn cần đăng nhập để clap.');
      return;
    }
    try {
      await clapPost(post.id);
      mutateClaps();
    } catch (error) {
      console.error('Failed to clap:', error);
      mutateClaps();
    }
  };

  const handleBookmark = () => {
    if (!user) {
      alert('Bạn cần đăng nhập để bookmark.');
      return;
    }
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark API
  };


  const handleMoreOptions = () => {
    setMoreMenuOpen(!isMoreMenuOpen);
  };

  const sizeClasses = {
    sm: themeClasses.typography.captionText,
    md: themeClasses.typography.bodySmall,
    lg: themeClasses.typography.bodyMedium
  };

  const iconSizes = {
    sm: themeClasses.icons.xs,
    md: themeClasses.icons.sm,
    lg: themeClasses.icons.md
  };

  const buttonClasses = combineClasses(
    'flex items-center',
    themeClasses.spacing.gapSmall,
    themeClasses.text.muted,
    themeClasses.text.accentHover,
    themeClasses.animations.smooth,
    'p-2',
    themeClasses.effects.rounded,
    'hover:bg-medium-hover'
  );

  const layoutClasses = layout === 'vertical' 
    ? combineClasses('flex flex-col', themeClasses.spacing.stackSmall)
    : 'flex items-center justify-between';

  return (
    <div className={combineClasses(layoutClasses, className)}>
      {/* Left side actions */}
      <div className={layout === 'vertical' 
        ? themeClasses.spacing.stackSmall 
        : combineClasses('flex items-center', themeClasses.spacing.gapLarge)
      }>
        {/* Clap Button */}
        <button
          onClick={handleClap}
          className={combineClasses(buttonClasses, 'group/clap')}
          aria-label="Thích bài viết này"
          disabled={clapsLoading}
        >
          <FaHandsClapping className={combineClasses(
            iconSizes[size], 
            'group-hover/clap:scale-110',
            themeClasses.animations.smooth
          )} />
          <span className={sizeClasses[size]}>{clapsCount}</span>
          {showLabels && <span className={sizeClasses[size]}>Clap</span>}
        </button>

        {/* Comment Button */}
        <Link
          href={`/p/${post.title_name}#comments`}
          className={buttonClasses}
          aria-label="Xem bình luận"
        >
          <FaComment className={iconSizes[size]} />
          <span className={sizeClasses[size]}>{commentsCount}</span>
          {showLabels && <span className={sizeClasses[size]}>Bình luận</span>}
        </Link>
      </div>

      {/* Right side actions */}
      <div className={layout === 'vertical' 
        ? themeClasses.spacing.stackSmall 
        : combineClasses('flex items-center', themeClasses.spacing.gap)
      }>
        {/* Bookmark Button */}
        <button
          onClick={handleBookmark}
          className={combineClasses(
            buttonClasses,
            isBookmarked ? themeClasses.text.accent : ''
          )}
          aria-label="Đánh dấu bài viết này"
        >
          <FaBookmark className={iconSizes[size]} />
          {showLabels && <span className={sizeClasses[size]}>Lưu</span>}
        </button>

        {/* More Options */}
        <div ref={moreMenuRef} className={themeClasses.utils.relative}>
          <button
            onClick={handleMoreOptions}
            className={buttonClasses}
            aria-label="Thêm tùy chọn"
          >
            <FaEllipsisH className={iconSizes[size]} />
          </button>

          {isMoreMenuOpen && (
            <MoreOptionsMenu 
              post={post}
              onClose={() => setMoreMenuOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// More options dropdown menu
const MoreOptionsMenu = ({ post, onClose }) => {
  const handleCopyLink = () => {
    const url = `${BASE_FE_URL}/p/${post.title_name}`;
    navigator.clipboard.writeText(url);
    onClose();
    // TODO: Show toast notification
  };

  const handleReport = () => {
    // TODO: Implement report functionality
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-48 bg-medium-bg-card shadow-elevated rounded-card overflow-hidden z-50">
      <div className="py-2">
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center px-4 py-2 text-sm text-medium-text-secondary hover:bg-medium-hover hover:text-medium-text-primary transition-colors"
        >
          <FaCopy className="w-4 h-4 mr-3" />
          Copy link
        </button>
        
        <button
          onClick={handleReport}
          className="w-full flex items-center px-4 py-2 text-sm text-medium-text-secondary hover:bg-medium-hover hover:text-medium-text-primary transition-colors"
        >
          <FaFlag className="w-4 h-4 mr-3" />
          Report story
        </button>
      </div>
    </div>
  );
};

// Floating engagement actions for article pages
export const FloatingEngagementActions = ({ post, commentsCount, className = '' }) => {
  return (
    <div className={`fixed left-6 top-1/2 transform -translate-y-1/2 z-40 ${className}`}>
      <div className="bg-medium-bg-card rounded-card shadow-elevated p-2">
        <EngagementActions
          post={post}
          commentsCount={commentsCount}
          layout="vertical"
          size="lg"
        />
      </div>
    </div>
  );
};

export default EngagementActions;
