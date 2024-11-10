// hooks/useProfile.js
import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile as updateUserProfileService, getUserPosts } from '../services/userService';
import { useUser } from '../context/UserContext';

const useProfile = () => {
  const { user, setUser } = useUser();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      // Lấy profile người dùng
      const fetchProfile = async () => {
        try {
          const data = await getUserProfile();
          setProfile(data);
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          setError('Failed to load profile.');
        } finally {
          setLoadingProfile(false);
        }
      };

      // Lấy posts của người dùng
      const fetchPosts = async () => {
        try {
          const data = await getUserPosts(user.id);
          setPosts(data);
        } catch (err) {
          console.error('Failed to fetch user posts:', err);
          setError('Failed to load user posts.');
        } finally {
          setLoadingPosts(false);
        }
      };

      fetchProfile();
      fetchPosts();
    }
  }, [user]);

  const updateProfile = async (profileData) => {
    try {
      const updatedProfile = await updateUserProfileService(user.id, profileData);
      setProfile(updatedProfile);
      setUser(updatedProfile); // Cập nhật user trong context nếu cần
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile.');
      throw err;
    }
  };

  return {
    profile,
    posts,
    loading: loadingProfile || loadingPosts,
    error,
    updateProfile,
    setPosts, // Có thể sử dụng để cập nhật posts nếu cần
  };
};

export default useProfile;

