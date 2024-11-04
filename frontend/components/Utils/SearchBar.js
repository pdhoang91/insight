/* components/SearchBar.js */
import { useState } from 'react';
import { useRouter } from 'next/router';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?search=${query}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex mb-4">
      <input
        type="text"
        placeholder="Search posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-grow p-2 border rounded-l"
      />
      <button type="submit" className="p-2 rounded-r">
        Search
      </button>
    </form>
  );
};

export default SearchBar;
