'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaReply, FaEdit, FaTrash } from 'react-icons/fa';
import { Comment } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useCommentLike } from '@/hooks/useComments';
import { SafeImage } from '@/components/ui';

interface CommentItemProps {
  comment: Comment;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onReply: (content: string, parentId?: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onEdit, 
  onDelete, 
  onReply 
}) => {
  const { user, isAuthenticated } = useAuth();
  const { liked, likesCount, toggleLike } = useCommentLike(comment.id);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const isOwnComment = user?.id === comment.author.id;

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('You need to login to like comments.');
      return;
    }

    try {
      await toggleLike();
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleEdit = () => {
    if (editContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }

    onEdit(comment.id, editContent.trim());
    setIsEditing(false);
  };

  const handleReply = () => {
    if (!replyContent.trim()) return;

    onReply(replyContent.trim(), comment.id);
    setReplyContent('');
    setIsReplying(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex space-x-3"
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <SafeImage
          src={comment.author.avatar}
          alt={comment.author.username}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-lg px-4 py-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {comment.author.username}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            {/* Actions for own comments */}
            {isOwnComment && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <FaEdit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">{comment.content}</p>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center space-x-4 mt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                liked
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-500 hover:text-red-500'
              }`}
              disabled={!isAuthenticated}
            >
              <FaHeart className="w-3 h-3" />
              <span>{likesCount || comment.likesCount}</span>
            </motion.button>

            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <FaReply className="w-3 h-3" />
              <span>Reply</span>
            </button>
          </div>
        )}

        {/* Reply Form */}
        {isReplying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3"
          >
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Reply to ${comment.author.username}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReply}
                disabled={!replyContent.trim()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reply
              </button>
              <button
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                }}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CommentItem; 