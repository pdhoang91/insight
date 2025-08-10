// pages/[username].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import useProfile from '../hooks/useProfile';
import useInfiniteUserPosts from '../hooks/useInfiniteUserPosts';
import ProfileUpdateForm from '../components/Profile/ProfileUpdateForm';
import UserPostsSection from '../components/Profile/UserPostsSection';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import SafeImage from '../components/Utils/SafeImage';

const UserProfilePage = () => {
  const router = useRouter();
  const { username } = router.query;
  const { user: loggedUser, loading: loadingUser, mutate: mutateUser } = useUser();

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
  } = useInfiniteUserPosts('posts', username);

  const handleUpdateProfile = async (profileData) => {
    try {
      await updateProfile(profileData);
      setShowPopup(false);
      if (mutateUser) {
        await mutateUser();
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  // Show loading while checking authentication
  if (loadingUser || loadingOwner) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authorized (will redirect)
  if (!loggedUser || loggedUser.username !== username) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (ownerError) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-center">
          <div className="text-danger font-mono mb-2">Error loading profile</div>
          <p className="text-muted">{ownerError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app">
      {/* Main Content Container - Match other pages */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Profile Header Card */}
        <div className="bg-surface rounded-xl shadow-sm border border-border-primary p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile?.avatar_url ? (
                <SafeImage
                  src={profile.avatar_url}
                  alt={profile.name || username}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-primary/20 shadow-lg"
                />
              ) : (
                <div className="w-30 h-30 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-primary text-4xl font-bold shadow-lg">
                  {(profile?.name || username)?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-3xl font-bold text-primary mb-2">
                    {profile?.name || username}
                  </h1>
                  <p className="text-lg text-secondary mb-4">@{username}</p>
                  
                  {/* Posts Count */}
                  <div className="text-sm">
                    <div className="text-xl font-bold text-primary">
                      {infinitePosts?.length || 0}
                    </div>
                    <div className="text-muted">Posts Published</div>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <div className="flex items-center">
                  <button
                    onClick={() => setShowPopup(true)}
                    className="px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors border border-primary/20 hover:border-primary/30"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Meta Info */}
              {profile?.created_at && (
                <div className="mt-4 text-sm text-muted">
                  Member since {formatDate(profile.created_at)}
                </div>
              )}
            </div>
          </div>
        </div>

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
