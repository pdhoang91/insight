// pages/search.js
import React from 'react';
import BlogSidebar from '../components/Shared/BlogSidebar';
import SearchResults from '../components/Search/SearchResults';
import { useRouter } from 'next/router';

const SearchPage = () => {
  const router = useRouter();
  const { q } = router.query; // Từ khóa tìm kiếm

  return (
    <div className="min-h-screen bg-terminal-black">
      {/* Main Content */}
      <div className="pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Search Header */}
              {q && (
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-text-primary mb-2">
                    Kết quả tìm kiếm
                  </h1>
                  <p className="text-text-secondary text-sm">
                    Hiển thị kết quả cho "{q}"
                  </p>
                </div>
              )}
              
              {q ? (
                <SearchResults query={q} />
              ) : (
                <div className="text-center py-12 md:py-16">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-text-primary mb-2">
                    Tìm kiếm bài viết
                  </h2>
                  <p className="text-text-secondary mb-6">
                    Nhập từ khóa để tìm kiếm bài viết
                  </p>
                  <div className="max-w-md mx-auto">
                    <div className="text-sm text-text-muted space-y-2">
                      <p>• Tìm kiếm trong tiêu đề và nội dung bài viết</p>
                      <p>• Sử dụng dấu ngoặc kép cho cụm từ chính xác</p>
                      <p>• Kết quả được sắp xếp theo độ liên quan</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-12">
                <BlogSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
