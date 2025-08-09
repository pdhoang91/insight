// components/Comment/CommentsPopup.js
import React, { useMemo, useEffect } from 'react';
import CommentList from './CommentList';
import AddCommentForm from './AddCommentForm';
import { addComment } from '../../services/commentService';
import { useComments } from '../../hooks/useComments';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const CommentsPopup = ({ isOpen, onClose, postId, user }) => {
  const { comments, isLoading, isError, mutate } = useComments(postId, isOpen, 1, 10);

  const countComments = (commentsArray) => {
    let count = 0;
    for (const comment of commentsArray) {
      count += 1;
      if (comment.children && comment.children.length > 0) {
        count += countComments(comment.children);
      }
    }
    return count;
  };

  const totalComments = useMemo(() => {
    if (comments && comments.length > 0) {
      return countComments(comments);
    }
    return 0;
  }, [comments]);

  const handleAddComment = async (content) => {
    if (!user) {
      alert('Bạn cần đăng nhập để bình luận.');
      return;
    }
    if (!content.trim()) {
      alert('Nội dung bình luận không được để trống.');
      return;
    }
    try {
      await addComment(postId, content, user.id);
      mutate();
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Gửi bình luận thất bại. Vui lòng thử lại.');
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
          ></motion.div>

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
              {comments && <CommentList comments={comments} postId={postId} mutate={mutate} />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentsPopup;
