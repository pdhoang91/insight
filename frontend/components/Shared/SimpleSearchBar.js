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
          style={{
            width: '100%',
            paddingLeft: '2.5rem',
            paddingRight: '2.5rem',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            borderRadius: '3px',
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          className="placeholder:text-[var(--text-faint)] focus:border-[var(--border-mid)]"
        />

        <div
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          {isLoading ? (
            <div
              style={{
                width: '1rem',
                height: '1rem',
                borderRadius: '50%',
                border: '2px solid var(--border)',
                borderTopColor: 'var(--accent)',
                animation: 'spin 1s linear infinite',
              }}
            />
          ) : (
            <FaSearch style={{ width: '1rem', height: '1rem', color: 'var(--text-faint)' }} />
          )}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-faint)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 0.2s',
            }}
            className="hover:text-[var(--text-muted)]"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SimpleSearchBar;
