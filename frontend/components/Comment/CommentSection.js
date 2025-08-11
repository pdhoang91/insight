// components/Comment/CommentSection.js
import React, { useMemo } from 'react';
import LimitedCommentList from './LimitedCommentList';
import AddCommentForm from './AddCommentForm';
import { addComment } from '../../services/commentService';
import { useInfiniteComments } from '../../hooks/useInfiniteComments';
import { FaSpinner } from 'react-icons/fa';

const CommentSection = ({ postId, user }) => {
  const { 
    comments, 
    totalCount, 
    totalCommentReply,
    isLoading, 
    isError, 
    canLoadMore,
    loadMore,
    mutate 
  } = useInfiniteComments(postId, true, 2);

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

  return (
    <div className="mt-12">
      {/* Header */}
      <div className="mb-6 px-8">
        <h2 className="text-2xl font-bold text-primary font-mono mb-2">
          Comments ({totalComments})
        </h2>
      </div>

      {/* Add Comment Form */}
      <div className="mb-8 px-8">
        {user ? (
          <AddCommentForm onAddComment={handleAddComment} />
        ) : (
          <div className="p-4 border border-primary rounded-md bg-elevated">
            <p className="text-muted font-mono">// Login required to comment</p>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="px-8">
        {isError && (
          <div className="text-red-400 font-mono mb-4">// Failed to load comments</div>
        )}
        {isLoading && !isError && (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-primary mr-2" />
            <span className="text-secondary font-mono">Loading comments...</span>
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
    </div>
  );
};

export default CommentSection; 