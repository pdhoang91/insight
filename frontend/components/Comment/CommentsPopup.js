// components/Comment/CommentsPopup.js
import React, { useMemo, useEffect } from 'react';
import LimitedCommentList from './LimitedCommentList';
import AddCommentForm from './AddCommentForm';
import { addComment } from '../../services/commentService';
import { useInfiniteComments } from '../../hooks/useInfiniteComments';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const CommentsPopup = ({ isOpen, onClose, postId, user }) => {
  const { 
    comments, 
    totalCount, 
    totalCommentReply,
    isLoading, 
    isError, 
    canLoadMore,
    loadMore,
    mutate 
  } = useInfiniteComments(postId, isOpen, 2);

  const totalComments = totalCount;

  const handleAddComment = async (content) => {
    if (!user) {
      alert('You need to login to comment.');
      return;
    }
    if (!content.trim()) {
      alert('Comment content cannot be empty.');
      return;
    }
    try {
      await addComment(postId, content); // Only pass postId and content
      mutate(); // Refresh comments
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Failed to add comment. Please try again.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex justify-end z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black opacity-30"
            onClick={onClose}
            aria-label="Close Comments"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Modal Content */}
          <motion.div
            className="relative w-full max-w-md bg-surface shadow-lg overflow-y-auto h-full border-l border-primary"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none"
              onClick={onClose}
              aria-label="Close Comments"
            >
              <FaTimes size={20} />
            </button>

                    {/* Header */}
        <div className="p-4 border-b border-primary">
          <h2 className="text-xl font-semibold text-primary font-mono">Comments ({totalComments})</h2>
        </div>

        {/* Add Comment Form */}
        <div className="p-4 border-b border-primary">
              {user ? (
                <AddCommentForm onAddComment={handleAddComment} />
              ) : (
                <p className="tech-comment">Login required to comment</p>
              )}
            </div>

            {/* Comments List */}
            <div className="p-4">
              {isError && (
                <div className="text-red-400 font-mono">// Failed to load comments</div>
              )}
              {isLoading && !isError && (
                <div className="flex justify-center items-center">
                  <FaSpinner className="animate-spin text-green-400 mr-2" />
                  <span className="text-gray-400 font-mono">Loading comments...</span>
                </div>
              )}
              {comments && (
                <LimitedCommentList 
                  comments={comments} 
                  postId={postId} 
                  mutate={mutate}
                  canLoadMore={canLoadMore}
                  loadMore={loadMore}
                  isLoadingMore={isLoading}
                  totalCount={totalCount}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentsPopup;
