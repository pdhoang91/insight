// pages/Home.js
import React, { useEffect, useRef } from 'react';
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

   // Refs cho các container cuộn
   const mainContentRef = useRef(null);
   const sidebarRightRef = useRef(null);

  useEffect(() => {
    console.log("Current Tab:", activeTab);
  }, [activeTab, posts, totalCount, isLoading, isError]);

   // Hàm đồng bộ hóa cuộn
   const syncScroll = (sourceRef, targetRef) => {
    if (!sourceRef.current || !targetRef.current) return;
  
    const source = sourceRef.current;
    const target = targetRef.current;
  
    // Lắng nghe sự kiện cuộn trên nguồn
    source.addEventListener('scroll', () => {
      const scrollTop = source.scrollTop;
      const maxScrollSource = source.scrollHeight - source.clientHeight;
      const maxScrollTarget = target.scrollHeight - target.clientHeight;
  
      // Nếu nguồn không thể cuộn thêm (đã ở cuối), không làm gì cả
      if (scrollTop >= maxScrollSource) {
        return;
      }
  
      // Tính tỷ lệ cuộn
      const scrollRatio = scrollTop / maxScrollSource;
  
      // Tính vị trí cuộn mới cho mục tiêu
      const targetScrollTop = scrollRatio * maxScrollTarget;
  
      // Nếu mục tiêu có thể cuộn đến vị trí mới, cập nhật
      if (targetScrollTop <= maxScrollTarget && targetScrollTop >= 0) {
        target.scrollTop = targetScrollTop;
      }
    });
  };
  

  useEffect(() => {
    syncScroll(mainContentRef, sidebarRightRef);
    syncScroll(sidebarRightRef, mainContentRef);
  }, [posts]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar Left */}
      <aside className="w-full lg:w-1/12 p-4 sticky top-4 h-fit hidden lg:block">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="w-full lg:w-8/12 p-4" ref={mainContentRef}>
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
      <aside className="w-full lg:w-3/12 p-4 border-l sticky top-4 h-fit hidden xl:block" ref={sidebarRightRef}>
        <SidebarRight />
      </aside>
    </div>
  );
};

export default Home;
