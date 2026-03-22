'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import ReplyItem from './ReplyItem';

const replyListVariants = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const replyItemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 120, damping: 22 },
  },
};

const ReplyList = ({ replies, isLoading, canLoadMore, loadMore, commentId, mutate }) => {
  const t = useTranslations();

  if (isLoading && (!replies || replies.length === 0)) {
    return (
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', color: 'var(--text-faint)', margin: '0.5rem 0' }}>
        {t('comment.loading')}
      </p>
    );
  }

  if (!Array.isArray(replies) || replies.length === 0) return null;

  return (
    <div>
      <motion.div
        variants={replyListVariants}
        initial="hidden"
        animate="visible"
      >
        {replies.map((reply) => (
          <motion.div key={reply.id} variants={replyItemVariants}>
            <ReplyItem reply={reply} commentId={commentId} mutate={mutate} />
          </motion.div>
        ))}
      </motion.div>

      {canLoadMore && (
        <button
          onClick={loadMore}
          disabled={isLoading}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.72rem',
            letterSpacing: '0.02em',
            color: 'var(--text-faint)',
            background: 'none',
            border: 'none',
            cursor: isLoading ? 'default' : 'pointer',
            padding: '0.5rem 0',
            opacity: isLoading ? 0.5 : 1,
            transition: 'color 0.2s, opacity 0.2s',
          }}
          className="hover:text-[var(--text-muted)]"
        >
          {isLoading ? t('comment.loading') : t('comment.loadMoreReplies')}
        </button>
      )}
    </div>
  );
};

export default ReplyList;
