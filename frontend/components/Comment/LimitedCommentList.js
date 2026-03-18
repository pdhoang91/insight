'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import CommentItem from './CommentItem';

const listVariants = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        style={{
          padding: '3rem 1.5rem',
          textAlign: 'center',
          border: '1px dashed var(--border)',
          borderRadius: '3px',
          background: 'var(--bg-surface)',
        }}
      >
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.875rem',
          fontWeight: 500,
          letterSpacing: '-0.01em',
          color: 'var(--text-muted)',
          margin: '0 0 0.35rem 0',
        }}>
          {t('comment.noComments')}
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.8rem',
          lineHeight: 1.5,
          color: 'var(--text-faint)',
          margin: 0,
        }}>
          Be the first to share your thoughts
        </p>
      </motion.div>
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
        <div style={{ paddingTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <motion.button
            onClick={loadMore}
            disabled={isLoadingMore}
            whileTap={!isLoadingMore ? { scale: 0.97 } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
              background: 'none',
              border: 'none',
              cursor: isLoadingMore ? 'default' : 'pointer',
              padding: '0.5rem 0.75rem',
              opacity: isLoadingMore ? 0.5 : 1,
              transition: 'color 0.2s, opacity 0.2s',
            }}
            className="hover:text-[var(--text-muted)]"
          >
            <motion.div
              animate={isLoadingMore ? { rotate: 180 } : { rotate: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              <FaChevronDown style={{ width: 10, height: 10 }} />
            </motion.div>
            <span>
              {isLoadingMore
                ? 'Loading...'
                : `${t('comment.loadMore')} · ${Math.max(0, totalCount - comments.length)} ${t('comment.remaining')}`}
            </span>
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default LimitedCommentList;
