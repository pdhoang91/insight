// pages/index.js - Medium 2024 Design
import React from 'react';
import { useInfinitePosts } from '../hooks/useInfinitePosts';
import { HomeLayout } from '../components/Layout/Layout';
import PostList from '../components/Post/PostList';
import PersonalBlogSidebar from '../components/Shared/PersonalBlogSidebar';
const Home = () => {
  const {
    posts,
    isLoading,
    isError,
    setSize,
    isReachingEnd,
  } = useInfinitePosts();

  // Debug log
  console.log('Home - Posts:', posts, 'Loading:', isLoading, 'Error:', isError);

  return (
    <HomeLayout sidebar={<PersonalBlogSidebar />}>      
      {/* Posts List */}
      <PostList
        posts={posts}
        isLoading={isLoading}
        isError={isError}
        setSize={setSize}
        isReachingEnd={isReachingEnd}
      />
    </HomeLayout>
  );
};

export default Home;
