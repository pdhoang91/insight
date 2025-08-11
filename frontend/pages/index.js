// pages/index.js
import React from 'react';
import { useInfinitePosts } from '../hooks/useInfinitePosts';
import BlogSidebar from '../components/Shared/BlogSidebar';
import PostList from '../components/Post/PostList';

const Home = () => {
  const {
    posts,
    isLoading,
    isError,
    setSize,
    isReachingEnd,
  } = useInfinitePosts();

  return (
    <div className="min-h-screen bg-terminal-black">
      {/* Main Content */}
      <div className="pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Posts Area */}
            <div className="lg:col-span-3">
              <PostList
                posts={posts}
                isLoading={isLoading}
                isError={isError}
                setSize={setSize}
                isReachingEnd={isReachingEnd}
                variant="timeline"
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-12">
                <BlogSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
