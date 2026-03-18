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
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.625rem', marginBottom: '0.5rem' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '-0.015em',
            color: 'var(--text)',
            margin: 0,
          }}>
            {t('comment.responses')}
          </h3>
          {totalCount > 0 && (
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--text-faint)',
              letterSpacing: '0.02em',
            }}>
              ({totalCount})
            </span>
          )}
        </div>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          lineHeight: 1.5,
          color: 'var(--text-muted)',
          margin: 0,
        }}>
          Join the conversation
        </p>
      </div>

      <AddCommentForm
        postId={postId}
        user={user}
        onCommentAdded={() => mutate()}
      />

      <div style={{ marginTop: '2.5rem' }}>
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
