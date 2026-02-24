// components/Comment/CommentItem.js
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaHeart, FaComment, FaUser } from 'react-icons/fa';
import { useCommentClap } from '../../hooks/useCommentClap';
import { useUser } from '../../context/UserContext';
import { addReply } from '../../services/commentService';
import AddCommentForm from './AddCommentForm';
import CommentContent from './CommentContent';
import ReplyList from './ReplyList';
import TimeAgo from '../Utils/TimeAgo';

const CommentItem = ({ comment, postId, mutate }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { user } = useUser();
  const repliesCount = comment.replies?.length || 0;

  const { clapsCount, clapsLoading, hasClapped, handleClap } = useCommentClap(
    comment.id,
    comment.clap_count || 0
  );

  const handleReply = async (content, commentID) => {
    if (!user) {
      alert('Vui lòng đăng nhập để trả lời.');
      return;
    }
    if (!content.trim()) return;

    try {
      await addReply(commentID, content);
      mutate();
    } catch (err) {
      console.error('Failed to add reply:', err);
      alert('Không thể thêm phản hồi. Vui lòng thử lại.');
    }
  };

  return (
    <motion.li
      className="list-none"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-medium-bg-secondary flex items-center justify-center overflow-hidden">
          {comment.user?.avatar_url ? (
            <img src={comment.user.avatar_url} alt={comment.user.name} className="w-full h-full object-cover" />
          ) : (
            <FaUser className="w-3.5 h-3.5 text-medium-text-muted" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + time */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-medium-text-primary">
              {comment.user?.name || 'Anonymous'}
            </span>
            <span className="text-xs text-medium-text-muted">
              <TimeAgo timestamp={comment.created_at} />
            </span>
          </div>

          {/* Content */}
          <div className="text-sm text-medium-text-secondary leading-relaxed mb-2">
            <CommentContent content={comment.content} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleClap}
              className={`flex items-center gap-1 text-xs transition-colors ${
                hasClapped ? 'text-medium-accent-green' : 'text-medium-text-muted hover:text-medium-accent-green'
              }`}
            >
              <FaHeart className={`w-3 h-3 ${clapsLoading ? 'animate-pulse' : ''}`} />
              <span>{clapsCount}</span>
            </button>

            <button
              onClick={() => setShowReplyForm(prev => !prev)}
              className="flex items-center gap-1 text-xs text-medium-text-muted hover:text-medium-accent-green transition-colors"
            >
              <FaComment className="w-3 h-3" />
              <span>{repliesCount > 0 ? repliesCount : 'Reply'}</span>
            </button>
          </div>

          {/* Replies — capped at 2 levels (no nested replies within replies) */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                className="mt-3"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <AddCommentForm
                  onAddComment={(content) => handleReply(content, comment.id)}
                  parentId={comment.id}
                  user={user}
                />

                {comment.replies?.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-medium-border">
                    <ReplyList replies={comment.replies} commentId={comment.id} mutate={mutate} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.li>
  );
};

export default CommentItem;
