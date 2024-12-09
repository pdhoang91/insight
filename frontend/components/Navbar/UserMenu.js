import { useState, useRef, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FaUser, FaRightFromBracket } from "react-icons/fa6";

const UserMenu = ({ isMobile, onClose }) => {
  const { user, setUser, setModalOpen, loading } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const handleAvatarClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setDropdownOpen(false);
    router.push('/');
    if (isMobile && onClose) onClose();
  };

  const handleViewProfile = () => {
    setDropdownOpen(false);
    router.push(`/${user.username}`);
    if (isMobile && onClose) onClose();
  };

  useEffect(() => {
    if (!isMobile) {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMobile]);

  if (!user) {
    return (
      <button
        onClick={() => setModalOpen(true)}
        className="px-2 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors whitespace-nowrap"
      >
        Sign In
      </button>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col space-y-2">
        <button
          onClick={handleViewProfile}
          className="block w-full text-left px-2 py-2 text-gray-800 hover:bg-gray-200 rounded flex items-center gap-2"
        >
          <FaUser className="text-gray-600" />
          View Profile
        </button>
        <button
          onClick={handleLogout}
          className="w-full text-left px-2 py-2 text-gray-800 hover:bg-gray-200 rounded flex items-center gap-2"
        >
          <FaRightFromBracket className="text-gray-600" />
          Logout
        </button>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <img
        src={`${user.avatar_url || '/default-avatar.png'}?t=${new Date().getTime()}`}
        alt="User Avatar"
        className="w-8 h-8 rounded-full cursor-pointer"
        onClick={handleAvatarClick}
      />
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-20">
          <button
            onClick={handleViewProfile}
            className="block w-full text-left px-2 py-2 text-gray-800 hover:bg-gray-200 flex items-center gap-2"
          >
            <FaUser className="text-gray-600" />
            View Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-2 py-2 text-gray-800 hover:bg-gray-200 flex items-center gap-2"
          >
            <FaRightFromBracket className="text-gray-600" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;