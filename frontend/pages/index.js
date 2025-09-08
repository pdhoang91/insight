// pages/index.js - Medium 2024 Design
import React from 'react';
import { useInfinitePosts } from '../hooks/useInfinitePosts';
import { HomeLayout } from '../components/Layout/Layout';
import PostList from '../components/post/PostList';
import PersonalBlogSidebar from '../components/Shared/PersonalBlogSidebar';

const Home = () => {
  const {
    posts,
    isLoading,
    isError,
    setSize,
    isReachingEnd,
  } = useInfinitePosts();

  return (
    <HomeLayout sidebar={<PersonalBlogSidebar />}>
      <div className="space-y-6 lg:space-y-8">
        {/* Header Section */}
        <header className="text-center lg:text-left">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-medium-text-primary mb-3 lg:mb-4">
            Latest Stories
          </h1>
          <p className="text-base sm:text-lg text-medium-text-secondary max-w-2xl mx-auto lg:mx-0">
            Discover insights, tutorials, and thoughts on technology, programming, and software development.
          </p>
        </header>
        
        {/* Posts List */}
        <PostList
          posts={posts}
          isLoading={isLoading}
          isError={isError}
          setSize={setSize}
          isReachingEnd={isReachingEnd}
        />
      </div>
    </HomeLayout>
  );
};

export default Home;
