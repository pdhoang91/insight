// hooks/useProfile.js
import { useState, useEffect } from 'react';
import { updateUserProfile as updateUserProfileService, getUserPosts } from '../services/userService';
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
      // Use user data from context instead of fetching again
      setProfile(user);
      setLoadingProfile(false);

      // Only fetch posts
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

      fetchPosts();
    }
  }, [user]);

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
    loading: loadingProfile || loadingPosts,
    error,
    updateProfile,
    setPosts, // Có thể sử dụng để cập nhật posts nếu cần
  };
};

export default useProfile;
