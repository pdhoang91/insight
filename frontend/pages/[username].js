// pages/[username].js
import React, { useEffect, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import useProfile from '../hooks/useProfile';
import { useInfiniteUserPosts } from '../hooks/useInfiniteUserPosts';
import AvatarUpdateModal from '../components/Profile/AvatarUpdateModal';
import ProfileHeader from '../components/Profile/ProfileHeader';
import UserPostsSection from '../components/Profile/UserPostsSection';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import { ProfileLayout } from '../components/Layout/Layout';
import { isSuperAdmin } from '../services/authService';
import { USER_ROLES } from '../constants/roles';
import { FaShieldAlt } from 'react-icons/fa';
import { themeClasses } from '../utils/themeClasses';

// Profile Posts Header Component - Following home page pattern
const ProfilePostsHeader = ({ isOwner, profile, username, isAdmin }) => (
  <section className={themeClasses.spacing.section}>
    <header className={`text-center lg:text-left ${themeClasses.spacing.gap}`}>
      <h2 className={`${themeClasses.typography.h2} mb-3`}>
        {isOwner ? 'Bài viết của tôi' : `Bài viết của ${profile?.name || username}`}
      </h2>
      <p className={`${themeClasses.typography.bodyLarge} text-medium-text-secondary max-w-2xl mx-auto lg:mx-0`}>
        {isOwner 
          ? 'Quản lý và xem tất cả bài viết đã đăng của bạn' 
          : `Xem tất cả bài viết của ${profile?.name || username}`
        }
      </p>
      {isAdmin && !isOwner && (
        <div className="mt-4 inline-flex items-center space-x-2 px-3 py-1 bg-medium-accent-green/10 border border-medium-accent-green/30 rounded-medium">
          <FaShieldAlt className="w-3 h-3 text-medium-accent-green" />
          <span className="text-xs text-medium-accent-green font-medium">Quyền quản trị</span>
        </div>
      )}
    </header>
  </section>
);

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
      <div className="min-h-screen bg-medium-bg-primary flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-medium-text-secondary">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authorized (will redirect)
  const isOwner = loggedUser?.username === username;
  const isAdmin = isSuperAdmin();
  
  if (!loggedUser || (!isOwner && !isAdmin)) {
    return (
      <div className="min-h-screen bg-medium-bg-primary flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-medium-text-secondary">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  if (ownerError) {
    return (
      <div className="min-h-screen bg-medium-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 font-serif text-lg mb-2">Lỗi khi tải hồ sơ</div>
          <p className="text-medium-text-muted">{ownerError}</p>
        </div>
      </div>
    );
  }

  return (
    <ProfileLayout>
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
      <ProfilePostsHeader 
        isOwner={isOwner}
        profile={profile}
        username={username}
        isAdmin={isAdmin}
      />

      <UserPostsSection
        posts={infinitePosts}
        isLoading={isLoadingPosts}
        isError={isErrorPosts}
        setSize={setSizePosts}
        isReachingEnd={isReachingEndPosts}
        isOwner={isOwner}
      />

      {/* Avatar Update Modal */}
      {showPopup && (
        <AvatarUpdateModal
          userProfile={profile}
          onUpdate={handleUpdateProfile}
          onCancel={() => setShowPopup(false)}
        />
      )}
    </ProfileLayout>
  );
};

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'vi', ['common'])),
  },
});

export default UserProfilePage;
