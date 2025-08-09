// components/Shared/TechSearchBar.js
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaSearch, FaCode, FaBolt, FaTimes, FaHistory, FaTerminal } from 'react-icons/fa';
import { useTagSearch } from '../../hooks/useTags';
import { useCategories } from '../../hooks/useCategories';

const TechSearchBar = ({ placeholder = "$ search technologies...", className = "" }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef();

  // API hooks for suggestions
  const { tags } = useTagSearch(query, 5);
  const { categories } = useCategories(1, 5);

  // Popular tech search suggestions
  const popularSearches = [
    'React', 'Next.js', 'TypeScript', 'JavaScript', 'Python',
    'Node.js', 'Docker', 'AWS', 'MongoDB', 'GraphQL'
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Save search to recent searches
  const saveRecentSearch = (searchQuery) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    const newRecentSearches = [
      trimmedQuery,
      ...recentSearches.filter(item => item !== trimmedQuery)
    ].slice(0, 5); // Keep only last 5

    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
  };

  const handleSearch = (searchQuery = query) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    saveRecentSearch(trimmedQuery);
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSuggestionClick = (suggestion) => {
    handleSearch(suggestion);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasResults = tags.length > 0 || categories.length > 0 || recentSearches.length > 0;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-10 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all text-sm bg-gray-800 text-white placeholder-gray-400 font-mono"
        />
        <FaTerminal className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 w-4 h-4" />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors"
        >
          <FaSearch className="w-4 h-4" />
        </button>
      </form>

      {/* Search Dropdown - Terminal Style */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FaHistory className="w-3 h-3 text-gray-400" />
                  <span className="text-sm font-mono font-medium text-gray-300">recent_searches</span>
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-400 hover:text-gray-300 transition-colors font-mono"
                >
                  clear()
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full hover:bg-gray-600 hover:text-green-400 transition-colors font-mono"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tag Suggestions */}
          {tags.length > 0 && (
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <FaBolt className="w-3 h-3 text-yellow-400" />
                <span className="text-sm font-mono font-medium text-gray-300">tags[]</span>
              </div>
              <div className="space-y-1">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleSuggestionClick(tag.name)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-yellow-400 rounded transition-colors font-mono"
                  >
                    <span className="text-yellow-400">#</span>{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Suggestions */}
          {categories.length > 0 && (
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <FaCode className="w-3 h-3 text-blue-400" />
                <span className="text-sm font-mono font-medium text-gray-300">categories[]</span>
              </div>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleSuggestionClick(category.name)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-blue-400 rounded transition-colors font-mono"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {!query && (
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FaSearch className="w-3 h-3 text-green-400" />
                <span className="text-sm font-mono font-medium text-gray-300">popular_tech[]</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-green-400 rounded transition-colors font-mono"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {query && !hasResults && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-400 font-mono">
                // No suggestions found. Press Enter to search for "{query}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TechSearchBar; 