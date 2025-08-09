// components/Shared/TechSearchBar.js
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaSearch, FaCode, FaBolt, FaTimes, FaHistory } from 'react-icons/fa';
import { useTagSearch } from '../../hooks/useTags';
import { useCategories } from '../../hooks/useCategories';

const TechSearchBar = ({ placeholder = "Search tutorials, guides, technologies...", className = "" }) => {
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
          className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white"
        />
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
        >
          <FaSearch className="w-4 h-4" />
        </button>
      </form>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FaHistory className="w-3 h-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Recent Searches</span>
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tag Suggestions */}
          {tags.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-2 mb-3">
                <FaBolt className="w-3 h-3 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Tags</span>
              </div>
              <div className="space-y-1">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleSuggestionClick(tag.name)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors"
                  >
                    <span className="text-orange-500">#</span>{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Suggestions */}
          {categories.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-2 mb-3">
                <FaCode className="w-3 h-3 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Categories</span>
              </div>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleSuggestionClick(category.name)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors"
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
                <FaSearch className="w-3 h-3 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Popular Technologies</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors"
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
              <p className="text-sm text-gray-500">
                No suggestions found. Press Enter to search for "{query}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TechSearchBar; 