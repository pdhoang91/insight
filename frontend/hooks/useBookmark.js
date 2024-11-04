// hooks/useBookmark.js
import { useState, useEffect, useCallback } from 'react';
import { bookmarkPost, unBookmarkPost, isBookmarked as checkIsBookmarked } from '../services/bookmarkService';
import { useUser } from '../context/UserContext';
import { mutate } from 'swr'; // Import mutate từ SWR

const useBookmark = (postId) => {
  const { user } = useUser();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Kiểm tra trạng thái bookmark khi component mount hoặc postId thay đổi
  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      if (!user) {
        setIsBookmarked(false);
        return;
      }
      try {
        const response = await checkIsBookmarked(postId);
        setIsBookmarked(response.is_bookmarked);
      } catch (error) {
        console.error('Failed to check bookmark status:', error);
      }
    };

    fetchBookmarkStatus();
  }, [postId, user]);

  const toggleBookmark = useCallback(async () => {
    if (!user) {
      alert('Bạn cần đăng nhập để lưu bài viết.');
      return;
    }

    setLoading(true);

    try {
      if (isBookmarked) {
        // Unbookmark
        const response = await unBookmarkPost(postId);
        if (response.message === 'Bookmark removed') {
          setIsBookmarked(false);
          //alert('Đã loại bỏ bài viết khỏi danh sách đọc của bạn.');
        } else {
          alert('Không thể loại bỏ bookmark. Vui lòng thử lại.');
        }
      } else {
        // Bookmark
        const response = await bookmarkPost(postId);
        if (response.message === 'Bookmark created' || response.message === 'Bookmark reactivated') {
          setIsBookmarked(true);
          //alert('Đã lưu bài viết vào danh sách đọc của bạn.');
        } else if (response.message === 'Bookmark already exists') {
          setIsBookmarked(true); // Trong trường hợp bookmark đã tồn tại nhưng không rõ trạng thái
          //alert('Bài viết đã được bookmark.');
        } else {
          alert('Không thể lưu bookmark. Vui lòng thử lại.');
        }
      }
      // Mutate Reading List để revalidate và cập nhật cache
      mutate('/api/bookmarks');
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      alert('Đã xảy ra lỗi khi xử lý bookmark. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [isBookmarked, postId, user]);

  return { isBookmarked, toggleBookmark, loading };
};

export default useBookmark;
