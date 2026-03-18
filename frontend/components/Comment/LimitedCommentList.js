'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import CommentItem from './CommentItem';

const listVariants = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
};

const LimitedCommentList = ({ comments, postId, mutate, canLoadMore, loadMore, isLoadingMore, totalCount }) => {
  const t = useTranslations();

  if (!Array.isArray(comments)) {
    return (
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', color: '#DC2626', margin: 0 }}>
        {t('comment.invalidData')}
      </p>
    );
  }

  if (comments.length === 0) {
    return (
      <div style={{ padding: '2rem 0', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.82rem',
          letterSpacing: '-0.01em',
          color: 'var(--text-faint)',
          margin: 0,
        }}>
          {t('comment.noComments')}
        </p>
      </div>
    );
  }

  return (
    <div>
      <motion.ul
        variants={listVariants}
        initial="hidden"
        animate="visible"
        style={{ listStyle: 'none', margin: 0, padding: 0 }}
      >
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div key={comment.id} variants={itemVariants}>
              <CommentItem comment={comment} postId={postId} mutate={mutate} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.ul>

      {canLoadMore && (
        <div style={{ paddingTop: '1.25rem', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.02em',
              color: 'var(--text-faint)',
              background: 'none',
              border: 'none',
              cursor: isLoadingMore ? 'default' : 'pointer',
              padding: 0,
              opacity: isLoadingMore ? 0.5 : 1,
              transition: 'color 0.2s, opacity 0.2s',
            }}
            className="hover:text-[var(--text-muted)]"
          >
            <FaChevronDown style={{ width: 10, height: 10 }} />
            <span>
              {isLoadingMore
                ? '...'
                : `${t('comment.loadMore')} · ${Math.max(0, totalCount - comments.length)} ${t('comment.remaining')}`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LimitedCommentList;
