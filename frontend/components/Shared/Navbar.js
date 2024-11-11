// components/Shared/Navbar.js
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { useRouter } from 'next/router';
import { usePostContext } from '../../context/PostContext'; // Import hook
import { FaGavel } from "react-icons/fa6";


const Navbar = () => {
  const { user, setUser, setModalOpen, loading } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { handlePublish, handleUpdate } = usePostContext(); // Sử dụng hook để lấy hàm

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
    router.push('/'); // Chuyển hướng về trang chủ sau khi đăng xuất
  };

  const handleViewProfile = () => {

    setDropdownOpen(false);
    router.push(`/${user.username}`);
  };

  const handleCreatePostClick = () => {
    if (loading) return;
    if (user) {
      router.push('/write');
    } else {
      setModalOpen(true);
    }
  };

  const handleSubmitPostClick = () => {
    if (loading) return;
    if (user) {
      // Kiểm tra xem đang có handlePublish hoặc handleUpdate không
      if (handlePublish) {
        // Trong trang write, mở popup để publish
        router.push('/write#submit');
      } else if (handleUpdate) {
        // Trong trang edit, mở popup để update
        const { id } = router.query;
        if (id) {
          router.push(`/edit/${id}#submit`);
        } else {
          alert('Không tìm thấy ID bài viết để cập nhật.');
        }
      } else {
        // Không phải trang write hoặc edit, thông báo lỗi hoặc làm gì đó
        alert('Không thể gửi bài viết từ trang này.');
      }
    } else {
      setModalOpen(true);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isCreatePostPage = router.pathname === '/write';
  const isEditPostPage = router.pathname.startsWith('/edit/');

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <nav className="flex justify-between items-center p-4 sticky top-0 z-10">
      {/* Left Section: Logo and Search */}
      <div className="flex items-center space-x-6">
        <Link href="/" passHref className="text-2xl font-bold text-gray-800">
          Insight
        </Link>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 px-2 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
            placeholder="tìm kiếm..."
            aria-label="Search"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            aria-label="Submit Search"
          >
            <svg
              className="w-5 h-5 text-gray-400 hover:text-blue-500 transition-colors"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="text-gray-600 hover:text-blue-500 focus:outline-none"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? (
              <FaGavel className="h-4 w-4" size={9}/>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Right Section: Buttons and Avatar */}
      <div className={`flex items-center space-x-4 ${mobileMenuOpen ? 'block' : 'hidden'} md:flex`}>
        {/* Search Form for Mobile */}
        <form onSubmit={handleSearchSubmit} className="relative md:hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
            placeholder="Tìm kiếm..."
            aria-label="Search"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            aria-label="Submit Search"
          >
            <svg
              className="w-5 h-5 text-gray-400 hover:text-blue-500 transition-colors"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
        {(isCreatePostPage || isEditPostPage) ? (
          <span
            onClick={handleSubmitPostClick}
            className="px-2 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Publish
          </span>
        ) : (
          <span
            type="button"
            onClick={handleCreatePostClick}
            className="px-2 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors cursor-pointer"
          >
            Write
          </span>
        )}

        {user ? (
          <div ref={dropdownRef} className="relative">
            {/* <img
              src={user.avatar_url || '/default-avatar.png'}
              alt="User Avatar"
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={handleAvatarClick}
            /> */}
            <img
              src={`${user.avatar_url || '/default-avatar.png'}?t=${new Date().getTime()}`} // Thêm tham số timestamp để tránh cache
              alt="User Avatar"
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={handleAvatarClick}
            />
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
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
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            //className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 cursor-pointer transition-colors"
            className="px-2 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors whitespace-nowrap"
          >
            Sign In
          </button>
        )}

      </div>
    </nav>
  );
};

export default Navbar;


{/* <span
type="button"
onClick={handleCreatePostClick}
className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors cursor-pointer"
>
Write
</span> */}