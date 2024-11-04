// components/Category/CategoryListWithPosts.js
import React from 'react';
import PostItem from '../Post/PostItem';
import InfiniteScrollWrapper from '../Utils/InfiniteScrollWrapper';

const CategoryListWithPosts = ({ posts, isLoading, isError, setSize, isReachingEnd }) => {
  const fetchMore = () => {
    if (!isReachingEnd && !isLoading) {
      setSize(prevSize => prevSize + 1);
    }
  };

  const renderItem = (post) => {
    if (!post || !post.id) {
      console.warn('Post without id:', post);
      return null; // Hoặc render một component khác để xử lý
    }
    return <PostItem key={post.id} post={post} />;
  };

  if (isError) return <div className="text-red-500">Failed to load posts</div>;
  if (isLoading && posts.length === 0) return <div>Loading...</div>;

  return (
    <InfiniteScrollWrapper
      items={posts}
      renderItem={renderItem}
      fetchMore={fetchMore}
      hasMore={!isReachingEnd}
      loader={<div>Loading...</div>}
      endMessage={<p className="text-center"></p>}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    />
  );
};

export default CategoryListWithPosts;
