'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { useUser } from '../../context/UserContext';
import { useInfiniteComments } from '../../hooks/useInfiniteComments';
import LimitedCommentList from './LimitedCommentList';
import AddCommentForm from './AddCommentForm';

const CommentSection = ({ postId }) => {
  const t = useTranslations();
  const { user } = useUser();
  const { comments, totalCount, isLoading, isError, canLoadMore, loadMore, mutate } =
    useInfiniteComments(postId, true, 5);
  const flatComments = comments ? comments.flat() : [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.625rem', marginBottom: '1.75rem' }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.66rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-faint)',
          margin: 0,
        }}>
          {t('comment.responses')}
        </p>
        {totalCount > 0 && (
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.72rem',
            fontWeight: 500,
            color: 'var(--text-faint)',
            letterSpacing: '0.02em',
          }}>
            {totalCount}
          </span>
        )}
      </div>

      <AddCommentForm
        postId={postId}
        user={user}
        onCommentAdded={() => mutate()}
      />

      <div style={{ marginTop: '2rem' }}>
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
