// components/Shared/SidebarRight.js
// import React from 'react';
// import RecommendedTopicsSection from '../Post/RecommendedTopicsSection';
// import CategoriesSection from '../Category/CategoriesSection';
// import ReadingListSection from '../Post/ReadingListSection';

// const SidebarRight = () => {
//   return (
//     <div className="space-y-6">
//       {/* Recommended Topics */}
//       <RecommendedTopicsSection />

//       {/* Categories - Ẩn trên màn hình nhỏ */}
//       <div>
//         <CategoriesSection />
//       </div>

//       {/* Reading List - Ẩn trên màn hình nhỏ */}
//       <div>
//         <ReadingListSection />
//       </div>
//     </div>
//   );
// };

// export default SidebarRight;
import React from 'react';
import RecommendedTopicsSection from '../Post/RecommendedTopicsSection';
import CategoriesSection from '../Category/CategoriesSection';
import ReadingListSection from '../Post/ReadingListSection';
import styles from './SidebarRight.module.css'; // Import CSS Modules

const SidebarRight = () => {
  return (
    <div className="space-y-6">
      {/* Recommended Topics */}
      <RecommendedTopicsSection />

      {/* Categories - Ẩn khi màn hình < 950px */}
      <div className={styles.categoriesSection}>
        <CategoriesSection />
      </div>

      {/* Reading List - Ẩn khi màn hình < 950px */}
      <div className={styles.readingListSection}>
        <ReadingListSection />
      </div>
    </div>
  );
};

export default SidebarRight;
