// components/Shared/SimpleSearchBar.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useThemeClasses } from '../../hooks/useThemeClasses';

const SimpleSearchBar = ({ onClose, autoFocus = false, className = '', placeholder = 'Tìm kiếm bài viết...' }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { classes, combineClasses } = useThemeClasses();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      setIsLoading(true);
      try {
        await router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        if (onClose) onClose();
      } catch (error) {
        console.error('Search navigation failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={combineClasses(classes.input, 'pl-10 pr-10 py-2 rounded-full')}
        />
        
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <FaSearch className={`w-4 h-4 ${classes.text.muted}`} />
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${classes.text.muted} ${classes.text.accentHover} transition-colors`}
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SimpleSearchBar;
