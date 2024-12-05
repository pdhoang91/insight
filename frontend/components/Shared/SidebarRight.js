// components/Shared/SidebarRight.js
// export default SidebarRight;
import React from 'react';
import RecommendedPostSection from '../Post/RecommendedPostSection';
import RecommendedTopicsSection from '../Post/RecommendedTopicsSection';
import ReadingListSection from '../Post/ReadingListSection';

const SidebarRight = () => {
  return (
    <div className="space-y-6">

      <RecommendedPostSection />
      <RecommendedTopicsSection />
      <div>
        <ReadingListSection />
      </div>
    </div>
  );
};

export default SidebarRight;
