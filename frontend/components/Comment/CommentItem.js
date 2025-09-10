// src/components/Comment/CommentItem.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaComment, FaUser } from "react-icons/fa";
import { useCommentClap } from '../../hooks/useCommentClap';
import { useUser } from '../../context/UserContext';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { addReply } from '../../services/commentService';
import AddCommentForm from './AddCommentForm';
import CommentContent from './CommentContent';
import ReplyList from './ReplyList';
import TimeAgo from '../Utils/TimeAgo';
import { themeClasses, componentClasses } from '../../utils/themeClasses';

const CommentItem = ({ comment, postId, mutate }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { user } = useUser();
  const { classes } = useThemeClasses();
  const repliesCount = comment.replies ? comment.replies.length : 0;

  // Use reusable clap hook
  const { clapsCount, clapsLoading, hasClapped, handleClap } = useCommentClap(
    comment.id, 
    comment.clap_count || 0
  );

  const handleToggleReply = () => {
    setShowReplyForm((prev) => !prev);
  };

  const handleReply = async (content, commentID) => {
    if (!user) {
      alert('Vui lòng đăng nhập để trả lời.');
      return;
    }
    if (!content.trim()) {
      alert('Phản hồi không thể để trống.');
      return;
    }

    try {
      await addReply(commentID, content);
      mutate(); // Refresh comments
    } catch (err) {
      console.error('Failed to add reply:', err);
      alert('Failed to add reply. Please try again.');
    }
  };

  return (
    <motion.div
      className="bg-medium-bg-card border border-medium-border rounded-card p-card shadow-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Author Info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-medium-bg-secondary rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
          {comment.user?.avatar_url ? (
            <img
              src={comment.user.avatar_url}
              alt={comment.user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <FaUser className={`${themeClasses.icons.sm} ${themeClasses.text.accent}`} />
          )}
        </div>
        <div className="flex items-center gap-sm">
          <span className={`${componentClasses.text.label} text-medium-text-primary`}>
            {comment.user?.name || 'Anonymous'}
          </span>
          <span className="text-medium-text-muted text-body-small">
            <TimeAgo timestamp={comment.created_at} />
          </span>
        </div>
      </div>

      {/* Comment Content */}
      <div className="mb-4 pl-11">
        <div className="text-medium-text-secondary leading-relaxed text-body">
          <CommentContent content={comment.content} />
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-6 pl-11">
        <button
          onClick={handleClap}
          className={`${themeClasses.interactive.touchTarget} gap-sm text-body-small transition-all duration-200 ${
            hasClapped ? 'text-medium-accent-green' : 'text-medium-text-muted hover:text-medium-accent-green'
          }`}
          aria-label="Clap for this comment"
        >
          <FaHeart className={`${themeClasses.icons.sm} ${clapsLoading ? 'animate-pulse' : ''}`} />
          <span>{clapsCount}</span>
        </button>

        <button
          onClick={handleToggleReply}
          className={`${themeClasses.interactive.touchTarget} gap-sm text-body-small text-medium-text-muted hover:text-medium-accent-green transition-all duration-200`}
          aria-label="Reply to this comment"
        >
          <FaComment className={themeClasses.icons.sm} />
          <span>{repliesCount}</span>
        </button>
      </div>

      {/* Reply Form and Replies */}
      <AnimatePresence>
        {showReplyForm && (
          <motion.div
            className="mt-4 ml-11"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Reply Form */}
            <div className="mb-4">
              <AddCommentForm 
                onAddComment={(content) => handleReply(content, comment.id)} 
                parentId={comment.id}
                user={user}
              />
            </div>

            {/* Replies List */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="space-y-3">
                <div className="text-body-small text-medium-text-secondary mb-sm font-serif font-bold">
                  Replies ({comment.replies.length}):
                </div>
                <ReplyList replies={comment.replies} commentId={comment.id} mutate={mutate} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CommentItem;



