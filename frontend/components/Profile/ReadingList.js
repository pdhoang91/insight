// components/ReadingList.js
import React from 'react';
import PostItem from '../../components/Post/PostItem';
import useSWR from 'swr';
import { getReadingList } from '../../services/bookmarkService';

// Define a fetcher function for SWR
const fetcher = () => getReadingList(1, 1000); // page=1, limit=1000 to fetch all bookmarks

const ReadingList = () => {
  // Sử dụng SWR để fetch dữ liệu
  const { data, error } = useSWR('/api/bookmarks', fetcher);

  if (error) {
    return <div>Không thể tải danh sách đọc.</div>;
  }

  if (!data) {
    return <div>Đang tải danh sách đọc...</div>;
  }

  const { posts, totalCount } = data;

  if (posts.length === 0) {
    return <div>Bạn chưa bookmark bài viết nào.</div>;
  }

  return (
    <div>
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
};

export default ReadingList;
