// components/Reading/TextHighlighter.js
import React, { useState, useEffect, useRef } from 'react';
import { FaHighlighter, FaTwitter, FaComment } from 'react-icons/fa';

const TextHighlighter = ({ onHighlight, onComment, onShare }) => {
  const [selection, setSelection] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const toolbarRef = useRef(null);

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      
      if (sel.rangeCount > 0 && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const selectedText = sel.toString().trim();
        
        if (selectedText.length > 0) {
          const rect = range.getBoundingClientRect();
          
          setSelection({
            text: selectedText,
            range: range.cloneRange()
          });
          
          // Position toolbar above selection
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
          });
          
          setIsVisible(true);
        }
      } else {
        setIsVisible(false);
        setSelection(null);
      }
    };

    const handleClickOutside = (event) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        setIsVisible(false);
        setSelection(null);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleHighlight = () => {
    if (selection && onHighlight) {
      onHighlight(selection.text, selection.range);
    }
    setIsVisible(false);
    window.getSelection().removeAllRanges();
  };

  const handleComment = () => {
    if (selection && onComment) {
      onComment(selection.text, selection.range);
    }
    setIsVisible(false);
    window.getSelection().removeAllRanges();
  };

  const handleShare = () => {
    if (selection && onShare) {
      onShare(selection.text);
    } else if (selection) {
      // Default share behavior
      const shareText = `"${selection.text}" - ${window.location.href}`;
      
      if (navigator.share) {
        navigator.share({
          text: shareText,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText);
      }
    }
    setIsVisible(false);
    window.getSelection().removeAllRanges();
  };

  if (!isVisible || !selection) {
    return null;
  }

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 transform -translate-x-1/2 -translate-y-full"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      {/* Toolbar */}
      <div className="bg-medium-text-primary rounded-lg shadow-lg px-2 py-1 flex items-center space-x-1">
        {/* Highlight Button */}
        <button
          onClick={handleHighlight}
          className="p-2 text-white hover:bg-white/20 rounded transition-colors"
          title="Highlight text"
        >
          <FaHighlighter className="w-4 h-4" />
        </button>

        {/* Comment Button */}
        <button
          onClick={handleComment}
          className="p-2 text-white hover:bg-white/20 rounded transition-colors"
          title="Add comment"
        >
          <FaComment className="w-4 h-4" />
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-2 text-white hover:bg-white/20 rounded transition-colors"
          title="Share quote"
        >
          <FaTwitter className="w-4 h-4" />
        </button>
      </div>

      {/* Arrow pointing down */}
      <div className="flex justify-center">
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-medium-text-primary"></div>
      </div>
    </div>
  );
};

export default TextHighlighter;
