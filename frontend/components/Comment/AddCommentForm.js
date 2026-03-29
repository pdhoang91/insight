'use client';
import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { addComment } from '../../services/commentService';

const AddCommentForm = ({ onAddComment, postId, user, onCommentAdded, parentId = null }) => {
  const t = useTranslations();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  const isReply = !!parentId;
  const placeholder = isReply ? t('comment.replyPlaceholder') : t('comment.placeholder');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!user) { alert(t('comment.loginToComment')); return; }
    setIsSubmitting(true);
    try {
      if (onAddComment) {
        await onAddComment(content, parentId);
      } else if (postId && onCommentAdded) {
        await addComment(postId, content);
        onCommentAdded();
      }
      setContent('');
      setIsFocused(false);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert(t('comment.addError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    setIsFocused(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  if (!user) {
    return (
      <div style={{
        padding: '0.875rem 1rem',
        background: 'var(--bg-surface)',
        borderRadius: '2px',
        border: '1px solid var(--border)',
      }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.82rem',
          color: 'var(--text-faint)',
          margin: 0,
          letterSpacing: '-0.01em',
        }}>
          {t('comment.loginToComment')}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onFocus={() => setIsFocused(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (content.trim() && !isSubmitting) handleSubmit(e);
              }
            }}
            rows={1}
            style={{
              width: '100%',
              resize: 'none',
              background: isFocused ? 'var(--bg-surface)' : 'transparent',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              lineHeight: 1.65,
              color: 'var(--text)',
              outline: 'none',
              border: 'none',
              borderRadius: '2px',
              padding: '0.35rem 0.5rem 0.5rem',
              transition: 'background 0.2s',
            }}
          />

          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}
              >
                <motion.button
                  type="button"
                  onClick={handleCancel}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    color: 'var(--text-faint)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  className="hover:text-[var(--text-muted)]"
                >
                  {t('editor.cancel')}
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  whileTap={content.trim() ? { scale: 0.98 } : {}}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    color: content.trim() ? 'var(--text-inverse)' : 'var(--text-faint)',
                    background: content.trim() ? 'var(--accent)' : 'var(--bg-elevated)',
                    border: 'none',
                    borderRadius: '2px',
                    padding: '0.4rem 1rem',
                    cursor: content.trim() ? 'pointer' : 'not-allowed',
                    transition: 'background 0.2s, color 0.2s, opacity 0.2s',
                  }}
                  className={content.trim() ? 'hover:opacity-90' : ''}
                >
                  {isSubmitting ? '...' : t('comment.respond')}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </form>
  );
};

export default AddCommentForm;
