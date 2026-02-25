// components/Comment/LimitedCommentList.js
import React from 'react';
import { useTranslation } from 'next-i18next';
import CommentItem from './CommentItem';
import { AnimatePresence } from 'framer-motion';
import { FaSpinner, FaChevronDown } from 'react-icons/fa';

const LimitedCommentList = ({
  comments,
  postId,
  mutate,
  canLoadMore,
  loadMore,
  isLoadingMore,
  totalCount,
}) => {
  const { t } = useTranslation('common');

  if (!Array.isArray(comments)) {
    return <div className="text-red-500 text-sm">{t('comment.invalidData')}</div>;
  }

  if (comments.length === 0) {
    return <p className="text-medium-text-muted text-center py-8 text-sm">{t('comment.noComments')}</p>;
  }

  return (
    <div className="space-y-6">
      <ul className="space-y-6">
        <AnimatePresence>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} mutate={mutate} />
          ))}
        </AnimatePresence>
      </ul>

      {canLoadMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-5 py-2 text-sm text-medium-text-secondary hover:text-medium-text-primary transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                <span>...</span>
              </>
            ) : (
              <>
                <FaChevronDown className="w-3.5 h-3.5" />
                <span>{t('comment.loadMore')} ({Math.max(0, totalCount - comments.length)} {t('comment.remaining')})</span>
              </>
            )}
          </button>
        </div>
      )}

      {totalCount > 0 && (
        <div className="text-center text-medium-text-muted text-xs pt-2">
          {t('comment.showing')} {comments.length} {t('comment.of')} {totalCount} {t('comment.comments')}
        </div>
      )}
    </div>
  );
};

export default LimitedCommentList;
