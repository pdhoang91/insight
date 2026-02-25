// components/Comment/CommentSection.js
import React from 'react';
import { useTranslation } from 'next-i18next';
import { useUser } from '../../context/UserContext';
import { useInfiniteComments } from '../../hooks/useInfiniteComments';
import LimitedCommentList from './LimitedCommentList';
import AddCommentForm from './AddCommentForm';

const CommentSection = ({ postId }) => {
  const { t } = useTranslation('common');
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
    mutate();
  };

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-xl font-bold text-medium-text-primary">
        {t('comment.responses')} ({totalCount || 0})
      </h3>

      <AddCommentForm 
        postId={postId}
        user={user}
        onCommentAdded={handleCommentAdded}
      />

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
