// components/profile/ProfileSection.js - Unified Profile Components
import React, { useState } from 'react';
import { FaUser, FaEdit, FaSave, FaTimes, FaMapMarkerAlt, FaCalendarAlt, FaLink } from 'react-icons/fa';
import { SafeImage, TimeAgo } from '../common';
import { Button, Input } from '../ui';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

// Profile Header Component
export const ProfileHeader = ({ 
  user, 
  isOwner = false, 
  onEdit,
  stats = { posts: 0, followers: 0, following: 0 }
}) => {

  return (
    <div className={combineClasses(themeClasses.bg.card, 'p-6 mb-6')}>
      <div className={combineClasses(
        themeClasses.responsive.flexTabletRow,
        'items-start md:items-center',
        themeClasses.spacing.gap
      )}>
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-medium-border">
            {user?.avatar_url ? (
              <SafeImage
                src={user.avatar_url}
                alt={user.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={combineClasses(themeClasses.bg.secondary, 'w-full h-full flex items-center justify-center')}>
                <FaUser className={`w-8 h-8 md:w-12 md:h-12 ${themeClasses.text.muted}`} />
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={combineClasses(themeClasses.heading.h1, 'mb-2')}>
                {user?.name || 'Unknown User'}
              </h1>
              <p className={combineClasses(themeClasses.text.muted, 'text-lg mb-2')}>
                @{user?.username}
              </p>
              {user?.bio && (
                <p className={combineClasses(themeClasses.text.secondary, 'mb-4 max-w-2xl')}>
                  {user.bio}
                </p>
              )}
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {user?.location && (
                  <div className={combineClasses('flex items-center gap-1', themeClasses.text.muted)}>
                    <FaMapMarkerAlt className="w-3 h-3" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user?.website && (
                  <a 
                    href={user.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={combineClasses('flex items-center gap-1', themeClasses.text.accent, 'hover:underline')}
                  >
                    <FaLink className="w-3 h-3" />
                    <span>Website</span>
                  </a>
                )}
                {user?.created_at && (
                  <div className={combineClasses('flex items-center gap-1', themeClasses.text.muted)}>
                    <FaCalendarAlt className="w-3 h-3" />
                    <span>Tham gia <TimeAgo timestamp={user.created_at} /></span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onEdit}
                  className="flex items-center gap-2"
                >
                  <FaEdit className="w-4 h-4" />
                  Chỉnh sửa hồ sơ
                </Button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-medium-border">
            <div className="text-center">
              <div className={combineClasses(themeClasses.text.primary, 'text-xl font-bold')}>
                {stats.posts}
              </div>
              <div className={combineClasses(themeClasses.text.muted, 'text-sm')}>
                Bài viết
              </div>
            </div>
            <div className="text-center">
              <div className={combineClasses(themeClasses.text.primary, 'text-xl font-bold')}>
                {stats.followers}
              </div>
              <div className={combineClasses(themeClasses.text.muted, 'text-sm')}>
                Người theo dõi
              </div>
            </div>
            <div className="text-center">
              <div className={combineClasses(themeClasses.text.primary, 'text-xl font-bold')}>
                {stats.following}
              </div>
              <div className={combineClasses(themeClasses.text.muted, 'text-sm')}>
                Đang theo dõi
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Form Component
export const ProfileForm = ({ 
  user, 
  onSave, 
  onCancel,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className={combineClasses(themeClasses.card, 'p-6')}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={themeClasses.heading.h2}>
          Chỉnh sửa hồ sơ
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={combineClasses('block text-sm font-medium mb-2', themeClasses.text.primary)}>
            Tên hiển thị
          </label>
          <Input
            value={formData.name}
            onChange={handleChange('name')}
            placeholder="Nhập tên của bạn"
            required
          />
        </div>

        <div>
          <label className={combineClasses('block text-sm font-medium mb-2', themeClasses.text.primary)}>
            Tiểu sử
          </label>
          <textarea
            className={themeClasses.textarea}
            value={formData.bio}
            onChange={handleChange('bio')}
            placeholder="Viết một chút về bản thân..."
            rows={4}
          />
        </div>

        <div>
          <label className={combineClasses('block text-sm font-medium mb-2', themeClasses.text.primary)}>
            Địa điểm
          </label>
          <Input
            value={formData.location}
            onChange={handleChange('location')}
            placeholder="Thành phố, Quốc gia"
          />
        </div>

        <div>
          <label className={combineClasses('block text-sm font-medium mb-2', themeClasses.text.primary)}>
            Website
          </label>
          <Input
            type="url"
            value={formData.website}
            onChange={handleChange('website')}
            placeholder="https://example.com"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            className="flex items-center gap-2"
          >
            <FaSave className="w-4 h-4" />
            Lưu thay đổi
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <FaTimes className="w-4 h-4" />
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
};

// User Posts Section Component
export const UserPostsSection = ({ 
  posts = [], 
  isLoading = false, 
  isError = false,
  setSize,
  isReachingEnd = false,
  username
}) => {
  const { PostList } = require('../post');

  return (
    <div>
      <div className="mb-6">
        <h2 className={themeClasses.heading.h2}>
          Bài viết của {username}
        </h2>
      </div>

      <PostList
        posts={posts}
        isLoading={isLoading}
        isError={isError}
        setSize={setSize}
        isReachingEnd={isReachingEnd}
        variant="compact"
        emptyTitle="Chưa có bài viết"
        emptyMessage="Người dùng này chưa đăng bài viết nào."
      />
    </div>
  );
};
