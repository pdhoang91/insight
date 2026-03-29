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
    <div>
      {posts.map((post) => (
        <div key={post.id} className="pb-20">
          <BasePostItem post={post} showOwnerActions={isOwner} />
        </div>
      ))}
    </div>
  );
};

export default UserPostList;
