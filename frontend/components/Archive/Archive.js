// components/Archive/Archive.js
import React, { useState } from 'react';
import Link from 'next/link';

const Archive = ({ posts = [], className = '', limit = 12 }) => {
  const [isShowingAll, setIsShowingAll] = useState(false);

  const createArchiveList = (posts) => {
    const grouped = {};
    posts.forEach(post => {
      const date = new Date(post.created_at);
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${month.toString().padStart(2, '0')}`;
      if (!grouped[key]) {
        grouped[key] = { year, month, posts: [] };
      }
      grouped[key].posts.push(post);
    });

    return Object.keys(grouped)
      .sort((a, b) => b.localeCompare(a))
      .map(key => ({
        key,
        year: grouped[key].year,
        month: grouped[key].month,
        count: grouped[key].posts.length,
      }));
  };

  const archiveList = createArchiveList(posts);
  const displayList = isShowingAll ? archiveList : archiveList.slice(0, limit);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  if (!posts.length) {
    return (
      <div className={className}>
        <p className="text-[13px] text-[#b3b3b1]">No posts yet.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-1">
        {displayList.map(({ key, year, month, count }) => (
          <Link
            key={key}
            href={`/archive/${year}/${month + 1}`}
            className="block py-1 text-[13px] text-[#757575] hover:text-[#292929] transition-colors"
          >
            {monthNames[month]} {year}
            <span className="ml-1.5 text-[#b3b3b1]">({count})</span>
          </Link>
        ))}

        {archiveList.length > limit && (
          <div className="pt-2">
            <button
              onClick={() => setIsShowingAll(!isShowingAll)}
              className="text-[12px] text-[#1a8917] hover:underline"
            >
              {isShowingAll ? '← Show recent only' : `Show all (${archiveList.length}) →`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Archive;
