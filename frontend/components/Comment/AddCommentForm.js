
// src/components/Comment/AddCommentForm.js
import React, { useState } from 'react';
import { FaPaperPlane, FaTerminal } from 'react-icons/fa';

const AddCommentForm = ({ onAddComment, parentId = null, placeholder }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultPlaceholder = parentId 
    ? '$ echo "your reply here" >> thread.txt' 
    : '$ vim comment.txt # Write your thoughts...';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim() === '') return;
    setIsSubmitting(true);
    await onAddComment(content, parentId);
    setContent('');
    setIsSubmitting(false);
  };

  return (
    <div className="terminal-window">
      {/* Terminal Header */}
      <div className="terminal-header">
        <FaTerminal className="w-3 h-3 text-matrix-green mr-2" />
        <span>{parentId ? 'reply@thread' : 'comment@new'}</span>
      </div>
      
      <div className="bg-terminal-dark">
        <form onSubmit={handleSubmit} className="relative p-4">
          {/* Terminal Prompt Line */}
          <div className="flex items-center mb-2 text-sm font-mono">
            <span className="text-matrix-green">$</span>
            <span className="text-text-muted ml-2">
              {parentId ? 'Reply to comment:' : 'New comment:'}
            </span>
          </div>

          {/* Terminal Input Area */}
          <div className="relative">
            <textarea
              className="w-full bg-terminal-gray border border-matrix-green/30 rounded text-text-primary placeholder-text-muted font-mono text-sm p-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-matrix-green/50 focus:border-matrix-green transition-all duration-300 hover:border-matrix-green/50"
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
                  : 'bg-matrix-green/20 text-matrix-green hover:bg-matrix-green hover:text-terminal-black hover:shadow-neon-green/30'
              }`}
              disabled={isSubmitting || !content.trim()}
              aria-label="Submit comment"
            >
              <FaPaperPlane className="w-3 h-3" />
            </button>

            {/* Character Counter */}
            <div className="absolute left-3 bottom-3 text-xs font-mono text-text-muted">
              {content.length} chars
            </div>
          </div>
        </form>
      </div>

      {/* Terminal Status Bar */}
      <div className="bg-terminal-light px-4 py-1 border-t border-matrix-green/30">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-text-muted">
            Mode: {parentId ? 'REPLY' : 'COMMENT'} | Status: {isSubmitting ? 'SENDING...' : 'READY'}
          </span>
          <span className="text-matrix-green">
            Ctrl+Enter to submit
          </span>
        </div>
      </div>
    </div>
  );
};

export default AddCommentForm;
