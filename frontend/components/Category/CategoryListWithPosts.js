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
      return null;
    }
    return <PostItem key={post.id} post={post} variant="compact" />;
  };

  if (isError) return <div className="text-red-600 font-mono">// Failed to load posts</div>;
  if (isLoading && posts.length === 0) return <div className="text-gray-600 font-mono">Loading posts...</div>;

  return (
    <InfiniteScrollWrapper
      items={posts}
      renderItem={renderItem}
      fetchMore={fetchMore}
      hasMore={!isReachingEnd}
      loader={<div className="text-gray-600 font-mono text-center py-4">Loading more posts...</div>}
      endMessage={<p className="text-center text-gray-500 font-mono py-4">// End of posts</p>}
      className="space-y-4"
    />
  );
};

export default CategoryListWithPosts;
