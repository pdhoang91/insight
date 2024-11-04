// hooks/useFollow.js
import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { checkFollowingStatus, followUser, unfollowUser } from '../services/followService';

const useFollow = (authorId) => {
  const { user } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFollowingStatus = async () => {
      if (user && authorId && user.id !== authorId) {
        try {
          const response = await checkFollowingStatus(authorId);
          setIsFollowing(response.isFollowing);
        } catch (error) {
          console.error('Failed to check following status:', error);
        }
      }
    };

    fetchFollowingStatus();
  }, [user, authorId]);

  const toggleFollow = async () => {
    if (!user) {
      alert('Bạn cần đăng nhập để theo dõi.');
      return;
    }
    if (user.id === authorId) {
      alert('Bạn không thể theo dõi chính mình.');
      return;
    }
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(authorId);
        setIsFollowing(false);
      } else {
        await followUser(authorId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
      alert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, toggleFollow, loading };
};

export default useFollow;
