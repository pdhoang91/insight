// components/Mobile/MobileReadingBar.js
import React, { useState } from 'react';
import { FaHeart, FaComment, FaBookmark, FaChevronUp } from 'react-icons/fa';
import { usePostClap } from '../../hooks/usePostClap';
import BookmarkButton from '../Post/BookmarkButton';
import { useUser } from '../../context/UserContext';

const MobileReadingBar = ({ 
  post, 
  isVisible = true, 
  onCommentClick,
  className = '' 
}) => {
  const { user, setModalOpen } = useUser();
  const { currentClapCount, clapLoading, handleClap } = usePostClap(post?.clap_count || 0);
  const [showActions, setShowActions] = useState(false);

  if (!post || !isVisible) return null;

  const handleClapClick = () => {
    if (!user) {
      setModalOpen(true);
      return;
    }
    handleClap();
  };

  const handleCommentClick = () => {
    if (onCommentClick) {
      onCommentClick();
    } else {
      // Scroll to comments section
      const commentsSection = document.getElementById('comments-section');
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };


  return (
    <>
      {/* Backdrop */}
      {showActions && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setShowActions(false)}
        />
      )}

      {/* Mobile Reading Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 md:hidden ${className}`}>
        {/* Expanded Actions */}
        {showActions && (
          <div className="p-6 space-y-4 shadow-lg">
            {/* Clap Action */}
            <button
              onClick={handleClapClick}
              disabled={clapLoading}
              className="w-full flex items-center justify-between p-3  rounded-lg hover:bg-medium-hover transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FaHeart className={`w-5 h-5 text-medium-text-secondary ${clapLoading ? 'animate-pulse' : ''}`} />
                <span className="text-medium-text-primary font-medium">Clap for this article</span>
              </div>
              <span className="text-medium-text-muted font-bold">{currentClapCount}</span>
            </button>

            {/* Comment Action */}
            <button
              onClick={handleCommentClick}
              className="w-full flex items-center justify-between p-3  rounded-lg hover:bg-medium-hover transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FaComment className="w-5 h-5 text-medium-text-secondary" />
                <span className="text-medium-text-primary font-medium">View comments</span>
              </div>
              <span className="text-medium-text-muted font-bold">{post.comment_count || 0}</span>
            </button>

            {/* Bookmark Action */}
            <div className="w-full flex items-center justify-between p-3  rounded-lg">
              <div className="flex items-center space-x-3">
                <FaBookmark className="w-5 h-5 text-medium-text-secondary" />
                <span className="text-medium-text-primary font-medium">Bookmark article</span>
              </div>
              <BookmarkButton postId={post.id} />
            </div>

          </div>
        )}

        {/* Main Bar */}
        <div className="px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            {/* Left: Quick Clap */}
            <button
              onClick={handleClapClick}
              disabled={clapLoading}
              className="flex items-center space-x-2 px-3 py-2  rounded-full hover:bg-medium-accent-green hover:text-white transition-colors"
            >
              <FaHeart className={`w-4 h-4 ${clapLoading ? 'animate-pulse' : ''}`} />
              <span className="font-medium">{currentClapCount}</span>
            </button>

            {/* Center: Article Info */}
            <div className="flex-1 mx-4 text-center">
              <div className="text-sm font-medium text-medium-text-primary truncate">
                {post.title}
              </div>
              <div className="text-caption text-medium-text-muted">
                Reading Progress
              </div>
            </div>

            {/* Right: More Actions */}
            <button
              onClick={() => setShowActions(!showActions)}
              className="flex items-center space-x-1 px-3 py-2  rounded-full hover:bg-medium-hover transition-colors"
            >
              <FaChevronUp className={`w-4 h-4 transition-transform ${showActions ? 'rotate-180' : ''}`} />
              <span className="text-sm">More</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileReadingBar;
