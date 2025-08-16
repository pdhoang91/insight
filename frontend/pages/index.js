// pages/index.js
import React from 'react';
import { useInfinitePosts } from '../hooks/useInfinitePosts';
import BlogSidebar from '../components/Shared/BlogSidebar';
import PostListTimeline from '../components/Post/PostListTimeline';

const Home = () => {
  const {
    posts,
    isLoading,
    isError,
    setSize,
    isReachingEnd,
  } = useInfinitePosts();

  return (
    <>
      {/* Page Content Container */}
      <section className="min-h-screen bg-terminal-black">
        {/* Main Content Area */}
        <div className="pb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              {/* Primary Content - Posts Feed */}
              <section className="lg:col-span-3" role="main" aria-label="Danh sách bài viết">
                <h1 className="sr-only">Trang chủ Insight - Bài viết công nghệ</h1>
                <PostListTimeline
                  posts={posts}
                  isLoading={isLoading}
                  isError={isError}
                  setSize={setSize}
                  isReachingEnd={isReachingEnd}
                />
              </section>

              {/* Complementary Content - Sidebar */}
              <aside 
                className="lg:col-span-1" 
                role="complementary" 
                aria-label="Thông tin bổ sung và điều hướng"
              >
                <div className="sticky top-12">
                  <BlogSidebar />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
