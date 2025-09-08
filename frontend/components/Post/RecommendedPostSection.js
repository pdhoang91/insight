// components/Post/RecommendedPostSection.js
import React from 'react';
import RecommendedPost from './RecommendedPost';

const RecommendedPostSection = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Nổi bật</h2>
      <RecommendedPost />
    </div>
  );
};

export default RecommendedPostSection;
