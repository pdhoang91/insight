//hooks/usePublicProfile.js
import { useEffect, useState } from 'react';
import { fetchUserProfile, fetchUserPosts, fetchUserFolow } from '../services/userService';

export const usePublicProfile = (username) => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [folows, setFolows] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;

    const getProfileAndPosts = async () => {
      try {
        const userProfile = await fetchUserProfile(username);
        setProfile(userProfile);

        const userPosts = await fetchUserPosts(username, 1, 10);
        setPosts(userPosts.posts || []);
        // Nếu có bookmarks API, gọi và setBookmarks
        const userFolows = await fetchUserFolow(username, 1, 10)
        console.log("userFolows", userFolows)
        setFolows(userFolows.peoples || [])
      } catch (err) {
        setError('Failed to load public profile.');
      } finally {
        setLoading(false);
      }
    };

    getProfileAndPosts();
  }, [username]);

  return { profile, posts, folows , bookmarks, loading, error };
};

export default usePublicProfile;