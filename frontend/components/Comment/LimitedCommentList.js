// components/Comment/LimitedCommentList.js
import React from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations();

  if (!Array.isArray(comments)) {
    return <div className="text-red-500 text-sm">{t('comment.invalidData')}</div>;
  }

  if (comments.length === 0) {
    return <p className="text-[#b3b3b1] text-center py-8 text-sm">{t('comment.noComments')}</p>;
  }

  return (
    <div>
      <ul>
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
            className="flex items-center gap-2 px-5 py-2 text-[13px] text-[#6b6b6b] hover:text-[#292929] transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                <span>...</span>
              </>
            ) : (
              <>
                <FaChevronDown className="w-3 h-3" />
                <span>{t('comment.loadMore')} ({Math.max(0, totalCount - comments.length)} {t('comment.remaining')})</span>
              </>
            )}
          </button>
        </div>
      )}

      {totalCount > 0 && (
        <div className="text-center text-[#b3b3b1] text-[12px] pt-3">
          {t('comment.showing')} {comments.length} {t('comment.of')} {totalCount} {t('comment.comments')}
        </div>
      )}
    </div>
  );
};

export default LimitedCommentList;
