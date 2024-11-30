// pages/[username].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import usePublicProfile from '../hooks/usePublicProfile';
import useProfile from '../hooks/useProfile';
import useInfiniteUserPosts from '../hooks/useInfiniteUserPosts';
import useInfiniteBookmarks from '../hooks/useInfiniteBookmarks'; // Import hook mới
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileUpdateForm from '../components/Profile/ProfileUpdateForm';
import UserPostsSection from '../components/Profile/UserPostsSection';
import ReadingListSection from '../components/Profile/ReadingListSection';
import FolowPeopleSestion from '../components/Profile/FolowPeopleSestion';
import Sidebar from '../components/Shared/Sidebar';
import { motion } from 'framer-motion';

const UserProfilePage = () => {
  const router = useRouter();
  const { username } = router.query;
  const { user: loggedUser, loading: loadingUser, mutate: mutateUser } = useUser();

  const [activeTab, setActiveTab] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Xác định xem người dùng hiện tại có phải là chủ sở hữu trang hay không
  useEffect(() => {
    if (loggedUser && username) {
      setIsOwner(loggedUser.username === username);
    } else {
      setIsOwner(false);
    }
  }, [loggedUser, username]);

  // Đặt activeTab dựa trên việc người dùng có phải là chủ sở hữu hay không
  useEffect(() => {
    if (isOwner) {
      setActiveTab('YourPosts');
    } else {
      setActiveTab('UserPosts');
    }
  }, [isOwner]);

  const {
    profile: publicProfile,
    posts: publicPosts,
    folows: folows,
    bookmarks: publicBookmarks,
    loading: loadingPublic,
    error: publicError,
  } = usePublicProfile(username);

  const {
    profile: ownerProfile,
    posts: ownerPosts,
    readingList: ownerReadingList,
    loading: loadingOwner,
    error: ownerError,
    updateProfile,
  } = useProfile();

  // Sử dụng useInfinitePosts hook
  const {
    posts: infinitePosts,
    isLoading: isLoadingPosts,
    isError: isErrorPosts,
    setSize: setSizePosts,
    isReachingEnd: isReachingEndPosts,
  } = useInfiniteUserPosts(activeTab, loggedUser);

  // Sử dụng useInfiniteBookmarks hook
  const {
    bookmarks,
    isLoading: isLoadingBookmarks,
    isError: isErrorBookmarks,
    setSize: setSizeBookmarks,
    isReachingEnd: isReachingEndBookmarks,
  } = useInfiniteBookmarks();

  const handleUpdateProfile = async (profileData) => {
    try {
      await updateProfile(profileData);
      setShowPopup(false);
      if (mutateUser) {
        await mutateUser();
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Cập nhật hồ sơ thất bại. Vui lòng thử lại.");
    }
  };

  const profile = isOwner ? ownerProfile : publicProfile;
  const posts = isOwner ? ownerPosts : publicPosts;
  // Đã tích hợp infinitePosts vào posts
  const combinedPosts = isOwner ? infinitePosts : publicPosts;
  const bookmarksData = isOwner ? ownerReadingList : publicBookmarks;
  const loading = isOwner ? loadingOwner : loadingPublic;
  const error = isOwner ? ownerError : publicError;

  if (loading || loadingUser) return <div className="container mx-auto">Loading...</div>;
  if (error) return <div className="container mx-auto text-red-500">{error}</div>;

  // Hàm xử lý khi nhấp vào tab
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="lg:w-1/12 p-4 h-screen sticky top-0 overflow-auto hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:w-10/12 p-4">
        <ProfileHeader
          avatarUrl={profile?.avatar_url}
          name={profile?.name}
          phone={profile?.phone}
          dob={profile?.dob}
          onUpdate={isOwner ? () => setShowPopup(true) : null}
        />

        <div className="flex space-x-4 my-4 border-b">
          {/* Tab Đầu Tiên: Luôn Hiển Thị */}
          <button
            onClick={() => handleTabClick(isOwner ? 'YourPosts' : 'UserPosts')}
            className={`p-2 transition-colors ${
              activeTab === (isOwner ? 'YourPosts' : 'UserPosts')
                ? 'border-b-2 border-gray-200 text-blue-500 border-blue-500'
                : 'text-gray-600 hover:text-blue-400'
            }`}
          >
            {isOwner ? 'Your Posts' : "User's Posts"}
          </button>

          {/* Tab Thứ Hai: Chỉ Hiển Thị Khi isOwner */}
          {isOwner && (
            <button
              onClick={() => handleTabClick('YourReading')}
              className={`p-2 transition-colors ${
                activeTab === 'YourReading'
                  ? 'border-b-2 border-gray-200 text-blue-500 border-blue-500'
                  : 'text-gray-600 hover:text-blue-400'
              }`}
            >
              Your Reading
            </button>
          )}

          {/* Tab Thứ 3: Luôn Hiển Thị */}
          <button
            onClick={() => handleTabClick(isOwner ? 'Your Folow' : 'Folow')}
            className={`p-2 transition-colors ${
              activeTab === (isOwner ? 'Your Folow' : 'Folow')
                ? 'border-b-2 border-gray-200 text-blue-500 border-blue-500'
                : 'text-gray-600 hover:text-blue-400'
            }`}
          >
            {isOwner ? 'Your Folow' : "Folow"}
          </button>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {/* Hiển Thị Nội Dung Tùy Thuộc Vào activeTab */}
          {activeTab === 'YourPosts' && isOwner && (
            <UserPostsSection
              posts={infinitePosts}
              isLoading={isLoadingPosts}
              isError={isErrorPosts}
              setSize={setSizePosts}
              isReachingEnd={isReachingEndPosts}
              isOwner={isOwner}
            />
          )}
          {activeTab === 'UserPosts' && !isOwner && (
            <UserPostsSection
              posts={publicPosts}
              isLoading={loading}
              isError={error}
              setSize={setSizePosts}
              isReachingEnd={isReachingEndPosts}
              isOwner={isOwner}
            />
          )}
          {activeTab === 'YourReading' && isOwner && (
            <ReadingListSection
              bookmarks={bookmarks}
              isLoading={isLoadingBookmarks}
              isError={isErrorBookmarks}
              setSize={setSizeBookmarks}
              isReachingEnd={isReachingEndBookmarks}
            />
          )}
          {activeTab === 'Your Folow' && (
            <FolowPeopleSestion peoples={folows}/>
          )}
          {activeTab === 'Folow' && (
            <FolowPeopleSestion peoples={folows}/>
          )}
        </motion.div>

        {isOwner && showPopup && (
          <ProfileUpdateForm
            userProfile={profile}
            onUpdate={handleUpdateProfile}
            onCancel={() => setShowPopup(false)}
          />
        )}
      </div>

      <div className="lg:w-1/12 p-8 hidden lg:block">
        {/* <ProfileRightSidebar currentUser={loggedUser} viewedUsername={viewedUsername} /> */}
      </div>
    </div>
  );
};

export default UserProfilePage;
