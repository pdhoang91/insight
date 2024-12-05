// components/Post/ReadingList.js
import React from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import PostItemSmall from './PostItemSmall';
import { getReadingList } from '../../services/bookmarkService';
import {ViewMoreButton} from '../../components/Utils/ViewMoreButton';
import {useUser} from '../../context/UserContext';

const fetchReadingList = async () => {
  // Adjust parameters as needed
  const data = await getReadingList(1, 3);
  return data;
};

const ReadingList = () => {
  const { user } = useUser();
  const router = useRouter();
  const { data, error } = useSWR('/api/bookmarks', fetchReadingList);

  // Early return if there's no user
  if (!user) {
    return <div className="text-gray-600">Đăng nhập để xem danh sách đọc.</div>;
  }

  if (error) {
    return <div className="text-red-500">Không thể tải danh sách đọc.</div>;
  }

  if (!data) {
    return <div>Đang tải danh sách đọc...</div>;
  }

  const { username, posts, totalCount } = data;

  if (!posts || posts.length === 0) {
    return <div className="text-gray-600">Bạn chưa bookmark bài viết nào.</div>;
  }

  const handleSeeMore = () => {
    router.push(`/@${username}`);
  };

  return (
    <div>
      {posts.map((post) => (
        <PostItemSmall key={post.id} post={post} />
      ))}
      {totalCount > posts.length && (
        <ViewMoreButton onClick={handleSeeMore} />
      )}
    </div>
  );
};

export default ReadingList;

