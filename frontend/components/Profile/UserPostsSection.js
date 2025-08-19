// components/Profile/UserPostsSection.js
import React from 'react';
import InfiniteScrollWrapper from '../Utils/InfiniteScrollWrapper';
import UserPostList from './UserPostList';
import PostItemProfile from '../Post/PostItemProfile';

const UserPostsSection = ({ posts, isLoading, isError, setSize, isReachingEnd, isOwner }) => {
  const fetchMore = () => {
    if (!isReachingEnd && !isLoading) {
      setSize(prevSize => prevSize + 1);
    }
  };

  const renderItem = (post) => {
    if (!post || !post.id) {

      return null; // Hoặc render một component khác để xử lý
    }
    return <PostItemProfile key={post.id} post={post} isOwner={isOwner} />;
  };

  if (isError) return <div className="text-red-500">Không thể tải bài viết</div>;
  if (isLoading && posts.length === 0) return <div>Đang tải...</div>;

  return (
    <InfiniteScrollWrapper
      items={posts}
      renderItem={renderItem}
      fetchMore={fetchMore}
      hasMore={!isReachingEnd}
      loader={<div className="text-center my-4">Đang tải thêm bài viết...</div>}
      endMessage={<p className="text-center mt-4">Đã tải hết bài viết.</p>}
      className="space-y-4"
    />
  );
};

export default UserPostsSection;
