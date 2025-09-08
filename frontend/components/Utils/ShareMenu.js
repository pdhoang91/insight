// components/Utils/ShareMenu.js
import React from 'react';
import { FaFacebook, FaTwitter, FaLinkedin, FaCopy } from 'react-icons/fa';

const ShareMenu = ({ shareUrl, title, onClose }) => {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
      onClose();
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    onClose();
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`, '_blank');
    onClose();
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    onClose();
  };

  return (
    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-48">
      <button
        onClick={shareOnFacebook}
        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
      >
        <FaFacebook className="mr-2 text-blue-600" />
        Share on Facebook
      </button>
      
      <button
        onClick={shareOnTwitter}
        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
      >
        <FaTwitter className="mr-2 text-blue-400" />
        Share on Twitter
      </button>
      
      <button
        onClick={shareOnLinkedIn}
        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
      >
        <FaLinkedin className="mr-2 text-blue-700" />
        Share on LinkedIn
      </button>
      
      <hr className="my-1" />
      
      <button
        onClick={handleCopyLink}
        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
      >
        <FaCopy className="mr-2 text-gray-500" />
        Copy link
      </button>
    </div>
  );
};

export default ShareMenu;
