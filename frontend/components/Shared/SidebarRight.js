// components/Shared/SidebarRight.js
// export default SidebarRight;
import React from 'react';
import RecommendedPostSection from '../Post/RecommendedPostSection';
import RecommendedTopicsSection from '../Post/RecommendedTopicsSection';
import CategoriesSection from '../Category/CategoriesSection';
import ReadingListSection from '../Post/ReadingListSection';
import styles from './SidebarRight.module.css'; // Import CSS Modules

const SidebarRight = () => {
  return (
    <div className="space-y-6">

      <RecommendedPostSection />
      
      {/* Recommended Topics */}
      <RecommendedTopicsSection />

      {/* Reading List - Ẩn khi màn hình < 950px */}
      <div className={styles.readingListSection}>
        <ReadingListSection />
      </div>
    </div>
  );
};

export default SidebarRight;
