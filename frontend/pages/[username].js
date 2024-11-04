// // pages/[username].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import usePublicProfile from '../hooks/usePublicProfile';
import useProfile from '../hooks/useProfile';
import useTabNavigation from '../hooks/useTabNavigation';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileUpdateForm from '../components/Profile/ProfileUpdateForm';
import UserPostsSection from '../components/Profile/UserPostsSection';
import ReadingListSection from '../components/Profile/ReadingListSection';
import Sidebar from '../components/Shared/Sidebar';
import ProfileRightSidebar from '../components/Shared/ProfileRightSidebar';
import { motion } from 'framer-motion';
import { mutate as globalMutate } from 'swr'; // Import mutate từ SWR nếu cần

const UserProfilePage = () => {
  const router = useRouter();
  const { username } = router.query;
  const { user: loggedUser, loading: loadingUser, mutate: mutateUser } = useUser(); // Import mutate từ useUser
  const { activeTab, navigateToTab, setActiveTab } = useTabNavigation(); // Thêm setActiveTab nếu có hỗ trợ trong hook
  const [isOwner, setIsOwner] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (loggedUser && username) {
      //const trimmedUsername = username.startsWith('@') ? username.slice(1) : username;
      setIsOwner(loggedUser.username === username);
    } else {
      setIsOwner(false);
    }
  }, [loggedUser, username]);

  useEffect(() => {
    if (isOwner) {
      navigateToTab('YourPosts');
    } else {
      navigateToTab('UserPosts');
    }
  }, [isOwner]);

  const {
    profile: publicProfile,
    posts: publicPosts,
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

  const handleUpdateProfile = async (profileData) => {
    try {
      await updateProfile(profileData);
      setShowPopup(false);
      // Sử dụng mutate để cập nhật dữ liệu người dùng trong cache
      if (mutateUser) {
        await mutateUser(); // Revalidate user data
      }
      // Hoặc sử dụng mutate từ SWR nếu cần
      // await globalMutate('/api/user'); // Điều chỉnh đường dẫn API theo cấu trúc của bạn
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Cập nhật hồ sơ thất bại. Vui lòng thử lại.");
    }
  };

  const profile = isOwner ? ownerProfile : publicProfile;
  const posts = isOwner ? ownerPosts : publicPosts;
  const bookmarks = isOwner ? ownerReadingList : publicBookmarks;
  const loading = isOwner ? loadingOwner : loadingPublic;
  const error = isOwner ? ownerError : publicError;

  if (loading || loadingUser) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;

  //const viewedUsername = username;

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
          <button
            onClick={() => navigateToTab(isOwner ? 'YourPosts' : 'UserPosts')}
            className={`p-2 transition-colors ${
              activeTab === (isOwner ? 'YourPosts' : 'UserPosts')
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-blue-400'
            }`}
          >
            {isOwner ? 'Your Posts' : "User's Posts"}
          </button>
          <button
            onClick={() => navigateToTab(isOwner ? 'YourReading' : 'Bookmarks')}
            className={`p-2 transition-colors ${
              activeTab === (isOwner ? 'YourReading' : 'Bookmarks')
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-blue-400'
            }`}
          >
            {isOwner ? 'Your Reading' : 'Bookmarked'}
          </button>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === (isOwner ? 'YourPosts' : 'UserPosts') && <UserPostsSection posts={posts || []} />}
          {activeTab === (isOwner ? 'YourReading' : 'Bookmarks') && <ReadingListSection bookmarks={bookmarks} />}
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

