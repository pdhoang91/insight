// components/Shared/SimpleSearchBar.js - Fully theme-based design
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const SimpleSearchBar = ({ onClose, autoFocus = false, className = '', placeholder = 'Tìm kiếm bài viết...' }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
    <form onSubmit={handleSearch} className={combineClasses(themeClasses.utils.relative, className)}>
      <div className={themeClasses.utils.relative}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={combineClasses(
            themeClasses.utils.fullWidth,
            'pl-10 pr-10 py-2 rounded-full border',
            themeClasses.animations.smooth,
            themeClasses.focus.ring,
            themeClasses.bg.elevated,
            themeClasses.border.primary,
            themeClasses.text.primary,
            'placeholder-medium-text-muted'
          )}
          disabled={isLoading}
        />
        
        {/* Search Icon */}
        <div className={combineClasses(
          themeClasses.utils.absolute,
          'left-3 top-1/2 transform -translate-y-1/2'
        )}>
          {isLoading ? (
            <div className={combineClasses(
              themeClasses.loading.spinner,
              themeClasses.icons.sm
            )} />
          ) : (
            <FaSearch className={combineClasses(
              themeClasses.icons.sm, 
              themeClasses.text.muted
            )} />
          )}
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={combineClasses(
              themeClasses.utils.absolute,
              'right-3 top-1/2 transform -translate-y-1/2',
              themeClasses.text.muted,
              themeClasses.text.accentHover,
              themeClasses.animations.smooth,
              themeClasses.focus.visible
            )}
            aria-label="Đóng tìm kiếm"
          >
            <FaTimes className={themeClasses.icons.sm} />
          </button>
        )}
      </div>
    </form>
  );
};

export default SimpleSearchBar;
