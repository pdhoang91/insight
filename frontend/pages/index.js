// pages/Home.js
import React, { useEffect } from 'react';
import { useUser } from '../context/UserContext';
import PostList from '../components/Post/PostList';
import Sidebar from '../components/Shared/Sidebar';
import SidebarRight from '../components/Shared/SidebarRight';
import { useInfinitePosts } from '../hooks/useInfinitePosts';
import { useTabSwitcher } from '../hooks/useTabSwitcher';
import TabSwitcher from '../components/Shared/TabSwitcher';

const Home = () => {
  const { activeTab, toggleTab } = useTabSwitcher();
  const { user } = useUser();

  const {
    posts,
    totalCount,
    isLoading,
    isError,
    setSize,
    isReachingEnd,
  } = useInfinitePosts(activeTab, user);

  useEffect(() => {
    console.log("Current Tab:", activeTab);
  }, [activeTab, posts, totalCount, isLoading, isError]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar Left */}
      <aside className="w-full lg:w-1/12 p-4 sticky top-4 h-fit hidden lg:block">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="w-full lg:w-8/12 p-4">
        {/* Tab Switcher */}
        <TabSwitcher activeTab={activeTab} toggleTab={toggleTab} user={user} />

        {/* Post List */}
        <PostList
          posts={posts}
          isLoading={isLoading}
          isError={isError}
          setSize={setSize}
          isReachingEnd={isReachingEnd}
        />
      </main>

      {/* Sidebar Right */}
      <aside className="w-full lg:w-3/12 p-4 sticky top-4 h-fit hidden xl:block">
        <SidebarRight />
      </aside>
    </div>
  );
};

export default Home;
