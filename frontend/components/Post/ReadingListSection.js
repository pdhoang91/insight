// components/Post/ReadingListSection.js
import React from 'react';
import ReadingList from './ReadingList';

const ReadingListSection = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Danh Sách Đọc</h2>
      <ReadingList />
    </div>
  );
};

export default ReadingListSection;
