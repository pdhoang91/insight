// pages/[username].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useUser } from '../context/UserContext';
import usePublicProfile from '../hooks/usePublicProfile';
import useProfile from '../hooks/useProfile';
import useInfiniteUserPosts from '../hooks/useInfiniteUserPosts';
import useInfiniteBookmarks from '../hooks/useInfiniteBookmarks';
import ProfileUpdateForm from '../components/Profile/ProfileUpdateForm';
import UserPostsSection from '../components/Profile/UserPostsSection';
import ReadingListSection from '../components/Profile/ReadingListSection';
import FolowPeopleSestion from '../components/Profile/FolowPeopleSestion';
import { motion } from 'framer-motion';

const UserProfilePage = () => {
  const router = useRouter();
  const { username } = router.query;
  const { user: loggedUser, loading: loadingUser, mutate: mutateUser } = useUser();

  const [activeTab, setActiveTab] = useState('posts');
  const [isOwner, setIsOwner] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Determine if current user is the profile owner
  useEffect(() => {
    if (loggedUser && username) {
      setIsOwner(loggedUser.username === username);
    } else {
      setIsOwner(false);
    }
  }, [loggedUser, username]);

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

  const {
    posts: infinitePosts,
    isLoading: isLoadingPosts,
    isError: isErrorPosts,
    setSize: setSizePosts,
    isReachingEnd: isReachingEndPosts,
  } = useInfiniteUserPosts(activeTab, username);

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
      alert("Failed to update profile. Please try again.");
    }
  };

  const profile = isOwner ? ownerProfile : publicProfile;
  const posts = isOwner ? ownerPosts : publicPosts;
  const combinedPosts = isOwner ? infinitePosts : publicPosts;
  const bookmarksData = isOwner ? ownerReadingList : publicBookmarks;
  const loading = isOwner ? loadingOwner : loadingPublic;
  const error = isOwner ? ownerError : publicError;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const handleFollow = () => {
    console.log('Follow user:', username);
  };

  const handleMessage = () => {
    console.log('Message user:', username);
  };

  if (loading || loadingUser) {
    return (
      <div className="loading-container">
        <div className="loading-card">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-container">
        <div className="error-card">
          <p className="text-lg font-medium">Error loading profile</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app">
      {/* Profile Header */}
      <div className="bg-surface border-b border-border-primary py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.name || username}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-gray-600 shadow-lg"
                />
              ) : (
                <div className="w-30 h-30 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-gray-900 text-4xl font-mono font-bold shadow-lg">
                  {(profile?.name || username)?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-3xl font-bold text-white font-mono">
                    {profile?.name || username}
                  </h1>
                  <p className="text-lg text-gray-400 mt-1 font-mono">@{username}</p>
                  
                  {profile?.phone && (
                    <p className="mt-2 text-gray-600">
                      {profile.phone}
                    </p>
                  )}
                  
                  {/* Meta Info */}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {profile?.dob && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 0a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2" />
                        </svg>
                        Born {formatDate(profile.dob)}
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 0a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2" />
                      </svg>
                      Joined {formatDate(profile?.created_at || '2024-01-01')}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  {isOwner ? (
                    <button
                      onClick={() => setShowPopup(true)}
                      className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleFollow}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Follow
                      </button>
                      <button
                        onClick={handleMessage}
                        className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                      >
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {posts?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Stories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {folows?.followers?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {folows?.following?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Following</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stories ({posts?.length || 0})
            </button>
            
            {isOwner && (
              <button
                onClick={() => setActiveTab('reading')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reading'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reading List
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('following')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'following'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {isOwner ? 'Following' : 'Network'}
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'posts' && (
            <UserPostsSection
              posts={isOwner ? infinitePosts : publicPosts}
              isLoading={isOwner ? isLoadingPosts : loading}
              isError={isOwner ? isErrorPosts : error}
              setSize={setSizePosts}
              isReachingEnd={isReachingEndPosts}
              isOwner={isOwner}
            />
          )}
          
          {activeTab === 'reading' && isOwner && (
            <ReadingListSection
              bookmarks={bookmarks}
              isLoading={isLoadingBookmarks}
              isError={isErrorBookmarks}
              setSize={setSizeBookmarks}
              isReachingEnd={isReachingEndBookmarks}
            />
          )}
          
          {activeTab === 'following' && (
            <FolowPeopleSestion peoples={folows} />
          )}
        </motion.div>
      </div>

      {/* Profile Update Modal */}
      {isOwner && showPopup && (
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
