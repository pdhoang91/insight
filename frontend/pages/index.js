// pages/index.js
import React, { useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useInfinitePosts } from '../hooks/useInfinitePosts';
import { useTabSwitcher } from '../hooks/useTabSwitcher';
import HeroSection from '../components/Shared/HeroSection';
import BlogSidebar from '../components/Shared/BlogSidebar';
import PostList from '../components/Post/PostList';
import TabSwitcher from '../components/Shared/HomeTabSwitcher';
import CategoryTagExplainer from '../components/Shared/CategoryTagExplainer';

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
      {/* Hero Section */}
      <HeroSection />
      
      {/* Main Content with Sidebar Layout */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Category vs Tags Explainer */}
              <CategoryTagExplainer />

              {/* Section Header */}
              <div className="mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Latest Tech Stories
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Discover in-depth tutorials, insights, and experiences from our community of developers and tech enthusiasts
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="mb-8">
                <TabSwitcher activeTab={activeTab} toggleTab={toggleTab} user={user} />
              </div>

              {/* Enhanced Post List */}
              <PostList
                posts={posts}
                isLoading={isLoading}
                isError={isError}
                setSize={setSize}
                isReachingEnd={isReachingEnd}
                variant="enhanced"
              />
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
