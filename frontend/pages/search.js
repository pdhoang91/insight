// pages/search.js
import React from 'react';
import { useRouter } from 'next/router';
import { PageLayout } from '../components/layout';
import { SearchResults } from '../components/search';

const SearchPage = () => {
  const router = useRouter();
  const { q } = router.query; // Từ khóa tìm kiếm

  return (
    <PageLayout 
      title={q ? `Kết quả tìm kiếm: "${q}"` : "Tìm kiếm"}
      description={q ? `Tìm thấy các bài viết liên quan đến "${q}"` : "Nhập từ khóa để tìm kiếm bài viết"}
    >
      {q ? (
        <SearchResults query={q} />
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-medium-accent-green/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-medium-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="max-w-md mx-auto">
            <div className="text-sm text-medium-text-muted space-y-2">
              <p>• Tìm kiếm trong tiêu đề và nội dung bài viết</p>
              <p>• Sử dụng dấu ngoặc kép cho cụm từ chính xác</p>
              <p>• Kết quả được sắp xếp theo độ liên quan</p>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default SearchPage;
