// components/Profile/ReadingListSection.js
import React from 'react';
import InfiniteScrollWrapper from '../Utils/InfiniteScrollWrapper';
import PostItem from '../../components/Post/PostItem';

const ReadingListSection = ({ bookmarks, isLoading, isError, setSize, isReachingEnd }) => {
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
    return <PostItem key={post.id} post={post} />;
  };

  if (isError) return <div className="text-red-500">Failed to load reading list</div>;
  if (isLoading && bookmarks.length === 0) return <div>Loading...</div>;

  return (
    <InfiniteScrollWrapper
      items={bookmarks}
      renderItem={renderItem}
      fetchMore={fetchMore}
      hasMore={!isReachingEnd}
      loader={<div className="text-center my-4">Loading more bookmarks...</div>}
      endMessage={<p className="text-center mt-4">Đã tải hết danh sách đọc.</p>}
      className="space-y-4"
    />
  );
};

export default ReadingListSection;
