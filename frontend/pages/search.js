// pages/search.js
import React from 'react';
import { useRouter } from 'next/router';
import { HomeLayout } from '../components/Layout/Layout';
import { SearchResults } from '../components/search';
import PersonalBlogSidebar from '../components/Shared/PersonalBlogSidebar';
import { themeClasses } from '../utils/themeClasses';

const SearchPage = () => {
  const router = useRouter();
  const { q } = router.query; // Từ khóa tìm kiếm

  return (
    <HomeLayout sidebar={<PersonalBlogSidebar />}>
      {q ? (
        <SearchResults query={q} />
      ) : (
        <div className="text-center py-12">
          <header className="mb-8">
            <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-medium-text-primary mb-3 lg:mb-4 text-balance">
              Tìm kiếm
            </h1>
            <p className="text-base sm:text-lg text-medium-text-secondary max-w-2xl mx-auto text-pretty">
              Khám phá các bài viết thông qua tìm kiếm
            </p>
          </header>
          
          <div className="w-16 h-16 mx-auto mb-6 bg-medium-accent-green/10 rounded-full flex items-center justify-center">
            <svg className={`${themeClasses.icons.xl} text-medium-accent-green`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </HomeLayout>
  );
};

export default SearchPage;
