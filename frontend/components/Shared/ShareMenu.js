// components/Shared/ShareMenu.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTwitter, FaLinkedin, FaFacebook, FaCopy, FaCheck, FaTimes } from 'react-icons/fa';

const ShareMenu = ({ 
  url, 
  title, 
  description, 
  onClose, 
  variant = 'default' 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const shareLinks = [
    {
      name: 'Twitter',
      icon: FaTwitter,
      color: 'hover:bg-blue-50 hover:text-blue-600',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'hover:bg-blue-50 hover:text-blue-700',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'hover:bg-blue-50 hover:text-blue-800',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    }
  ];

  const handleShareClick = (shareUrl) => {
    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  };

  // Positioning based on variant
  const getPositionClasses = () => {
    switch (variant) {
      case 'compact':
        return 'absolute top-full left-0 mt-1 z-50';
      case 'enhanced':
        return 'absolute top-full right-0 mt-2 z-50';
      default:
        return 'absolute top-full left-0 mt-1 z-50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className={`${getPositionClasses()} bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-48`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-700">Share this post</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaTimes className="w-3 h-3 text-gray-400" />
        </button>
      </div>

      {/* Social Share Options */}
      <div className="py-2">
        {shareLinks.map((social) => {
          const IconComponent = social.icon;
          return (
            <button
              key={social.name}
              onClick={() => handleShareClick(social.url)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 ${social.color} transition-colors`}
            >
              <IconComponent className="w-4 h-4" />
              <span className="text-sm">Share on {social.name}</span>
            </button>
          );
        })}
        
        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {copied ? (
            <>
              <FaCheck className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">Link copied!</span>
            </>
          ) : (
            <>
              <FaCopy className="w-4 h-4" />
              <span className="text-sm">Copy link</span>
            </>
          )}
        </button>
      </div>

      {/* URL Preview */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="bg-gray-50 rounded px-3 py-2">
          <p className="text-xs text-gray-500 truncate" title={url}>
            {url}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ShareMenu; 