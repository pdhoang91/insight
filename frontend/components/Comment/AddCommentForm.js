
// src/components/Comment/AddCommentForm.js
import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const AddCommentForm = ({ onAddComment, parentId = null, placeholder }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultPlaceholder = parentId 
    ? 'Write your reply...' 
    : 'Write your comment...';

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
        className="w-full border border-matrix-green/30 rounded-lg text-text-primary placeholder-text-muted p-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-matrix-green/50 focus:border-matrix-green transition-all duration-300 hover:border-matrix-green/50"
        placeholder={placeholder || defaultPlaceholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={parentId ? 2 : 3}
        required
        aria-label={parentId ? 'Reply to comment' : 'Add a comment'}
      />
      
      {/* Submit Button */}
      <button
        type="submit"
        className={`absolute right-3 bottom-3 p-2 rounded transition-all duration-300 ${
          isSubmitting 
            ? 'bg-terminal-light text-text-muted cursor-not-allowed' 
            : 'bg-matrix-green/20 text-matrix-green hover:bg-matrix-green hover:text-terminal-black'
        }`}
        disabled={isSubmitting || !content.trim()}
        aria-label="Submit comment"
      >
        <FaPaperPlane className="w-3 h-3" />
      </button>
    </form>
  );
};

export default AddCommentForm;
