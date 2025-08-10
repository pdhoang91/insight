// src/components/Comment/CommentItem.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHandsClapping, FaComment, FaUser } from "react-icons/fa6";
import AddCommentForm from './AddCommentForm';
import CommentContent from './CommentContent';
import ReplyList from './ReplyList';
import { useClapsCount } from '../../hooks/useClapsCount';
import { useUser } from '../../context/UserContext';
import { addReply } from '../../services/commentService';
import { clapComment } from '../../services/activityService';
import TimeAgo from '../Utils/TimeAgo';

const CommentItem = ({ comment, postId, mutate }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { clapsCount, loading: clapsLoading, hasClapped, mutate: mutateClaps } = useClapsCount('comment', comment.id);
  const { user } = useUser();
  const repliesCount = comment.replies ? comment.replies.length : 0;

  const handleClap = async () => {
    if (!user) {
      alert('Please login to clap.');
      return;
    }
    try {
      await clapComment(comment.id);
      mutateClaps();
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('Failed to clap. Please try again.');
    }
  };

  const handleToggleReply = () => {
    setShowReplyForm((prev) => !prev);
  };

  const handleReply = async (content, commentID) => {
    if (!user) {
      alert('Please login to reply.');
      return;
    }
    if (!content.trim()) {
      alert('Reply cannot be empty.');
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
      className="bg-terminal-dark border border-matrix-green/20 rounded-lg hover:border-matrix-green/40 transition-all duration-300 p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Author Info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-terminal-gray rounded-full border border-matrix-green/50 flex items-center justify-center flex-shrink-0">
          {comment.user?.avatar ? (
            <img
              src={comment.user.avatar}
              alt={comment.user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <FaUser className="w-4 h-4 text-matrix-green" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary">
            {comment.user?.name || 'Anonymous'}
          </span>
          <span className="text-text-muted text-sm">
            <TimeAgo timestamp={comment.created_at} />
          </span>
        </div>
      </div>

      {/* Comment Content */}
      <div className="mb-4 pl-11">
        <div className="text-text-secondary leading-relaxed">
          <CommentContent content={comment.content} />
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-4 pl-11">
        <button
          onClick={handleClap}
          className={`flex items-center gap-1 text-sm transition-colors ${
            hasClapped ? 'text-hacker-yellow' : 'text-text-muted hover:text-hacker-yellow'
          }`}
          aria-label="Clap for this comment"
        >
          <FaHandsClapping className={`w-3 h-3 ${clapsLoading ? 'animate-pulse' : ''}`} />
          <span>{clapsCount}</span>
        </button>

        <button
          onClick={handleToggleReply}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-matrix-green transition-colors"
          aria-label="Reply to this comment"
        >
          <FaComment className="w-3 h-3" />
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
            transition={{ duration: 0.3 }}
          >
            {/* Reply Form */}
            <div className="mb-4">
              <AddCommentForm 
                onAddComment={(content) => handleReply(content, comment.id)} 
                parentId={comment.id}
              />
            </div>

            {/* Replies List */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm text-matrix-green mb-2">
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



