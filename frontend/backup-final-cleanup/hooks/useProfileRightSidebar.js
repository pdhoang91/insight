// hooks/useProfileRightSidebar.js
import { useEffect, useState } from 'react';
import { 
  fetchSuggestedProfiles, 
  checkFollowingStatus, 
  followUser, 
  unfollowUser 
} from '../services/followService';

const useProfileRightSidebar = (currentUser, viewedUsername) => {
  const [moreProfiles, setMoreProfiles] = useState([]);
  const [loadingMore, setLoadingMore] = useState(true);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [error, setError] = useState(null);
  const [followStatus, setFollowStatus] = useState({}); // { userId: true/false }
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    const getMoreProfiles = async () => {
      try {
        const data = await fetchSuggestedProfiles(1, 10);
        setMoreProfiles(data.data || []);
      } catch (err) {
        setError('Failed to load suggested profiles.');
      } finally {
        setLoadingMore(false);
      }
    };

    if (currentUser) {
      getMoreProfiles();
    } else {
    }
  }, [currentUser, viewedUsername]);

  // Kiểm tra trạng thái follow khi tải dữ liệu
  useEffect(() => {
    const checkFollowStatusForUsers = async () => {
      try {
        const combinedUsers = [...moreProfiles];
        const status = {};
        for (const user of combinedUsers) {
          const res = await checkFollowingStatus(user.id);
          status[user.id] = res.isFollowing;
        }
        setFollowStatus(status);
      } catch (err) {
        console.error('Failed to check following status:', err);
      }
    };

    if (moreProfiles.length > 0) {
      checkFollowStatusForUsers();
    }
  }, [moreProfiles]);

  const handleFollow = async (userId) => {
    try {
      await followUser(userId);
      setFollowStatus(prev => ({ ...prev, [userId]: true }));
      setNotification({ message: 'Successfully followed the user!', type: 'success' });
    } catch (err) {
      console.error('Failed to follow user:', err);
      setNotification({ message: 'Failed to follow the user.', type: 'error' });
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId);
      setFollowStatus(prev => ({ ...prev, [userId]: false }));
      setNotification({ message: 'Successfully unfollowed the user!', type: 'success' });
    } catch (err) {
      console.error('Failed to unfollow user:', err);
      setNotification({ message: 'Failed to unfollow the user.', type: 'error' });
    }
  };

  const closeNotification = () => {
    setNotification({ message: '', type: '' });
  };

  return {
    moreProfiles,
    loadingMore,
    loadingPeople,
    error,
    handleFollow,
    handleUnfollow,
    followStatus,
    notification,
    closeNotification,
  };
};

export default useProfileRightSidebar;
