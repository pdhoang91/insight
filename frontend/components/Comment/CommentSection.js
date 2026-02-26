// components/Comment/CommentSection.js
import React from 'react';
import { useTranslations } from 'next-intl';
import { useUser } from '../../context/UserContext';
import { useInfiniteComments } from '../../hooks/useInfiniteComments';
import LimitedCommentList from './LimitedCommentList';
import AddCommentForm from './AddCommentForm';

const CommentSection = ({ postId }) => {
  const t = useTranslations();
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

  return (
    <div>
      <h3 className="font-serif text-xl font-bold text-[#292929] mb-6">
        {t('comment.responses')} ({totalCount || 0})
      </h3>

      <AddCommentForm 
        postId={postId}
        user={user}
        onCommentAdded={() => mutate()}
      />

      <div className="mt-8">
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
    </div>
  );
};

export default CommentSection;
