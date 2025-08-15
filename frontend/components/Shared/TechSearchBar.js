// components/Shared/TechSearchBar.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  FaSearch, 
  FaCode, 
  FaBolt, 
  FaTimes, 
  FaHistory, 
  FaTerminal,
  FaKeyboard,
  FaFilter,
  FaChevronRight,
  FaClock
} from 'react-icons/fa';
import { 
  SiVim, 
  SiPython, 
  SiJavascript, 
  SiReact, 
  SiDocker,
  SiTypescript,
  SiNodedotjs,
  SiNextdotjs,
  SiMongodb,
  SiGraphql,
  SiAmazonaws,
  SiKubernetes,
  SiGit
} from 'react-icons/si';
import { useTagSearch } from '../../hooks/useTags';
import { useCategories } from '../../hooks/useCategories';

const TechSearchBar = ({ 
  placeholder = "Search the dev universe...", 
  className = "", 
  onSearch,
  variant = "default" // default, compact, mobile
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState([]);
  const searchRef = useRef();
  const inputRef = useRef();

  // API hooks for suggestions
  const { tags } = useTagSearch(query, 6);
  const { categories } = useCategories(1, 6);

  // Enhanced tech search suggestions with better icons and categories
  const popularSearches = [
    { 
      name: 'React', 
      icon: SiReact, 
      color: 'text-blue-400', 
      category: 'Frontend',
      description: 'UI Library'
    },
    { 
      name: 'Python', 
      icon: SiPython, 
      color: 'text-yellow-400', 
      category: 'Language',
      description: 'Programming'
    },
    { 
      name: 'JavaScript', 
      icon: SiJavascript, 
      color: 'text-yellow-300', 
      category: 'Language',
      description: 'Web Dev'
    },
    { 
      name: 'Docker', 
      icon: SiDocker, 
      color: 'text-blue-500', 
      category: 'DevOps',
      description: 'Containers'
    },
    { 
      name: 'TypeScript', 
      icon: SiTypescript, 
      color: 'text-blue-600', 
      category: 'Language',
      description: 'Type Safety'
    },
    { 
      name: 'Node.js', 
      icon: SiNodedotjs, 
      color: 'text-green-500', 
      category: 'Backend',
      description: 'Runtime'
    },
    { 
      name: 'Next.js', 
      icon: SiNextdotjs, 
      color: 'text-gray-100', 
      category: 'Framework',
      description: 'React Meta'
    },
    { 
      name: 'Kubernetes', 
      icon: SiKubernetes, 
      color: 'text-blue-400', 
      category: 'DevOps',
      description: 'Orchestration'
    }
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    const savedHistory = localStorage.getItem('searchHistory');
    
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        // Silent fail for localStorage parsing errors
      }
    }
    
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        // Silent fail for localStorage parsing errors
      }
    }
  }, []);

  // Typing animation effect
  useEffect(() => {
    if (query.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 300);
      return () => clearTimeout(timer);
    }
    setSelectedIndex(-1);
  }, [query]);

  // Save search to recent searches and history
  const saveRecentSearch = useCallback((searchQuery) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    const timestamp = new Date().toISOString();
    
    // Update recent searches
    const newRecentSearches = [
      trimmedQuery,
      ...recentSearches.filter(item => item !== trimmedQuery)
    ].slice(0, 6); // Keep only last 6

    // Update search history with metadata
    const newHistoryItem = {
      query: trimmedQuery,
      timestamp,
      count: searchHistory.filter(item => item.query === trimmedQuery).length + 1
    };
    
    const newSearchHistory = [
      newHistoryItem,
      ...searchHistory.filter(item => item.query !== trimmedQuery)
    ].slice(0, 20); // Keep last 20

    setRecentSearches(newRecentSearches);
    setSearchHistory(newSearchHistory);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    localStorage.setItem('searchHistory', JSON.stringify(newSearchHistory));
  }, [recentSearches, searchHistory]);

  // Enhanced search handler
  const handleSearch = useCallback((searchQuery = query) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    saveRecentSearch(trimmedQuery);
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
    
    // Call onSearch callback if provided (for closing mobile menu)
    if (onSearch) {
      onSearch(trimmedQuery);
    }
  }, [query, saveRecentSearch, router, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIndex >= 0) {
      const allSuggestions = [
        ...recentSearches,
        ...tags.map(tag => tag.name),
        ...categories.map(cat => cat.name),
        ...popularSearches.map(search => search.name)
      ];
      if (allSuggestions[selectedIndex]) {
        handleSearch(allSuggestions[selectedIndex]);
        return;
      }
    }
    handleSearch();
  };

  const handleSuggestionClick = (suggestion) => {
    handleSearch(suggestion);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    setSearchHistory([]);
    localStorage.removeItem('recentSearches');
    localStorage.removeItem('searchHistory');
  };

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;

    const allSuggestions = [
      ...recentSearches,
      ...tags.map(tag => tag.name),
      ...categories.map(cat => cat.name),
      ...popularSearches.map(search => search.name)
    ];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        );
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Enter':
        if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
          e.preventDefault();
          handleSearch(allSuggestions[selectedIndex]);
        }
        break;
    }
  }, [isOpen, recentSearches, tags, categories, popularSearches, selectedIndex, handleSearch]);

  // Global keyboard shortcut support
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Focus search with "/" key (like GitHub, Discord, etc.)
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const hasResults = tags.length > 0 || categories.length > 0 || recentSearches.length > 0;
  const allSuggestions = [
    ...recentSearches,
    ...tags.map(tag => tag.name),
    ...categories.map(cat => cat.name),
    ...popularSearches.map(search => search.name)
  ];

  // Responsive classes based on variant
  const getContainerClasses = () => {
    const base = "relative group";
    switch (variant) {
      case "compact":
        return `${base} w-full max-w-md`;
      case "mobile":
        return `${base} w-full`;
      default:
        return `${base} w-full max-w-2xl mx-auto`;
    }
  };

  const getInputClasses = () => {
    const base = `
      w-full pl-12 pr-12 py-3 
      bg-terminal-dark/80 backdrop-blur-sm
      border border-matrix-green/20 
      rounded-xl
      text-text-primary placeholder-text-muted
      font-mono text-sm
      transition-all duration-300 ease-out
      focus:outline-none
      focus:border-matrix-green/60
      focus:shadow-[0_0_0_3px_rgba(74,222,128,0.1),0_0_20px_rgba(74,222,128,0.2)]
      hover:border-matrix-green/40
      hover:shadow-[0_0_15px_rgba(74,222,128,0.1)]
      sm:text-sm
      search-input-mobile
    `;
    
    if (variant === "compact") {
      return `${base} py-2 text-xs sm:text-xs`;
    }
    
    return base;
  };

  const getDropdownClasses = () => {
    const base = `
      absolute top-full left-0 right-0 mt-3 
      bg-terminal-dark/95 backdrop-blur-md 
      border border-matrix-green/30 rounded-2xl 
      shadow-2xl shadow-matrix-green/10 z-50 
      overflow-hidden animate-slide-up
    `;
    
    // Mobile-specific classes
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return `${base} search-dropdown-mobile`;
    }
    
    return base;
  };

  return (
    <div ref={searchRef} className={getContainerClasses()}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Modern Search Input Container */}
        <div className="relative">
          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsOpen(true);
              setIsFocused(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={getInputClasses()}
            autoComplete="off"
            spellCheck="false"
          />
          
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <FaSearch 
              className={`w-4 h-4 transition-all duration-300 ${
                isFocused || isOpen 
                  ? 'text-matrix-green scale-110' 
                  : 'text-text-muted'
              }`} 
            />
          </div>

          {/* Right Side Icons */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-matrix-green rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-matrix-green rounded-full animate-pulse delay-100"></div>
                <div className="w-1 h-1 bg-matrix-green rounded-full animate-pulse delay-200"></div>
              </div>
            )}
            
            {/* Clear Button */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 text-text-muted hover:text-hacker-red transition-colors rounded-full hover:bg-terminal-gray/50"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            )}
            
            {/* Keyboard Shortcut Hint */}
            {!isFocused && !query && (
              <div className="hidden sm:flex items-center space-x-1 px-2 py-1 bg-terminal-gray/30 rounded text-xs text-text-muted font-mono">
                <FaKeyboard className="w-3 h-3" />
                <span>/</span>
              </div>
            )}
          </div>

          {/* Focus Ring Animation */}
          {isFocused && (
            <div className="absolute inset-0 rounded-xl border-2 border-matrix-green/30 animate-pulse pointer-events-none"></div>
          )}
        </div>
      </form>

      {/* Modern Dropdown with Enhanced Design */}
      {isOpen && (
        <div className={getDropdownClasses()}>
          
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-4 border-b border-matrix-green/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-terminal-gray/50 rounded-lg">
                      <FaClock className="w-3 h-3 text-matrix-green" />
                    </div>
                    <span className="text-sm font-mono font-medium text-matrix-green">recent_searches</span>
                    <span className="text-xs text-text-muted bg-terminal-gray/30 px-2 py-0.5 rounded-full">
                      {recentSearches.length}
                    </span>
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-text-muted hover:text-hacker-red transition-colors px-2 py-1 rounded hover:bg-terminal-gray/30"
                  >
                    Clear
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className={`
                        flex items-center space-x-3 px-3 py-2.5 text-left
                        bg-terminal-gray/30 hover:bg-terminal-gray/60
                        border border-transparent hover:border-matrix-green/30
                        rounded-lg transition-all duration-200
                        text-sm text-text-secondary hover:text-text-primary
                        group search-suggestion-mobile
                        ${selectedIndex === index ? 'bg-matrix-green/10 border-matrix-green/50 text-matrix-green' : ''}
                      `}
                    >
                      <FaHistory className="w-3 h-3 text-text-muted group-hover:text-matrix-green transition-colors" />
                      <span className="truncate">{search}</span>
                      <FaChevronRight className="w-2 h-2 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tag Suggestions */}
            {tags.length > 0 && (
              <div className="p-4 border-b border-matrix-green/10">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-1.5 bg-hacker-yellow/10 rounded-lg">
                    <FaBolt className="w-3 h-3 text-hacker-yellow animate-pulse" />
                  </div>
                  <span className="text-sm font-mono font-medium text-hacker-yellow">tags.filter()</span>
                  <span className="text-xs text-text-muted bg-terminal-gray/30 px-2 py-0.5 rounded-full">
                    {tags.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {tags.map((tag, tagIndex) => {
                    const currentIndex = recentSearches.length + tagIndex;
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleSuggestionClick(tag.name)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2.5 text-left
                          hover:bg-terminal-gray/50 rounded-lg transition-all duration-200
                          text-sm group
                          ${selectedIndex === currentIndex ? 'bg-matrix-green/10 border border-matrix-green/50 text-matrix-green' : 'text-text-secondary hover:text-text-primary'}
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-hacker-yellow/60 rounded-full group-hover:bg-hacker-yellow transition-colors"></div>
                          <span>{tag.name}</span>
                        </div>
                        <span className="text-xs text-text-muted bg-terminal-gray/30 px-2 py-0.5 rounded-full">
                          {tag.count || 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category Suggestions */}
            {categories.length > 0 && (
              <div className="p-4 border-b border-matrix-green/10">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-1.5 bg-matrix-blue/10 rounded-lg">
                    <FaCode className="w-3 h-3 text-matrix-blue" />
                  </div>
                  <span className="text-sm font-mono font-medium text-matrix-blue">categories</span>
                  <span className="text-xs text-text-muted bg-terminal-gray/30 px-2 py-0.5 rounded-full">
                    {categories.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {categories.map((category, catIndex) => {
                    const currentIndex = recentSearches.length + tags.length + catIndex;
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleSuggestionClick(category.name)}
                        className={`
                          w-full flex items-center space-x-3 px-3 py-2.5 text-left
                          hover:bg-terminal-gray/50 rounded-lg transition-all duration-200
                          text-sm group
                          ${selectedIndex === currentIndex ? 'bg-matrix-green/10 border border-matrix-green/50 text-matrix-green' : 'text-text-secondary hover:text-text-primary'}
                        `}
                      >
                        <div className="w-2 h-2 bg-matrix-blue/60 rounded-full group-hover:bg-matrix-blue transition-colors"></div>
                        <span>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Popular Tech Searches */}
            {!query && (
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-1.5 bg-matrix-green/10 rounded-lg">
                    <FaTerminal className="w-3 h-3 text-matrix-green" />
                  </div>
                  <span className="text-sm font-mono font-medium text-matrix-green">trending.tech</span>
                  <span className="text-xs text-text-muted bg-terminal-gray/30 px-2 py-0.5 rounded-full">
                    {popularSearches.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {popularSearches.map((search, popIndex) => {
                    const IconComponent = search.icon;
                    const currentIndex = recentSearches.length + tags.length + categories.length + popIndex;
                    return (
                      <button
                        key={popIndex}
                        onClick={() => handleSuggestionClick(search.name)}
                        className={`
                          flex items-center justify-between p-3 text-left
                          bg-terminal-gray/20 hover:bg-terminal-gray/50
                          border border-transparent hover:border-matrix-green/30
                          rounded-lg transition-all duration-200 group
                          ${selectedIndex === currentIndex ? 'bg-matrix-green/10 border-matrix-green/50' : ''}
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`w-4 h-4 ${search.color} group-hover:scale-110 transition-transform`} />
                          <div>
                            <div className="text-sm font-medium text-text-primary group-hover:text-matrix-green transition-colors">
                              {search.name}
                            </div>
                            <div className="text-xs text-text-muted font-mono">
                              {search.category} • {search.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Results State */}
            {query && !hasResults && (
              <div className="p-8 text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 mx-auto bg-terminal-gray/30 rounded-full flex items-center justify-center mb-3">
                    <FaSearch className="w-5 h-5 text-text-muted" />
                  </div>
                  <div className="text-sm text-text-muted font-mono mb-2">
                    <span className="text-hacker-red">// 404:</span> No suggestions found
                  </div>
                  <p className="text-xs text-text-muted font-mono">
                    Press <kbd className="px-2 py-1 bg-terminal-gray/50 rounded text-matrix-green">Enter</kbd> to search for 
                    <span className="text-matrix-green font-semibold"> "{query}"</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Status Bar */}
          <div className="bg-terminal-gray/50 backdrop-blur-sm px-4 py-2 border-t border-matrix-green/20">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-4">
                <span className="text-text-muted">
                  {hasResults ? (
                    <span>
                      <span className="text-matrix-green">{tags.length + categories.length + recentSearches.length}</span> results
                    </span>
                  ) : (
                    'No results'
                  )}
                </span>
                {selectedIndex >= 0 && (
                  <span className="text-matrix-green">
                    [{selectedIndex + 1}/{allSuggestions.length}] selected
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <span><kbd className="text-matrix-green">↑↓</kbd> navigate</span>
                <span><kbd className="text-matrix-green">ESC</kbd> close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechSearchBar; 