// hooks/useNavbar.js
import { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useRouter } from 'next/router';

export const useNavbar = () => {
  const { user, setUser, setModalOpen, loading } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

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

  const handleAvatarClick = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setDropdownOpen(false);
  };

  const handleCreatePostClick = () => {
    if (loading) return;
    user ? router.push('/write') : setModalOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isCreatePostPage = router.pathname === '/write';

  return {
    user,
    loading,
    dropdownOpen,
    dropdownRef,
    searchQuery,
    setSearchQuery,
    handleAvatarClick,
    handleLogout,
    handleCreatePostClick,
    handleSearchSubmit,
    isCreatePostPage,
  };
};

export default useNavbar;
