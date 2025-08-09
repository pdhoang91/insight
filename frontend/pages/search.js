// pages/search.js
import React from 'react';
import Sidebar from '../components/Shared/Sidebar';
import SidebarRight from '../components/Shared/SidebarRight';
import SearchResults from '../components/Search/SearchResults';
import { useRouter } from 'next/router';

const SearchPage = () => {
  const router = useRouter();
  const { q } = router.query; // Từ khóa tìm kiếm

  return (
    <div className="standard-page">
      <div className="standard-page-content">
        <div className="standard-content-area">
          <header className="standard-page-header">
            <h1 className="standard-page-title">Search</h1>
            <p className="standard-page-subtitle tech-comment">find articles and topics</p>
          </header>
          
          {q ? (
            <SearchResults query={q} />
          ) : (
            <div className="text-center text-content-secondary font-mono">
              Enter a search query to begin
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
