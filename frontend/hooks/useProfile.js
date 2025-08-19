// hooks/useProfile.js
import { useState, useEffect } from 'react';
import { updateUserProfile as updateUserProfileService, getUserPosts, fetchUserProfile } from '../services/userService';
import { useUser } from '../context/UserContext';
import { isSuperAdmin } from '../services/authService';
import { USER_ROLES } from '../constants/roles';

const useProfile = (username = null) => {
  const { user, setUser } = useUser();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        setError(null);

        if (!username || (user && user.username === username)) {
          // Fetching own profile
          if (user) {
            setProfile(user);
            setLoadingProfile(false);
          }
        } else {
          // Fetching another user's profile - only allowed for super admin
          if (user && isSuperAdmin()) {
            const profileData = await fetchUserProfile(username);
            setProfile(profileData);
          } else {
            setError('Access denied');
          }
          setLoadingProfile(false);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile.');
        setLoadingProfile(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, username]);

  const updateProfile = async (profileData) => {
    try {
      const updatedProfile = await updateUserProfileService(user.id, profileData);
      setProfile(updatedProfile.data);
      setUser(updatedProfile.data); // Cập nhật user trong context
      //alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile.');
      throw err;
    }
  };

  return {
    profile,
    posts,
    loading: loadingProfile,
    error,
    updateProfile,
    setPosts, // Có thể sử dụng để cập nhật posts nếu cần
  };
};

export default useProfile;
