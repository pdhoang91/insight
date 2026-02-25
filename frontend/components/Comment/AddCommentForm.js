// components/Comment/AddCommentForm.js — Medium-style: no avatar, just textarea
import React, { useState, useRef } from 'react';
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
    <form onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        className={`w-full resize-none bg-transparent text-sm text-[#242424] placeholder:text-[#b3b3b1] focus:outline-none transition-all pb-2 ${
          isFocused ? 'border-b border-[#242424]' : 'border-b border-medium-border'
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

      {isFocused && (
        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={() => { setContent(''); setIsFocused(false); }}
            className="text-xs text-[#6b6b6b] hover:text-[#242424] transition-colors"
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
    </form>
  );
};

export default AddCommentForm;
