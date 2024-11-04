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
    <div className="flex">
       <div className="w-1/12 p-4 h-screen sticky top-0 overflow-auto">
        <Sidebar />
      </div>
      <div className="w-8/12 p-4">
        {q ? (
          <SearchResults query={q} />
        ) : (
          <p className="text-gray-600">Vui lòng nhập từ khóa tìm kiếm.</p>
        )}
      </div>
      <div className="w-3/12 p-8 border-l border-gray-300">
        <SidebarRight />
      </div>
    </div>
  );
};

export default SearchPage;
