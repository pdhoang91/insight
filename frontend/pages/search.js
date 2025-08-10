// pages/search.js
import React from 'react';
import BlogSidebar from '../components/Shared/BlogSidebar';
import SearchResults from '../components/Search/SearchResults';
import { useRouter } from 'next/router';

const SearchPage = () => {
  const router = useRouter();
  const { q } = router.query; // Từ khóa tìm kiếm

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <main className="bg-gray-800 rounded-xl p-6 md:p-8">
              <header className="mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-700">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-50 mb-3 md:mb-4 line-height-tight">
                  Search Results
                </h1>
                {q && (
                  <p className="text-gray-300 font-mono text-sm md:text-base">
                    showing results for "{q}"
                  </p>
                )}
                {!q && (
                  <p className="text-gray-300 font-mono text-sm md:text-base">
                    enter a search query to begin
                  </p>
                )}
              </header>
              
              {q ? (
                <SearchResults query={q} />
              ) : (
                <div className="text-center py-12 md:py-16">
                  <div className="text-gray-400 font-mono text-base md:text-lg">
                    Start typing to search for articles and topics
                  </div>
                  <div className="mt-4 text-xs md:text-sm text-gray-500">
                    Search across titles, content, and categories
                  </div>
                </div>
              )}
            </main>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BlogSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
