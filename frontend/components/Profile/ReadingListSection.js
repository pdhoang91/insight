// // components/ReadingListSection.js

import React from 'react';
import ReadingList from './ReadingList';

const ReadingListSection = () => {
  return (
    <div className="container mx-auto">
      {/* <h1 className="text-3xl font-bold mb-4">Danh Sách Đọc</h1> */}
      <ReadingList />
    </div>
  );
};

export default ReadingListSection;
