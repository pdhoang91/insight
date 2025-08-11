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

const UserProfilePage = () => {
  const router = useRouter();
  const { username } = router.query;
  const { user: loggedUser, loading: loadingUser, mutate } = useUser();

  const [showPopup, setShowPopup] = useState(false);

  // Check if user is authorized to view this profile (only owner can access)
  useEffect(() => {
    if (!loadingUser && loggedUser && username) {
      if (loggedUser.username !== username) {
        // Redirect to home if trying to access someone else's profile
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
  } = useProfile();

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
      alert("Failed to update profile. Please try again.");
    }
  };

  // Show loading while checking authentication
  if (loadingUser || loadingOwner) {
    return (
      <div className="min-h-screen bg-terminal-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authorized (will redirect)
  if (!loggedUser || loggedUser.username !== username) {
    return (
      <div className="min-h-screen bg-terminal-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-secondary">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (ownerError) {
    return (
      <div className="min-h-screen bg-terminal-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-hacker-red mb-2">Error loading profile</div>
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
          onUpdate={() => setShowPopup(true)}
        />

        {/* Posts Section */}
        <div className="bg-surface rounded-xl shadow-sm border border-border-primary p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">My Posts</h2>
            <p className="text-muted">Manage and view all your published articles</p>
          </div>

          <UserPostsSection
            posts={infinitePosts}
            isLoading={isLoadingPosts}
            isError={isErrorPosts}
            setSize={setSizePosts}
            isReachingEnd={isReachingEndPosts}
            isOwner={true}
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
