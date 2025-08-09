// pages/index.js
import React, { useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useInfinitePosts } from '../hooks/useInfinitePosts';
import { useTabSwitcher } from '../hooks/useTabSwitcher';
import HeroSection from '../components/Shared/HeroSection';
import BlogSidebar from '../components/Shared/BlogSidebar';
import PostList from '../components/Post/PostList';
import TabSwitcher from '../components/Shared/HomeTabSwitcher';

const Home = () => {
  const { activeTab, toggleTab } = useTabSwitcher();
  const { user } = useUser();
  
  const {
    posts,
    isLoading,
    isError,
    setSize,
    isReachingEnd,
  } = useInfinitePosts(activeTab);

  return (
    <div className="min-h-screen">
      
      {/* Main Content with Sidebar Layout */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Section Header */}
              <div className="mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Latest Stories
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Discover fresh perspectives and insights from our community of writers
                </p>
              </div>

              {/* Post List - Using list variant instead of grid for traditional blog layout */}
              <div className="space-y-6">
                <PostList
                  posts={posts}
                  isLoading={isLoading}
                  isError={isError}
                  setSize={setSize}
                  isReachingEnd={isReachingEnd}
                  variant="list"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
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
