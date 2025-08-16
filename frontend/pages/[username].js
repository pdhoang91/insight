// pages/[username].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import useProfile from '../hooks/useProfile';
import { useInfiniteUserPosts } from '../hooks/useInfiniteUserPosts';
import ProfileUpdateForm from '../components/Profile/ProfileUpdateForm';
import ProfileHeader from '../components/Profile/ProfileHeader';
import UserPostsSection from '../components/Profile/UserPostsSection';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import { isSuperAdmin } from '../services/authService';
import { USER_ROLES } from '../constants/roles';
import { FaShieldAlt } from 'react-icons/fa';

const UserProfilePage = () => {
  const router = useRouter();
  const { username } = router.query;
  const { user: loggedUser, loading: loadingUser, mutate } = useUser();

  const [showPopup, setShowPopup] = useState(false);

  // Check if user is authorized to view this profile (owner or super admin can access)
  useEffect(() => {
    if (!loadingUser && loggedUser && username) {
      const isOwner = loggedUser.username === username;
      const isAdmin = isSuperAdmin();
      
      if (!isOwner && !isAdmin) {
        // Redirect to home if trying to access someone else's profile without admin rights
        router.push('/');
        return;
      }
    }
  }, [loggedUser, username, loadingUser, router]);

  const {
    profile,
    loading: loadingOwner,
    error: ownerError,
    updateProfile,
  } = useProfile(username);

  // Use infinite posts for better UX
  const {
    posts: infinitePosts,
    isLoading: isLoadingPosts,
    isError: isErrorPosts,
    setSize: setSizePosts,
    isReachingEnd: isReachingEndPosts,
  } = useInfiniteUserPosts(username);

  const handleUpdateProfile = async (profileData) => {
    try {
      await updateProfile(profileData);
      setShowPopup(false);
      if (mutate) {
        await mutate();
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
    }
  };

  // Show loading while checking authentication
  if (loadingUser || loadingOwner) {
    return (
      <div className="min-h-screen bg-terminal-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-secondary">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authorized (will redirect)
  const isOwner = loggedUser?.username === username;
  const isAdmin = isSuperAdmin();
  
  if (!loggedUser || (!isOwner && !isAdmin)) {
    return (
      <div className="min-h-screen bg-terminal-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-secondary">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  if (ownerError) {
    return (
      <div className="min-h-screen bg-terminal-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-hacker-red mb-2">Lỗi khi tải hồ sơ</div>
          <p className="text-text-muted">{ownerError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-terminal-black">
      {/* Main Content Container - Match other pages */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Profile Header */}
        <ProfileHeader
          avatarUrl={profile?.avatar_url}
          name={profile?.name || username}
          email={profile?.email}
          bio={profile?.bio}
          id={profile?.id}
          onUpdate={(isOwner || isAdmin) ? () => setShowPopup(true) : null}
          isOwner={isOwner}
          isAdmin={isAdmin}
          userRole={profile?.role || USER_ROLES.USER}
        />

        {/* Posts Section */}
        <div className="py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">
              {isOwner ? 'Bài viết của tôi' : `Bài viết của ${profile?.name || username}`}
            </h2>
            <p className="text-muted">
              {isOwner 
                ? 'Quản lý và xem tất cả bài viết đã đăng của bạn' 
                : `Xem tất cả bài viết của ${profile?.name || username}`
              }
            </p>
            {isAdmin && !isOwner && (
              <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1 bg-hacker-yellow/10 border border-hacker-yellow/30 rounded-md">
                <FaShieldAlt className="w-3 h-3 text-hacker-yellow" />
                <span className="text-xs text-hacker-yellow font-mono">Quyền quản trị</span>
              </div>
            )}
          </div>

          <UserPostsSection
            posts={infinitePosts}
            isLoading={isLoadingPosts}
            isError={isErrorPosts}
            setSize={setSizePosts}
            isReachingEnd={isReachingEndPosts}
            isOwner={isOwner}
          />
        </div>
      </div>

      {/* Profile Update Modal */}
      {showPopup && (
        <ProfileUpdateForm
          userProfile={profile}
          onUpdate={handleUpdateProfile}
          onCancel={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default UserProfilePage;
