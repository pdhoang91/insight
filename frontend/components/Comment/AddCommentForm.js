
// src/components/Comment/AddCommentForm.js
import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const AddCommentForm = ({ onAddComment, parentId = null, placeholder }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultPlaceholder = parentId 
    ? 'Viết phản hồi của bạn...' 
    : 'Viết bình luận của bạn...';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim() === '') return;
    setIsSubmitting(true);
    await onAddComment(content, parentId);
    setContent('');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        className="w-full bg-medium-bg-secondary rounded-lg text-medium-text-primary placeholder-medium-text-muted p-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-medium-accent-green/50 transition-all duration-300 shadow-sm focus:shadow-md"
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
        className={`absolute right-3 bottom-3 p-2 rounded transition-all duration-300 ${
          isSubmitting 
            ? 'bg-medium-bg-primary text-medium-text-muted cursor-not-allowed' 
            : 'bg-medium-accent-green/20 text-medium-accent-green hover:bg-medium-accent-green hover:text-white'
        }`}
        disabled={isSubmitting || !content.trim()}
        aria-label="Gửi bình luận"
      >
        <FaPaperPlane className="w-3 h-3" />
      </button>
    </form>
  );
};

export default AddCommentForm;
