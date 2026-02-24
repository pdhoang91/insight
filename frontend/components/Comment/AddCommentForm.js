// components/Comment/AddCommentForm.js
import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { addComment } from '../../services/commentService';

const AddCommentForm = ({ onAddComment, postId, user, onCommentAdded, parentId = null, placeholder }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultPlaceholder = parentId
    ? 'Viết phản hồi...'
    : 'Viết bình luận...';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim() === '') return;

    if (!user) {
      alert('Vui lòng đăng nhập để bình luận.');
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
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Không thể thêm bình luận. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        className="w-full p-3 pr-12 resize-none bg-white rounded-lg border border-medium-border text-sm text-medium-text-primary placeholder:text-medium-text-muted focus:outline-none focus:ring-2 focus:ring-medium-accent-green/30 focus:border-medium-accent-green transition-all"
        placeholder={placeholder || defaultPlaceholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={parentId ? 2 : 3}
        required
      />
      <button
        type="submit"
        className={`absolute right-3 bottom-3 p-2 rounded-lg transition-colors ${
          isSubmitting
            ? 'text-medium-text-muted cursor-not-allowed'
            : 'text-medium-accent-green hover:bg-medium-accent-green hover:text-white'
        }`}
        disabled={isSubmitting || !content.trim()}
      >
        <FaPaperPlane className="w-3.5 h-3.5" />
      </button>
    </form>
  );
};

export default AddCommentForm;
