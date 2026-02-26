'use client';
// components/Shared/SimpleSearchBar.js
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaTimes } from 'react-icons/fa';

const SimpleSearchBar = ({ onClose, autoFocus = false, className = '', placeholder = 'Search...' }) => {
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

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && onClose?.()}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={isLoading}
          className="w-full pl-10 pr-10 py-2 rounded-full border border-[#e6e6e6] bg-white text-[#292929] placeholder:text-[#b3b3b1] focus:outline-none focus:border-[#292929] transition-colors text-sm"
        />

        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#1a8917]" />
          ) : (
            <FaSearch className="w-4 h-4 text-[#b3b3b1]" />
          )}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b3b3b1] hover:text-[#292929] transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SimpleSearchBar;
