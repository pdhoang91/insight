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
    <div className="flex flex-col lg:flex-row min-h-screen">
       <div className="w-full lg:w-1/12 p-4 sticky top-4 h-fit hidden lg:block">
        <Sidebar />
      </div>
      <div className="w-8/12 p-4">
        {q ? (
          <SearchResults query={q} />
        ) : (
          <p className="text-gray-600">Vui lòng nhập từ khóa tìm kiếm.</p>
        )}
      </div>
      <div className="w-full lg:w-3/12 p-4 border-l sticky top-4 h-fit hidden xl:block">
        <SidebarRight />
      </div>
    </div>
  );
};

export default SearchPage;
