// pages/search.js
import React from 'react';
import { useRouter } from 'next/router';
import { HomeLayout } from '../components/Layout/Layout';
import { SearchResults } from '../components/Search';
import PersonalBlogSidebar from '../components/Sidebar/PersonalBlogSidebar';
import { themeClasses } from '../utils/themeClasses';

// Search Header Component - Following home page pattern
const SearchHeader = () => (
  <div className={`text-center ${themeClasses.spacing.section}`}>
    <header className={themeClasses.spacing.gap}>
      <h1 className={`${themeClasses.typography.h1} mb-3 text-balance`}>
        Tìm kiếm
      </h1>
      <p className={`${themeClasses.typography.bodyLarge} text-medium-text-secondary max-w-2xl mx-auto text-pretty`}>
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
);

const SearchPage = () => {
  const router = useRouter();
  const { q } = router.query; // Từ khóa tìm kiếm

  return (
    <HomeLayout sidebar={<PersonalBlogSidebar />}>
      {q ? (
        <SearchResults query={q} />
      ) : (
        <SearchHeader />
      )}
    </HomeLayout>
  );
};

export default SearchPage;
