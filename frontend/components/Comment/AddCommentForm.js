
// src/components/Comment/AddCommentForm.js
import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { addComment } from '../../services/commentService';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const AddCommentForm = ({ onAddComment, postId, user, onCommentAdded, parentId = null, placeholder }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultPlaceholder = parentId 
    ? 'Viết phản hồi của bạn...' 
    : 'Viết bình luận của bạn...';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim() === '') return;
    
    if (!user) {
      alert('Vui lòng đăng nhập để bình luận.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Handle different prop patterns
      if (onAddComment) {
        // Used for replies in CommentItem
        await onAddComment(content, parentId);
      } else if (postId && onCommentAdded) {
        // Used for main comments in CommentSection and PostItem
        await addComment(postId, content);
        onCommentAdded(); // Refresh comments
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
    <form onSubmit={handleSubmit} className={themeClasses.utils.relative}>
      <textarea
        className={combineClasses(
          'w-full p-3 pr-12 resize-none',
          themeClasses.bg.card,
          'border',
          themeClasses.border.primary,
          themeClasses.effects.rounded,
          themeClasses.text.primary,
          'placeholder:text-medium-text-muted',
          'focus:outline-none focus:ring-2 focus:ring-medium-accent-green/50 focus:border-medium-accent-green',
          themeClasses.animations.smooth,
          themeClasses.effects.shadow,
          'focus:shadow-card',
          themeClasses.text.body
        )}
        placeholder={placeholder || defaultPlaceholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={parentId ? 2 : 3}
        required
        aria-label={parentId ? 'Trả lời bình luận' : 'Thêm bình luận'}
      />
      
      {/* Submit Button */}
      <button
        type="submit"
        className={combineClasses(
          themeClasses.utils.absolute,
          'right-3 bottom-3 p-2',
          themeClasses.effects.rounded,
          themeClasses.animations.smooth,
          isSubmitting 
            ? combineClasses(themeClasses.bg.primary, themeClasses.text.muted, 'cursor-not-allowed')
            : combineClasses(
                'bg-medium-accent-green/20',
                themeClasses.text.accent,
                'hover:bg-medium-accent-green hover:text-white hover:scale-105'
              )
        )}
        disabled={isSubmitting || !content.trim()}
        aria-label="Gửi bình luận"
      >
        <FaPaperPlane className={themeClasses.icons.xs} />
      </button>
    </form>
  );
};

export default AddCommentForm;
