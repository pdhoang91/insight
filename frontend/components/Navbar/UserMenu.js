import { useState, useRef, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FaRightFromBracket } from "react-icons/fa6";

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
        className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors whitespace-nowrap border border-primary/20"
      >
        Sign In
      </button>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 text-secondary hover:bg-surface rounded-lg flex items-center gap-3 transition-colors"
        >
          <FaRightFromBracket className="text-muted" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <img
        src={`${user.avatar_url || '/default-avatar.png'}?t=${new Date().getTime()}`}
        alt="User Avatar"
        className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
        onClick={handleAvatarClick}
      />
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-surface border border-border-primary rounded-lg shadow-lg z-20 py-2">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-secondary hover:bg-primary/5 flex items-center gap-3 transition-colors"
          >
            <FaRightFromBracket className="text-muted" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;