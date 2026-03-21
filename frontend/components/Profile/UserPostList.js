// components/Profile/UserPostList.js
import React from 'react';
import BasePostItem from '../Post/BasePostItem';
import { useTranslations } from 'next-intl';

const UserPostList = ({ posts, isOwner }) => {
  const t = useTranslations();
  if (!Array.isArray(posts)) {
    return <div>{t('profile.noPostsAvailable')}</div>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <BasePostItem key={post.id} post={post} variant="profile" showOwnerActions={isOwner} />
      ))}
    </div>
  );
};

export default UserPostList;
