// src/components/Comment/CommentItem.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaComment, FaUser } from "react-icons/fa";
import { useCommentClap } from '../../hooks/useCommentClap';
import { useUser } from '../../context/UserContext';
import { addReply } from '../../services/commentService';
import AddCommentForm from './AddCommentForm';
import CommentContent from './CommentContent';
import ReplyList from './ReplyList';
import TimeAgo from '../Utils/TimeAgo';
import { themeClasses, componentClasses } from '../../utils/themeClasses';

const CommentItem = ({ comment, postId, mutate }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { user } = useUser();
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
      alert('Không thể thêm phản hồi. Vui lòng thử lại.');
    }
  };

  return (
    <motion.div
      className={`${themeClasses.bg.card} border ${themeClasses.border.primary} ${themeClasses.effects.rounded} ${themeClasses.spacing.card} ${themeClasses.effects.shadow}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Author Info */}
      <div className={`flex items-center ${themeClasses.spacing.gapSmall} mb-4`}>
        <div className={`${themeClasses.avatar.sm} ${themeClasses.bg.secondary} flex items-center justify-center flex-shrink-0 ${themeClasses.effects.shadow}`}>
          {comment.user?.avatar_url ? (
            <img
              src={comment.user.avatar_url}
              alt={comment.user.name}
              className={`${themeClasses.utils.full} rounded-full object-cover`}
            />
          ) : (
            <FaUser className={`${themeClasses.icons.sm} ${themeClasses.text.accent}`} />
          )}
        </div>
        <div className={`flex items-center ${themeClasses.spacing.gapSmall}`}>
          <span className={`${themeClasses.text.labelMedium} ${themeClasses.text.primary}`}>
            {comment.user?.name || 'Anonymous'}
          </span>
          <span className={`${themeClasses.text.muted} ${themeClasses.text.bodySmall}`}>
            <TimeAgo timestamp={comment.created_at} />
          </span>
        </div>
      </div>

      {/* Comment Content */}
      <div className={`${themeClasses.spacing.marginBottom} pl-11`}>
        <div className={`${themeClasses.text.secondary} leading-relaxed ${themeClasses.text.body}`}>
          <CommentContent content={comment.content} />
        </div>
      </div>

      {/* Action Bar */}
      <div className={`flex items-center ${themeClasses.spacing.gap} pl-11`}>
        <button
          onClick={handleClap}
          className={`${themeClasses.interactive.touchTarget} ${themeClasses.spacing.gapSmall} ${themeClasses.text.bodySmall} ${themeClasses.animations.smooth} ${
            hasClapped ? themeClasses.text.accent : `${themeClasses.text.muted} ${themeClasses.text.accentHover}`
          }`}
          aria-label="Clap for this comment"
        >
          <FaHeart className={`${themeClasses.icons.sm} ${clapsLoading ? 'animate-pulse' : ''}`} />
          <span>{clapsCount}</span>
        </button>

        <button
          onClick={handleToggleReply}
          className={`${themeClasses.interactive.touchTarget} ${themeClasses.spacing.gapSmall} ${themeClasses.text.bodySmall} ${themeClasses.text.muted} ${themeClasses.text.accentHover} ${themeClasses.animations.smooth}`}
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
            <div className={themeClasses.spacing.marginBottom}>
              <AddCommentForm 
                onAddComment={(content) => handleReply(content, comment.id)} 
                parentId={comment.id}
                user={user}
              />
            </div>

            {/* Replies List */}
            {comment.replies && comment.replies.length > 0 && (
              <div className={themeClasses.spacing.stackSmall}>
                <div className={`${themeClasses.text.bodySmall} ${themeClasses.text.secondary} ${themeClasses.spacing.marginBottom} ${themeClasses.typography.serif} ${themeClasses.typography.weightBold}`}>
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



