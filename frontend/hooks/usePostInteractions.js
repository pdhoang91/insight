// hooks/usePostInteractions.js
import { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useClapsCount } from './useClapsCount';
import { useComments } from './useComments';
import useBookmark from './useBookmark';
import { clapPost } from '../services/activityService';
import { BASE_FE_URL } from '../config/api';

export const usePostInteractions = (post) => {
  const { user } = useUser();
  const [isCommentsOpen, setCommentsOpen] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const shareMenuRef = useRef();

  // API hooks
  const { clapsCount, loading: clapsLoading, mutate: mutateClaps } = useClapsCount('post', post?.id);
  const { isBookmarked, toggleBookmark, loading: bookmarkLoading } = useBookmark(post?.id);
  const { comments, totalCommentReply, totalCount, isLoading: commentsLoading, isError, mutate: mutateComments } = useComments(post?.id, true, 1, 10);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setIsShareMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Interaction handlers
  const handleClap = async () => {
    if (!user) {
      alert('You need to login to clap.');
      return;
    }
    try {
      await clapPost(post.id);
      mutateClaps();
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('An error occurred while clapping. Please try again.');
    }
  };

  const toggleCommentPopup = () => {
    setCommentsOpen((prev) => !prev);
  };

  const closeCommentPopup = () => {
    setCommentsOpen(false);
  };

  const handleShare = () => {
    setIsShareMenuOpen((prev) => !prev);
  };

  const shareUrl = `${BASE_FE_URL}/p/${post?.title_name}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.preview_content,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copy URL
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return {
    // State
    isCommentsOpen,
    isShareMenuOpen,
    shareMenuRef,
    
    // Data
    clapsCount,
    isBookmarked,
    comments,
    totalCount,
    totalCommentReply,
    shareUrl,
    
    // Loading states
    clapsLoading,
    bookmarkLoading,
    commentsLoading,
    
    // Handlers
    handleClap,
    toggleBookmark,
    toggleCommentPopup,
    closeCommentPopup,
    handleShare,
    handleNativeShare,
    
    // Mutations
    mutateClaps,
    mutateComments,
  };
};

export default usePostInteractions; 