// components/Comment/AddCommentForm.js — Medium-style comment form
import React, { useState, useRef } from 'react';
import { FaUser } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import { addComment } from '../../services/commentService';

const AddCommentForm = ({ onAddComment, postId, user, onCommentAdded, parentId = null }) => {
  const { t } = useTranslation('common');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  const placeholder = parentId ? t('comment.replyPlaceholder') : t('comment.placeholder');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim() === '') return;

    if (!user) {
      alert(t('comment.loginToComment'));
      return;
    }

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
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert(t('comment.addError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-medium-bg-secondary flex items-center justify-center overflow-hidden">
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt={user?.name} className="w-full h-full object-cover" />
        ) : (
          <FaUser className="w-3.5 h-3.5 text-medium-text-muted" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <textarea
          ref={textareaRef}
          className={`w-full resize-none bg-transparent text-sm text-medium-text-primary placeholder:text-medium-text-muted focus:outline-none transition-all ${
            isFocused
              ? 'border-b border-medium-accent-green pb-2'
              : 'border-b border-transparent pb-2'
          }`}
          placeholder={placeholder}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          onFocus={() => setIsFocused(true)}
          rows={1}
        />

        {/* Show button row only when focused */}
        {isFocused && (
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => { setContent(''); setIsFocused(false); }}
              className="px-3 py-1.5 text-xs text-medium-text-muted hover:text-medium-text-primary transition-colors"
            >
              {t('editor.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-opacity ${
                content.trim()
                  ? 'bg-medium-accent-green text-white hover:opacity-90'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? '...' : t('comment.respond')}
            </button>
          </div>
        )}
      </div>
    </form>
  );
};

export default AddCommentForm;
