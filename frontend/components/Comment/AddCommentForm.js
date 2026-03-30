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

  const resetForm = () => {
    setContent('');
    setIsFocused(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

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
      resetForm();
    } catch {
      alert(t('comment.addError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="px-4 py-3.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[2px]">
        <p className="ui-label m-0">{t('comment.loginToComment')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex-1 min-w-0">
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
          className="w-full resize-none outline-none border-none rounded-[2px] px-2 pb-2 pt-1.5 transition-colors"
          style={{
            background: isFocused ? 'var(--bg-surface)' : 'transparent',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            lineHeight: 1.65,
            color: 'var(--text)',
          }}
        />

        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="flex items-center justify-end gap-3 mt-3"
            >
              <motion.button
                type="button"
                onClick={resetForm}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="font-display text-[0.78rem] font-medium tracking-tight text-[var(--text-faint)] bg-transparent border-none cursor-pointer transition-colors hover:text-[var(--text-muted)]"
              >
                {t('editor.cancel')}
              </motion.button>

              <motion.button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                whileTap={content.trim() ? { scale: 0.98 } : {}}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`font-display text-[0.78rem] font-semibold tracking-wide rounded-[2px] px-4 py-1.5 border-none transition-all ${
                  content.trim()
                    ? 'bg-[var(--accent)] text-[var(--text-inverse)] cursor-pointer hover:opacity-90'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-faint)] cursor-not-allowed'
                }`}
              >
                {isSubmitting ? '...' : t('comment.respond')}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
};

export default AddCommentForm;
