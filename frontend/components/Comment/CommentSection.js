// components/Comment/CommentSection.js
import React from 'react';
import { useUser } from '../../context/UserContext';
import { useInfiniteComments } from '../../hooks/useInfiniteComments';
import LimitedCommentList from './LimitedCommentList';
import AddCommentForm from './AddCommentForm';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

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
    <div className={themeClasses.spacing.stackLarge}>
      {/* Section Header */}
      <h3 className={combineClasses(
        themeClasses.typography.h3,
        themeClasses.typography.weightBold,
        themeClasses.text.primary
      )}>
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