// // src/components/Comment/CommentsPopup.js
// src/components/Comment/CommentsPopup.js
import React, { useMemo, useEffect } from 'react';
import CommentList from './CommentList';
import AddCommentForm from './AddCommentForm';
import { addComment } from '../../services/commentService';
import { useComments } from '../../hooks/useComments';
import { FaTimes } from 'react-icons/fa';
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
            className="relative w-full max-w-md bg-white shadow-lg overflow-y-auto h-full"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
              onClick={onClose}
              aria-label="Close Comments"
            >
              <FaTimes size={20} />
            </button>

            {/* Header */}
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Bình Luận ({totalComments})</h2>
            </div>

            {/* Add Comment Form */}
            <div className="p-4 border-b">
              {user ? (
                <AddCommentForm onAddComment={handleAddComment} />
              ) : (
                <p className="text-gray-600">Bạn cần đăng nhập để bình luận.</p>
              )}
            </div>

            {/* Comments List */}
            <div className="p-4">
              {isError && (
                <div className="text-red-500">Không thể tải bình luận.</div>
              )}
              {isLoading && !isError && (
                <div className="flex justify-center items-center">
                  <FaSpinner className="animate-spin text-gray-500 mr-2" />
                  <span className="text-gray-500">Đang tải bình luận...</span>
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
