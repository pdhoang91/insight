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
    <div className="page-container flex flex-col lg:flex-row">
       <div className="w-full lg:w-1/12 p-4 sticky top-4 h-fit hidden lg:block bg-gray-800 rounded-lg border border-gray-700">
        <Sidebar />
      </div>
      <div className="w-8/12 p-8">
        {q ? (
          <SearchResults query={q} />
        ) : (
          <p className="text-gray-400 font-mono">// please enter search keyword</p>
        )}
      </div>
      <div className="w-full lg:w-3/12 p-4 border-l border-gray-700 sticky top-4 h-fit hidden xl:block bg-gray-800 rounded-lg">
        <SidebarRight />
      </div>
    </div>
  );
};

export default SearchPage;
