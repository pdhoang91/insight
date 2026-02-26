'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '../../../context/UserContext';
import useProfile from '../../../hooks/useProfile';
import { useInfiniteUserPosts } from '../../../hooks/useInfiniteUserPosts';
import AvatarUpdateModal from '../../../components/Profile/AvatarUpdateModal';
import ProfileHeader from '../../../components/Profile/ProfileHeader';
import UserPostsSection from '../../../components/Profile/UserPostsSection';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import { ProfileLayout } from '../../../components/Layout/Layout';
import { isSuperAdmin } from '../../../services/authService';
import { USER_ROLES } from '../../../constants/roles';
import { FaShieldAlt } from 'react-icons/fa';

const ProfilePostsHeader = ({ isOwner, profile, username, isAdmin }) => (
  <section className="mt-10 mb-6">
    <header className="text-center lg:text-left">
      <h2 className="font-serif text-2xl font-bold text-[#292929] mb-2">
        {isOwner ? 'My posts' : `Posts by ${profile?.name || username}`}
      </h2>
      <p className="text-[14px] text-[#757575] max-w-2xl mx-auto lg:mx-0">
        {isOwner ? 'Manage and view all your published posts' : `View all posts by ${profile?.name || username}`}
      </p>
      {isAdmin && !isOwner && (
        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1a8917]/10 text-[#1a8917] text-xs rounded-full">
          <FaShieldAlt className="w-3 h-3" />
          <span className="font-medium">Admin access</span>
        </div>
      )}
    </header>
  </section>
);

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username?.replace(/^@/, '');
  const { user: loggedUser, loading: loadingUser, mutate } = useUser();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!loadingUser && loggedUser && username) {
      const isOwner = loggedUser.username === username;
      const isAdmin = isSuperAdmin();
      if (!isOwner && !isAdmin) {
        router.push('/');
      }
    }
  }, [loggedUser, username, loadingUser, router]);

  const { profile, loading: loadingOwner, error: ownerError, updateProfile } = useProfile(username);
  const { posts: infinitePosts, isLoading: isLoadingPosts, isError: isErrorPosts, setSize: setSizePosts, isReachingEnd: isReachingEndPosts } = useInfiniteUserPosts(username);

  const handleUpdateProfile = async (profileData) => {
    try {
      await updateProfile(profileData);
      setShowPopup(false);
      if (mutate) await mutate();
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (loadingUser || loadingOwner) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-[#757575] text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  const isOwner = loggedUser?.username === username;
  const isAdmin = isSuperAdmin();

  if (!loggedUser || (!isOwner && !isAdmin)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (ownerError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 font-serif text-lg mb-2">Error loading profile</div>
          <p className="text-[#b3b3b1]">{ownerError}</p>
        </div>
      </div>
    );
  }

  return (
    <ProfileLayout>
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

      <ProfilePostsHeader isOwner={isOwner} profile={profile} username={username} isAdmin={isAdmin} />

      <UserPostsSection
        posts={infinitePosts}
        isLoading={isLoadingPosts}
        isError={isErrorPosts}
        setSize={setSizePosts}
        isReachingEnd={isReachingEndPosts}
        isOwner={isOwner}
      />

      {showPopup && (
        <AvatarUpdateModal
          userProfile={profile}
          onUpdate={handleUpdateProfile}
          onCancel={() => setShowPopup(false)}
        />
      )}
    </ProfileLayout>
  );
}
