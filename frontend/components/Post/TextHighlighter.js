// components/Post/TextHighlighter.js - Medium 2024 Design
import React, { useState, useEffect, useRef } from 'react';
import { FaHighlighter, FaComment, FaShareAlt, FaCopy, FaTwitter } from 'react-icons/fa';
import Button from '../UI/Button';

const TextHighlighter = ({ children, className = '' }) => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionRect, setSelectionRect] = useState(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [highlights, setHighlights] = useState([]);
  const containerRef = useRef();
  const toolbarRef = useRef();

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Check if selection is within our container
        if (containerRef.current?.contains(range.commonAncestorContainer)) {
          setSelectedText(text);
          setSelectionRect({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
          });
          setShowToolbar(true);
        }
      } else {
        setShowToolbar(false);
        setSelectedText('');
        setSelectionRect(null);
      }
    };

    const handleClickOutside = (event) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        if (!window.getSelection().toString()) {
          setShowToolbar(false);
        }
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
    if (!selectedText || !selectionRect) return;

    const highlight = {
      id: Date.now(),
      text: selectedText,
      timestamp: new Date(),
      rect: selectionRect
    };

    setHighlights(prev => [...prev, highlight]);
    
    // TODO: Save to localStorage or API
    const savedHighlights = JSON.parse(localStorage.getItem('article-highlights') || '[]');
    savedHighlights.push(highlight);
    localStorage.setItem('article-highlights', JSON.stringify(savedHighlights));

    // Clear selection
    window.getSelection().removeAllRanges();
    setShowToolbar(false);
  };

  const handleComment = () => {
    // TODO: Open comment modal with selected text
    console.log('Comment on:', selectedText);
    setShowToolbar(false);
  };

  const handleShare = () => {
    const shareText = `"${selectedText}"`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: 'Shared text',
        text: shareText,
        url: shareUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText} - ${shareUrl}`);
      // TODO: Show toast notification
    }
    setShowToolbar(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText);
    // TODO: Show toast notification
    setShowToolbar(false);
  };

  const handleTweet = () => {
    const tweetText = `"${selectedText}" ${window.location.href}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
    setShowToolbar(false);
  };

  const toolbarStyle = selectionRect ? {
    position: 'absolute',
    top: selectionRect.top - 60,
    left: selectionRect.left + (selectionRect.width / 2),
    transform: 'translateX(-50%)',
    zIndex: 1000
  } : {};

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children}
      
      {/* Selection Toolbar */}
      {showToolbar && selectedText && (
        <div
          ref={toolbarRef}
          style={toolbarStyle}
          className="bg-medium-text-primary text-white rounded-button shadow-floating px-2 py-1 flex items-center space-x-1 animate-fade-in"
        >
          <ToolbarButton
            icon={<FaHighlighter className="w-4 h-4" />}
            onClick={handleHighlight}
            tooltip="Highlight"
          />
          <ToolbarButton
            icon={<FaComment className="w-4 h-4" />}
            onClick={handleComment}
            tooltip="Comment"
          />
          <ToolbarButton
            icon={<FaCopy className="w-4 h-4" />}
            onClick={handleCopy}
            tooltip="Copy"
          />
          <ToolbarButton
            icon={<FaShareAlt className="w-4 h-4" />}
            onClick={handleShare}
            tooltip="Share"
          />
          <ToolbarButton
            icon={<FaTwitter className="w-4 h-4" />}
            onClick={handleTweet}
            tooltip="Tweet"
          />
        </div>
      )}

      {/* Highlights Overlay */}
      <HighlightsOverlay highlights={highlights} />
    </div>
  );
};

// Toolbar Button Component
const ToolbarButton = ({ icon, onClick, tooltip }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 hover:bg-white/20 rounded transition-colors"
      title={tooltip}
      aria-label={tooltip}
    >
      {icon}
    </button>
  );
};

// Highlights Overlay Component
const HighlightsOverlay = ({ highlights }) => {
  if (!highlights.length) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {highlights.map(highlight => (
        <div
          key={highlight.id}
          className="absolute bg-warning/30 pointer-events-none"
          style={{
            top: highlight.rect.top,
            left: highlight.rect.left,
            width: highlight.rect.width,
            height: highlight.rect.height
          }}
        />
      ))}
    </div>
  );
};

// Hook for managing highlights
export const useTextHighlights = (articleId) => {
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    // Load highlights from localStorage or API
    const savedHighlights = JSON.parse(
      localStorage.getItem(`article-highlights-${articleId}`) || '[]'
    );
    setHighlights(savedHighlights);
  }, [articleId]);

  const addHighlight = (highlight) => {
    const newHighlight = {
      ...highlight,
      id: Date.now(),
      articleId,
      timestamp: new Date()
    };

    setHighlights(prev => [...prev, newHighlight]);
    
    // Save to localStorage
    const savedHighlights = JSON.parse(
      localStorage.getItem(`article-highlights-${articleId}`) || '[]'
    );
    savedHighlights.push(newHighlight);
    localStorage.setItem(`article-highlights-${articleId}`, JSON.stringify(savedHighlights));

    return newHighlight;
  };

  const removeHighlight = (highlightId) => {
    setHighlights(prev => prev.filter(h => h.id !== highlightId));
    
    // Update localStorage
    const savedHighlights = JSON.parse(
      localStorage.getItem(`article-highlights-${articleId}`) || '[]'
    );
    const updatedHighlights = savedHighlights.filter(h => h.id !== highlightId);
    localStorage.setItem(`article-highlights-${articleId}`, JSON.stringify(updatedHighlights));
  };

  const clearHighlights = () => {
    setHighlights([]);
    localStorage.removeItem(`article-highlights-${articleId}`);
  };

  return {
    highlights,
    addHighlight,
    removeHighlight,
    clearHighlights
  };
};

// Highlights Manager Component (for sidebar or settings)
export const HighlightsManager = ({ articleId, className = '' }) => {
  const { highlights, removeHighlight, clearHighlights } = useTextHighlights(articleId);

  if (!highlights.length) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-medium-text-muted text-sm">
          No highlights yet. Select text to create highlights.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-medium-text-primary">
          Your Highlights ({highlights.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHighlights}
          className="text-xs"
        >
          Clear all
        </Button>
      </div>
      
      <div className="space-y-3">
        {highlights.map(highlight => (
          <div key={highlight.id} className="p-3 bg-medium-bg-secondary rounded-medium">
            <p className="text-sm text-medium-text-primary mb-2 line-clamp-3">
              "{highlight.text}"
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-medium-text-muted">
                {new Date(highlight.timestamp).toLocaleDateString()}
              </span>
              <button
                onClick={() => removeHighlight(highlight.id)}
                className="text-xs text-medium-text-muted hover:text-error transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TextHighlighter;
