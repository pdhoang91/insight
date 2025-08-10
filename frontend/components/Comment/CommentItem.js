// src/components/Comment/CommentItem.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHandsClapping, FaComment, FaUser, FaTerminal } from "react-icons/fa6";
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
      alert('Authentication required: Please login to clap.');
      return;
    }
    try {
      await clapComment(comment.id);
      mutateClaps();
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('Error: Unable to process clap request.');
    }
  };

  const handleToggleReply = () => {
    setShowReplyForm((prev) => !prev);
  };

  const handleReply = async (content, commentID) => {
    if (!user) {
      alert('Authentication required: Please login to reply.');
      return;
    }
    if (!content.trim()) {
      alert('Error: Reply content cannot be empty.');
      return;
    }

    try {
      await addReply(commentID, content);
      mutate(); // Refresh comments
    } catch (err) {
      console.error('Failed to add reply:', err);
      alert('Error: Failed to add reply. Please try again.');
    }
  };

  return (
    <motion.div
      className="bg-terminal-gray border border-matrix-green/30 rounded hover:border-matrix-green hover:shadow-neon-green/20 transition-all duration-300"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Terminal Comment Header */}
      <div className="bg-terminal-light px-4 py-2 border-b border-matrix-green/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="flex space-x-1">
              <span className="w-1.5 h-1.5 bg-hacker-red rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-hacker-yellow rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-matrix-green rounded-full"></span>
            </span>
            <FaTerminal className="w-3 h-3 text-matrix-cyan" />
            <span className="text-matrix-green">comment@{comment.id}</span>
          </div>
          <div className="text-text-muted text-xs">
            <TimeAgo timestamp={comment.created_at} />
          </div>
        </div>
      </div>

      <div className="p-4 bg-terminal-dark">
        {/* Author Info with Avatar */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-terminal-gray rounded border border-matrix-green/50 flex items-center justify-center flex-shrink-0">
            {comment.user?.avatar ? (
              <img
                src={comment.user.avatar}
                alt={comment.user.name}
                className="w-full h-full rounded object-cover"
              />
            ) : (
              <FaUser className="w-4 h-4 text-matrix-green" />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm font-mono">
            <span className="text-matrix-green">$</span>
            <span className="font-medium text-text-primary">
              {comment.user?.name || 'anonymous'}
            </span>
            <span className="text-text-muted">@terminal</span>
          </div>
        </div>

        {/* Comment Content */}
        <div className="mb-4 pl-11">
          <div className="text-text-secondary font-mono text-sm leading-relaxed">
            <span className="text-text-muted">//</span> <CommentContent content={comment.content} />
          </div>
        </div>

        {/* Action Bar - Terminal Style */}
        <div className="flex items-center justify-between pl-11">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleClap}
              className={`flex items-center gap-1 text-sm font-mono focus:outline-none transition-all hover:scale-110 ${
                hasClapped ? 'text-hacker-yellow' : 'text-text-muted hover:text-hacker-yellow'
              }`}
              aria-label="Clap for this comment"
            >
              <FaHandsClapping className={`w-3 h-3 ${clapsLoading ? 'animate-pulse' : ''}`} />
              <span>{clapsCount}</span>
            </button>

            <button
              onClick={handleToggleReply}
              className="flex items-center gap-1 text-sm text-text-muted hover:text-matrix-green focus:outline-none transition-colors font-mono"
              aria-label="Reply to this comment"
            >
              <FaComment className="w-3 h-3" />
              <span>{repliesCount}</span>
            </button>
          </div>

          <div className="text-xs text-text-muted font-mono">
            Size: {comment.content?.length || 0} chars
          </div>
        </div>

        {/* Reply Form and Replies with Animation */}
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
                  placeholder="$ echo 'your reply here'"
                />
              </div>

              {/* Replies List */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-mono text-matrix-green mb-2">
                    <FaTerminal className="w-3 h-3 inline mr-1" />
                    Replies ({comment.replies.length}):
                  </div>
                  <ReplyList replies={comment.replies} commentId={comment.id} mutate={mutate} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Terminal Status Bar */}
      <div className="bg-terminal-light px-4 py-1 border-t border-matrix-green/30">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-text-muted">
            Type: comment | Author: {comment.user?.name || 'anonymous'}
          </span>
          <span className="text-matrix-green">
            {showReplyForm ? 'ESC to close' : 'R to reply'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentItem;



