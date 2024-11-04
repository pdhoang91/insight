import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

const UserMenu = ({ user, setModalOpen, loading }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAvatarClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setDropdownOpen(false);
  };

  const handleCreatePostClick = () => {
    if (!loading) {
      user ? router.push('/write') : setModalOpen(true);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <div ref={dropdownRef} className="relative">
          <img
            src={user.avatar_url || '/default-avatar.png'}
            alt="User Avatar"
            className="w-8 h-8 rounded-full cursor-pointer"
            onClick={handleAvatarClick}
          />
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-60">
              <Link href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-200 z-60">
                View Profile
              </Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 z-60">
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <button onClick={() => setModalOpen(true)} className="px-4 py-2 text-gray-800 hover:bg-gray-200 rounded transition-colors">
          Sign In
        </button>
      )}
    </div>
  );
};

export default UserMenu;
