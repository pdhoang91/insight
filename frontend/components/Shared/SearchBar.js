// components/Shared/SearchBar.js
import { useState } from 'react';
import { useRouter } from 'next/router';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
        placeholder="Tìm kiếm..."
      />
      <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <svg
          className="w-5 h-5 text-gray-400 hover:text-blue-500 transition-colors"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
};

export default SearchBar;
