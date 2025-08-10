// components/Shared/TechSearchBar.js
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaSearch, FaCode, FaBolt, FaTimes, FaHistory, FaTerminal } from 'react-icons/fa';
import { SiVim, SiPython, SiJavascript, SiReact, SiDocker } from 'react-icons/si';
import { useTagSearch } from '../../hooks/useTags';
import { useCategories } from '../../hooks/useCategories';

const TechSearchBar = ({ placeholder = "$ grep -r 'search' --include='*.tech'", className = "" }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const searchRef = useRef();

  // API hooks for suggestions
  const { tags } = useTagSearch(query, 5);
  const { categories } = useCategories(1, 5);

  // Enhanced tech search suggestions with icons
  const popularSearches = [
    { name: 'React', icon: SiReact, color: 'text-matrix-cyan' },
    { name: 'Python', icon: SiPython, color: 'text-hacker-yellow' },
    { name: 'JavaScript', icon: SiJavascript, color: 'text-hacker-yellow' },
    { name: 'Docker', icon: SiDocker, color: 'text-matrix-blue' },
    { name: 'TypeScript', icon: SiJavascript, color: 'text-matrix-blue' },
    { name: 'Node.js', icon: FaCode, color: 'text-matrix-green' },
    { name: 'Next.js', icon: SiReact, color: 'text-text-primary' },
    { name: 'MongoDB', icon: FaCode, color: 'text-hacker-orange' },
    { name: 'GraphQL', icon: FaCode, color: 'text-hacker-purple' },
    { name: 'AWS', icon: FaCode, color: 'text-hacker-orange' }
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

  // Typing animation effect
  useEffect(() => {
    if (query.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 500);
      return () => clearTimeout(timer);
    }
  }, [query]);

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
        {/* Enhanced Terminal Input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-3 border border-matrix-green/30 rounded-lg focus:ring-2 focus:ring-matrix-green/50 focus:border-matrix-green transition-colors duration-300 text-sm bg-terminal-dark text-text-primary placeholder-text-muted hover:border-matrix-green/50"
          />
          
          {/* Terminal Prompt Icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-matrix-green">
            <FaTerminal className="w-4 h-4" />
          </div>
          
          {/* Search Button with Animation */}
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-matrix-green transition-colors duration-300"
          >
            <FaSearch className={`w-4 h-4 ${isTyping ? 'animate-pulse' : ''}`} />
          </button>
          
          {/* Terminal Cursor Effect */}
          {isOpen && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-2 h-4 bg-matrix-green animate-terminal-blink"></div>
          )}
        </div>
      </form>

      {/* Enhanced Search Dropdown - Terminal Window Style */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-terminal-dark border border-matrix-green rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Terminal Window Header */}
          <div className="bg-terminal-gray px-4 py-2 border-b border-matrix-green/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-mono text-matrix-green">
                <span className="flex space-x-1">
                  <span className="w-2 h-2 bg-hacker-red rounded-full"></span>
                  <span className="w-2 h-2 bg-hacker-yellow rounded-full"></span>
                  <span className="w-2 h-2 bg-matrix-green rounded-full"></span>
                </span>
                <span>search@terminal</span>
              </div>
              <div className="text-text-muted text-xs">
                {query && `"${query}"`}
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-4 border-b border-matrix-green/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FaHistory className="w-3 h-3 text-matrix-cyan" />
                    <span className="text-sm font-mono font-medium text-matrix-green">recent_searches[]</span>
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-text-muted hover:text-hacker-red transition-colors font-mono hover:animate-glitch"
                  >
                    rm -rf *
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="px-3 py-1 bg-terminal-gray text-text-secondary text-sm rounded border border-matrix-green/30 hover:bg-terminal-light hover:text-matrix-green hover:border-matrix-green transition-colors duration-300"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tag Suggestions */}
            {tags.length > 0 && (
              <div className="p-4 border-b border-matrix-green/20">
                <div className="flex items-center space-x-2 mb-3">
                  <FaBolt className="w-3 h-3 text-hacker-yellow animate-pulse" />
                  <span className="text-sm font-mono font-medium text-matrix-green">tags[]</span>
                </div>
                <div className="space-y-1">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleSuggestionClick(tag.name)}
                      className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-terminal-gray hover:text-hacker-yellow rounded transition-all duration-300 font-mono border border-transparent hover:border-hacker-yellow/30"
                    >
                      <span className="text-hacker-yellow">#</span>
                      <span className="ml-1">{tag.name}</span>
                      <span className="ml-2 text-text-muted text-xs">({tag.count || 0})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Suggestions */}
            {categories.length > 0 && (
              <div className="p-4 border-b border-matrix-green/20">
                <div className="flex items-center space-x-2 mb-3">
                  <FaCode className="w-3 h-3 text-matrix-cyan" />
                  <span className="text-sm font-mono font-medium text-matrix-green">categories[]</span>
                </div>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleSuggestionClick(category.name)}
                      className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-terminal-gray hover:text-matrix-cyan rounded transition-all duration-300 font-mono border border-transparent hover:border-matrix-cyan/30"
                    >
                      <span className="text-matrix-cyan">./</span>
                      <span className="ml-1">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches with Icons */}
            {!query && (
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <FaSearch className="w-3 h-3 text-matrix-green animate-neon-pulse" />
                  <span className="text-sm font-mono font-medium text-matrix-green">popular_tech[]</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {popularSearches.map((search, index) => {
                    const IconComponent = search.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(search.name)}
                        className="flex items-center space-x-2 text-left px-3 py-2 text-sm text-text-secondary hover:bg-terminal-gray hover:text-matrix-green rounded transition-all duration-300 font-mono border border-transparent hover:border-matrix-green/30 group"
                      >
                        <IconComponent className={`w-3 h-3 ${search.color} group-hover:animate-pulse`} />
                        <span>{search.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Results */}
            {query && !hasResults && (
              <div className="p-4 text-center">
                <div className="text-sm text-text-muted font-mono mb-2">
                  <span className="text-hacker-red">404:</span> No suggestions found
                </div>
                <p className="text-xs text-text-muted font-mono">
                  // Press Enter to search for "<span className="text-matrix-green">{query}</span>"
                </p>
              </div>
            )}
          </div>

          {/* Terminal Status Bar */}
          <div className="bg-terminal-gray px-4 py-1 border-t border-matrix-green/30">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-text-muted">
                {hasResults ? `${tags.length + categories.length} results` : 'No results'}
              </span>
              <span className="text-matrix-green">
                ESC to close
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechSearchBar; 