// components/profile/index.js
export { ProfileHeader, ProfileForm, UserPostsSection } from './ProfileSection';

// Re-export existing components (for gradual migration)
export { default as ProfileUpdateForm } from '../Profile/ProfileUpdateForm';
export { default as UserPostList } from '../Profile/UserPostList';
export { default as AuthorProfile } from '../Author/AuthorProfile';
