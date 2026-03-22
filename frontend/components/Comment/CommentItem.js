'use client';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useUser } from '../../context/UserContext';
import { addReply } from '../../services/commentService';
import { useCommentReplies } from '../../hooks/useCommentReplies';
import AddCommentForm from './AddCommentForm';
import CommentContent from './CommentContent';
import ReplyList from './ReplyList';
import TimeAgo from '../Utils/TimeAgo';
import Avatar from '../UI/Avatar';

const CommentItem = ({ comment, postId, mutate }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const t = useTranslations();
  const { user } = useUser();
  const repliesCount = comment.replies_count || 0;

  const { replies, isLoading: repliesLoading, canLoadMore, loadMore, mutate: mutateReplies } =
    useCommentReplies(comment.id, showReplies);

  const handleReply = async (content, commentID) => {
    if (!user) { alert(t('comment.loginToComment')); return; }
    if (!content.trim()) return;
    try {
      await addReply(commentID, content);
      mutateReplies();
      mutate();
      setShowReplyForm(false);
    } catch (err) {
      console.error('Failed to add reply:', err);
      alert(t('comment.addError'));
    }
  };

  return (
    <li style={{
      listStyle: 'none',
      paddingBottom: '1.5rem',
      marginBottom: '1.5rem',
    }}
    className="last:pb-0 last:mb-0"
    >
      <div style={{ display: 'flex', gap: '0.875rem' }}>
        <Avatar
          src={comment.user?.avatar_url}
          name={comment.user?.name}
          size="sm"
          style={{ flexShrink: 0, marginTop: '0.1rem' }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.625rem', marginBottom: '0.5rem' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: 'var(--text)',
            }}>
              {comment.user?.name || 'Anonymous'}
            </span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.72rem',
              color: 'var(--text-faint)',
              letterSpacing: '0.01em',
            }}>
              <TimeAgo timestamp={comment.created_at} />
            </span>
          </div>

          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            lineHeight: 1.65,
            color: 'var(--text)',
            marginBottom: '0.75rem',
          }}>
            <CommentContent content={comment.content} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <motion.button
              onClick={() => setShowReplyForm(prev => !prev)}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                letterSpacing: '-0.01em',
                color: showReplyForm ? 'var(--text-muted)' : 'var(--text-faint)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                transition: 'color 0.2s',
              }}
              className="hover:text-[var(--text-muted)]"
            >
              {t('comment.reply')}
            </motion.button>

            {repliesCount > 0 && (
              <motion.button
                onClick={() => setShowReplies(prev => !prev)}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.75rem',
                  letterSpacing: '-0.01em',
                  color: showReplies ? 'var(--text-muted)' : 'var(--text-faint)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'color 0.2s',
                }}
                className="hover:text-[var(--text-muted)]"
              >
                {showReplies
                  ? t('comment.hideReplies')
                  : `${t('comment.viewReplies')} (${repliesCount})`}
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  marginTop: '1.25rem',
                  paddingLeft: '1rem',
                  borderLeft: '2px solid var(--border)',
                }}>
                  <ReplyList
                    replies={replies}
                    isLoading={repliesLoading}
                    canLoadMore={canLoadMore}
                    loadMore={loadMore}
                    commentId={comment.id}
                    mutate={mutateReplies}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                style={{ overflow: 'hidden' }}
              >
                <motion.div
                  initial={{ y: -8 }}
                  animate={{ y: 0 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.05 }}
                  style={{ marginTop: '1.25rem' }}
                >
                  <AddCommentForm
                    onAddComment={(content) => handleReply(content, comment.id)}
                    parentId={comment.id}
                    user={user}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </li>
  );
};

export default CommentItem;
