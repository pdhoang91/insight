'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { Comment } from '@/types';
import { LoadingSpinner } from '@/components/ui';
import CommentItem from './CommentItem';
import AddCommentForm from './AddCommentForm';

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { isAuthenticated } = useAuth();
  const { 
    comments, 
    totalCount, 
    isLoading, 
    createComment, 
    updateComment, 
    deleteComment,
    mutate 
  } = useComments(postId, true, 1, 20);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async (content: string) => {
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      await createComment(content);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      await updateComment(commentId, content);
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(commentId);
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Comments ({totalCount})
        </h3>
      </div>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <AddCommentForm
          onSubmit={handleAddComment}
          isSubmitting={isSubmitting}
          placeholder="Write a comment..."
        />
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">Sign in to join the conversation</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CommentItem
                comment={comment}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                onReply={handleAddComment}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {totalCount > comments.length && (
        <div className="text-center pt-4">
          <button
            onClick={() => mutate()}
            className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Load more comments
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentSection; 