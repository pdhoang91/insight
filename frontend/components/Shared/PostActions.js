// components/Shared/PostActions.js
import React from 'react';
import { FaHandsClapping, FaComment, FaBookmark, FaRegBookmark, FaShareAlt, FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';
import usePostInteractions from '../../hooks/usePostInteractions';
import ShareMenu from './ShareMenu';
import CommentsPopup from '../Comment/CommentsPopup';

const PostActions = ({ 
  post, 
  variant = 'default', // 'default', 'compact', 'enhanced'
  showStats = true,
  showComments = true,
  className = ""
}) => {
  const {
    // State
    isCommentsOpen,
    isShareMenuOpen,
    shareMenuRef,
    
    // Data
    clapsCount,
    isBookmarked,
    comments,
    totalCount,
    shareUrl,
    
    // Loading states
    clapsLoading,
    bookmarkLoading,
    
    // Handlers
    handleClap,
    toggleBookmark,
    toggleCommentPopup,
    closeCommentPopup,
    handleShare,
    handleNativeShare,
  } = usePostInteractions(post);

  // Variant-specific styling
  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'flex items-center justify-between text-xs',
          button: 'flex items-center space-x-1 p-1 rounded hover:bg-gray-100 transition-colors',
          iconSize: 'w-3 h-3',
          textSize: 'text-xs'
        };
      case 'enhanced':
        return {
          container: 'flex items-center justify-between py-4 border-t border-gray-100',
          button: 'flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all',
          iconSize: 'w-4 h-4',
          textSize: 'text-sm'
        };
      default:
        return {
          container: 'flex items-center justify-between py-3',
          button: 'flex items-center space-x-2 px-2 py-1 rounded hover:bg-gray-100 transition-colors',
          iconSize: 'w-4 h-4',
          textSize: 'text-sm'
        };
    }
  };

  const classes = getVariantClasses();

  return (
    <div className={`${classes.container} ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Clap Button */}
        <motion.button
          onClick={handleClap}
          disabled={clapsLoading}
          className={`${classes.button} ${clapsCount > 0 ? 'text-orange-600' : 'text-gray-500'} hover:text-orange-600`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaHandsClapping className={`${classes.iconSize} ${clapsLoading ? 'animate-pulse' : ''}`} />
          <span className={classes.textSize}>
            {clapsCount || 0}
          </span>
        </motion.button>

        {/* Comments Button */}
        {showComments && (
          <button
            onClick={toggleCommentPopup}
            className={`${classes.button} text-gray-500 hover:text-blue-600`}
          >
            <FaComment className={classes.iconSize} />
            <span className={classes.textSize}>
              {totalCount || 0}
            </span>
          </button>
        )}

        {/* Bookmark Button */}
        <motion.button
          onClick={toggleBookmark}
          disabled={bookmarkLoading}
          className={`${classes.button} ${isBookmarked ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-600`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isBookmarked ? (
            <FaBookmark className={`${classes.iconSize} ${bookmarkLoading ? 'animate-pulse' : ''}`} />
          ) : (
            <FaRegBookmark className={`${classes.iconSize} ${bookmarkLoading ? 'animate-pulse' : ''}`} />
          )}
        </motion.button>

        {/* Share Button */}
        <div className="relative" ref={shareMenuRef}>
          <button
            onClick={handleShare}
            className={`${classes.button} text-gray-500 hover:text-green-600`}
          >
            <FaShareAlt className={classes.iconSize} />
          </button>
          
          {isShareMenuOpen && (
            <ShareMenu
              url={shareUrl}
              title={post.title}
              description={post.preview_content}
              onClose={() => handleShare()}
              variant={variant}
            />
          )}
        </div>
      </div>

      {/* Stats Section */}
      {showStats && post.views > 0 && (
        <div className="flex items-center space-x-2 text-gray-500">
          <FaEye className={classes.iconSize} />
          <span className={classes.textSize}>
            {post.views.toLocaleString()}
          </span>
        </div>
      )}

      {/* Comments Popup */}
      {showComments && isCommentsOpen && (
        <CommentsPopup
          postId={post.id}
          isOpen={isCommentsOpen}
          onClose={closeCommentPopup}
          comments={comments}
          totalCount={totalCount}
        />
      )}
    </div>
  );
};

export default PostActions; 