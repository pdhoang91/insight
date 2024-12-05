// components/Shared/UserMenu.js
import { useState, useRef, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useRouter } from 'next/router';
import axios from 'axios';

const UserMenu = ({ isMobile }) => {
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
    router.push('/'); // Chuyển hướng về trang chủ sau khi đăng xuất
  };

  const handleViewProfile = () => {
    setDropdownOpen(false);
    router.push(`/${user.username}`);
  };

  useEffect(() => {
    if (!isMobile) { // Chỉ thêm listener khi không ở mobile
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
    // Hiển thị trực tiếp các tùy chọn trên mobile
    return (
      <div className="flex flex-col space-y-2">
        <button
          onClick={handleViewProfile}
          className="block w-full text-left px-2 py-2 text-gray-800 hover:bg-gray-200 rounded"
        >
          View Profile
        </button>
        <button
          onClick={handleLogout}
          className="w-full text-left px-2 py-2 text-gray-800 hover:bg-gray-200 rounded"
        >
          Logout
        </button>
      </div>
    );
  }

  // Hiển thị avatar và dropdown trên desktop
  return (
    <div ref={dropdownRef} className="relative">
      <img
        src={`${user.avatar_url || '/default-avatar.png'}?t=${new Date().getTime()}`} // Thêm tham số timestamp để tránh cache
        alt="User Avatar"
        className="w-8 h-8 rounded-full cursor-pointer"
        onClick={handleAvatarClick}
      />
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-20">
          <button
            onClick={handleViewProfile}
            className="block w-full text-left px-2 py-2 text-gray-800 hover:bg-gray-200"
          >
            View Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-2 py-2 text-gray-800 hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
