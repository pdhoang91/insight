// hooks/useShare.js
import { useState } from 'react';

const useShare = () => {
  const [shareStatus, setShareStatus] = useState({
    copied: false,
    error: null,
  });

  const copyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus({ copied: true, error: null });
      setTimeout(() => setShareStatus({ copied: false, error: null }), 2000); // Reset sau 2 giây
    } catch (error) {
      console.error('Failed to copy:', error);
      setShareStatus({ copied: false, error: 'Không thể sao chép đường dẫn.' });
    }
  };

  const shareOnTwitter = (url, title) => {
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      url
    )}&text=${encodeURIComponent(title)}`;
    window.open(twitterShareUrl, '_blank', 'noopener,noreferrer');
  };

  const shareOnFacebook = (url) => {
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`;
    window.open(facebookShareUrl, '_blank', 'noopener,noreferrer');
  };

  const shareOnLinkedIn = (url, title) => {
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}&title=${encodeURIComponent(title)}`;
    window.open(linkedInShareUrl, '_blank', 'noopener,noreferrer');
  };

  return {
    copyLink,
    shareOnTwitter,
    shareOnFacebook,
    shareOnLinkedIn,
    shareStatus,
  };
};

export default useShare;
