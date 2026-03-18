'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '../../../context/UserContext';
import useProfile from '../../../hooks/useProfile';
import { useInfiniteUserPosts } from '../../../hooks/useInfiniteUserPosts';
import AvatarUpdateModal from '../../../components/Profile/AvatarUpdateModal';
import ProfileHeader from '../../../components/Profile/ProfileHeader';
import UserPostsSection from '../../../components/Profile/UserPostsSection';
import { ProfileLayout } from '../../../components/Layout/Layout';
import { isSuperAdmin } from '../../../services/authService';
import { USER_ROLES } from '../../../constants/roles';

const ProfilePostsHeader = ({ isOwner, profile, username }) => (
  <div style={{ marginBottom: '2rem' }}>
    <p
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.66rem',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--text-faint)',
        margin: '0 0 0.5rem 0',
      }}
    >
      {isOwner ? 'Your writing' : `Writing by ${profile?.name || username}`}
    </p>
    <h2
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: '1.35rem',
        letterSpacing: '-0.022em',
        lineHeight: 1.2,
        color: 'var(--text)',
        margin: 0,
      }}
    >
      {isOwner ? 'All posts' : `Posts by ${profile?.name || username}`}
    </h2>
  </div>
);

const WarmPageLoader = () => (
  <div
    style={{
      minHeight: '100dvh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1.25rem',
          maxWidth: 480,
          width: '100%',
          padding: '0 1.5rem',
        }}
      >
        <div
          className="skeleton-warm"
          style={{ width: 72, height: 72, borderRadius: '50%', flexShrink: 0 }}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingTop: '0.5rem' }}>
          <div className="skeleton-warm" style={{ height: '1.4rem', width: '55%', borderRadius: '2px' }} />
          <div className="skeleton-warm" style={{ height: '0.9rem', width: '80%', borderRadius: '2px' }} />
          <div className="skeleton-warm" style={{ height: '0.9rem', width: '65%', borderRadius: '2px' }} />
        </div>
      </div>
    </div>
  </div>
);

const WarmErrorState = ({ message }) => (
  <div
    style={{
      minHeight: '100dvh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div style={{ textAlign: 'center', padding: '0 1.5rem' }}>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '1rem',
          letterSpacing: '-0.015em',
          color: 'var(--text)',
          marginBottom: '0.5rem',
          margin: '0 0 0.5rem 0',
        }}
      >
        Unable to load profile
      </p>
      {message && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          {message}
        </p>
      )}
    </div>
  </div>
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
      if (mutate) await mutate();
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (loadingUser || loadingOwner) return <WarmPageLoader />;

  const isOwner = loggedUser?.username === username;
  const isAdmin = isSuperAdmin();

  if (!loggedUser || (!isOwner && !isAdmin)) return <WarmPageLoader />;
  if (ownerError) return <WarmErrorState message={ownerError} />;

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

      <ProfilePostsHeader isOwner={isOwner} profile={profile} username={username} />

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
