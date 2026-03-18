'use client';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaUser } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useTranslations } from 'next-intl';
import { useCommentClap } from '../../hooks/useCommentClap';
import { useUser } from '../../context/UserContext';
import { addReply } from '../../services/commentService';
import AddCommentForm from './AddCommentForm';
import CommentContent from './CommentContent';
import ReplyList from './ReplyList';
import TimeAgo from '../Utils/TimeAgo';

const CommentItem = ({ comment, postId, mutate }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const t = useTranslations();
  const { user } = useUser();
  const repliesCount = comment.replies?.length || 0;
  const { clapsCount, clapsLoading, hasClapped, handleClap } = useCommentClap(comment.id, comment.clap_count || 0);

  const handleReply = async (content, commentID) => {
    if (!user) { alert(t('comment.loginToComment')); return; }
    if (!content.trim()) return;
    try {
      await addReply(commentID, content);
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
      borderBottom: '1px solid var(--border)',
      paddingBottom: '1.5rem',
      marginBottom: '1.5rem',
    }}
    className="last:border-0 last:pb-0 last:mb-0"
    >
      <div style={{ display: 'flex', gap: '0.875rem' }}>
        <div style={{
          flexShrink: 0,
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--bg-surface)',
          overflow: 'hidden',
          border: '1.5px solid var(--border)',
          marginTop: '0.1rem',
        }}>
          {comment.user?.avatar_url ? (
            <img src={comment.user.avatar_url} alt={comment.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaUser style={{ width: 12, height: 12, color: 'var(--text-faint)' }} />
            </div>
          )}
        </div>

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
            <button
              onClick={handleClap}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '-0.01em',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                color: hasClapped ? 'var(--accent)' : 'var(--text-faint)',
                transition: 'color 0.2s',
              }}
              className="hover:text-[var(--accent)]"
            >
              <FaHandsClapping style={{ width: 13, height: 13, opacity: clapsLoading ? 0.5 : 1 }} />
              {clapsCount > 0 && <span>{clapsCount}</span>}
            </button>

            <button
              onClick={() => setShowReplyForm(prev => !prev)}
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
              {repliesCount > 0
                ? `${t('comment.reply')} · ${repliesCount}`
                : t('comment.reply')}
            </button>
          </div>

          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ marginTop: '1.25rem' }}>
                  <AddCommentForm
                    onAddComment={(content) => handleReply(content, comment.id)}
                    parentId={comment.id}
                    user={user}
                  />
                </div>

                {comment.replies?.length > 0 && (
                  <div style={{
                    marginTop: '1.25rem',
                    paddingLeft: '1rem',
                    borderLeft: '2px solid var(--border)',
                  }}>
                    <ReplyList replies={comment.replies} commentId={comment.id} mutate={mutate} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </li>
  );
};

export default CommentItem;
