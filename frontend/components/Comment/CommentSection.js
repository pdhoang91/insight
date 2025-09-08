// components/Comment/CommentSection.js
import React from 'react';
import { useUser } from '../../context/UserContext';
import { useInfiniteComments } from '../../hooks/useInfiniteComments';
import LimitedCommentList from './LimitedCommentList';
import AddCommentForm from './AddCommentForm';

const CommentSection = ({ postId }) => {
  const { user } = useUser();
  
  const { 
    comments, 
    totalCount, 
    isLoading, 
    isError, 
    canLoadMore,
    loadMore,
    mutate 
  } = useInfiniteComments(postId, true, 5);

  const flatComments = comments ? comments.flat() : [];

  const handleCommentAdded = () => {
    mutate(); // Refresh comments
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <h3 className="text-heading-3 font-serif text-medium-text-primary">
        Bình luận ({totalCount || 0})
      </h3>

      {/* Add Comment Form */}
      <AddCommentForm 
        postId={postId}
        user={user}
        onCommentAdded={handleCommentAdded}
      />

      {/* Comments List */}
      <LimitedCommentList
        comments={flatComments}
        postId={postId}
        mutate={mutate}
        canLoadMore={canLoadMore}
        loadMore={loadMore}
        isLoadingMore={isLoading}
        totalCount={totalCount || 0}
      />
    </div>
  );
};

export default CommentSection;