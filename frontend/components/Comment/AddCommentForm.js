
// src/components/Comment/AddCommentForm.js
import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const AddCommentForm = ({ onAddComment, parentId = null }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        className="form-input pr-12 resize-none transition-all duration-200"
        placeholder={parentId ? 'Viết câu trả lời...' : 'Viết bình luận...'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        required
        aria-label={parentId ? 'Reply to comment' : 'Add a comment'}
      ></textarea>
      <button
        type="submit"
        className={`absolute right-4 bottom-4 rounded-full p-2 transition-colors ${
          isSubmitting 
            ? 'bg-elevated text-muted cursor-not-allowed' 
            : 'btn-primary hover:shadow-md'
        }`}
        disabled={isSubmitting}
        aria-label="Submit comment"
      >
        <FaPaperPlane />
      </button>
    </form>
  );
};

export default AddCommentForm;
