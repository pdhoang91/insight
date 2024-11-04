// components/Utils/ShareMenu.js
import React from 'react';
import { FaTwitter, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
import { FiCopy } from 'react-icons/fi';
import useShare from '../../hooks/useShare';

const ShareMenu = ({ shareUrl, title, onClose }) => {

  console.log("shareUrl", shareUrl)
  console.log("title", title)

  const { copyLink, shareOnTwitter, shareOnFacebook, shareOnLinkedIn, shareStatus } = useShare();

  const handleCopyLink = () => {
    copyLink(shareUrl);
  };

  const handleShareOnTwitter = () => {
    shareOnTwitter(shareUrl, title);
    onClose();
  };

  const handleShareOnFacebook = () => {
    shareOnFacebook(shareUrl);
    onClose();
  };

  const handleShareOnLinkedIn = () => {
    shareOnLinkedIn(shareUrl, title);
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg z-10 transition-transform duration-200 transform opacity-100 scale-100">
      <ul className="py-1">
        <li>
          <button
            onClick={handleCopyLink}
            className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
          >
            <FiCopy className="mr-2" /> Copy Link
          </button>
          {shareStatus.copied && (
            <span className="text-green-500 text-sm px-4">Đã sao chép!</span>
          )}
          {shareStatus.error && (
            <span className="text-red-500 text-sm px-4">{shareStatus.error}</span>
          )}
        </li>
        <li>
          <button
            onClick={handleShareOnTwitter}
            className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
          >
            <FaTwitter className="mr-2 text-blue-400" /> Share on X
          </button>
        </li>
        <li>
          <button
            onClick={handleShareOnFacebook}
            className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
          >
            <FaFacebookF className="mr-2 text-blue-600" /> Share on Facebook
          </button>
        </li>
        <li>
          <button
            onClick={handleShareOnLinkedIn}
            className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
          >
            <FaLinkedinIn className="mr-2 text-blue-700" /> Share on LinkedIn
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ShareMenu;
