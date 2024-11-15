// components/Post/PostList.js
import React from 'react';
import PostItem from './PostItem';
import InfiniteScroll from 'react-infinite-scroll-component';

const PostList = ({ posts, isLoading, isError, setSize, isReachingEnd }) => {

  if (!posts) {
    return <div>Đang tải bài viết...</div>;
  }

  const fetchMore = () => {
    if (!isReachingEnd && !isLoading) {
      setSize((prevSize) => prevSize + 1);
    }
  };

  //if (isError) return <div className="text-red-500">Không thể tải bài viết</div>;
  //if (isLoading && posts.length === 0) return <div>Đang tải...</div>;

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchMore}
      hasMore={!isReachingEnd}
      loader={<div className="text-center py-4">Đang tải thêm bài viết...</div>}
      endMessage={<p className="text-center py-4 text-gray-500"></p>}
    >
      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default PostList;
