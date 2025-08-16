// components/Navbar/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaUserCircle, 
  FaCog, 
  FaBars, 
  FaTimes, 
  FaEdit,
  FaPaperPlane,
  FaCode,
  FaTerminal,
  FaLaptopCode,
  FaRocket,
  FaBolt,
  FaGithub,
  FaServer
} from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import TechSearchBar from '../Shared/TechSearchBar';
import { canWritePosts } from '../../services/authService';

const Navbar = ({ onPublish }) => {
  const { user, setUser, setModalOpen } = useUser();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef();
  const mobileMenuRef = useRef();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false); // Close mobile menu
    router.push('/');
  };

  const handleWriteClick = () => {
    setIsMobileMenuOpen(false); // Close mobile menu
    if (!user) {
      setModalOpen(true);
    } else {
      router.push('/write');
    }
  };

  const handlePublishClick = () => {
    setIsMobileMenuOpen(false); // Close mobile menu
    if (onPublish) {
      onPublish();
    }
  };

  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-terminal-dark/95 backdrop-blur-md border-b border-matrix-green/30' 
        : 'bg-terminal-black/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="text-lg font-bold text-matrix-green hover:text-matrix-light-green transition-colors">
              INSIGHT
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-6">
            {/* Search Bar */}
            <div className="w-56 lg:w-80">
              <TechSearchBar />
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Write Button - Hide on write/edit pages and show only for users with write permissions */}
              {router.pathname !== '/write' && !router.pathname.startsWith('/edit/') && user && canWritePosts() && (
                                  <button
                    onClick={handleWriteClick}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-matrix-green/10 text-matrix-green border border-matrix-green/30 rounded-md hover:bg-matrix-green hover:text-terminal-black transition-all duration-300 text-sm"
                  >
                    <FaEdit className="w-3 h-3" />
                    <span className="font-medium">Viết Bài</span>
                  </button>
              )}

              {/* Publish Button (show on write page) */}
              {router.pathname === '/write' && onPublish && (
                <button
                  onClick={handlePublishClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-hacker-yellow/10 text-hacker-yellow border border-hacker-yellow/30 rounded-md hover:bg-hacker-yellow hover:text-terminal-black transition-all duration-300 text-sm"
                >
                  <FaPaperPlane className="w-3 h-3" />
                  <span className="font-medium">Đăng Bài</span>
                </button>
              )}

              {/* Update Button (show on edit page) */}
              {router.pathname.startsWith('/edit/') && onPublish && (
                <button
                  onClick={handlePublishClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-matrix-cyan/10 text-matrix-cyan border border-matrix-cyan/30 rounded-md hover:bg-matrix-cyan hover:text-terminal-black transition-all duration-300 text-sm"
                >
                  <FaPaperPlane className="w-3 h-3" />
                  <span className="font-medium">Cập Nhật</span>
                </button>
              )}

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-1.5 p-1.5 rounded-md hover:bg-terminal-gray transition-colors"
                  >
                    <div className="w-7 h-7 bg-matrix-green/20 rounded-full flex items-center justify-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <FaUser className="w-3 h-3 text-matrix-green" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-terminal-gray border border-matrix-green/30 rounded-lg shadow-lg overflow-hidden"
                      >
                        {/* User Info - Clickable to go to profile */}
                        <Link
                          href={`/${user.username}`}
                          className="block p-4 border-b border-matrix-green/20 hover:bg-terminal-light transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-matrix-green/20 rounded-full flex items-center justify-center">
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={user.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <FaUser className="w-5 h-5 text-matrix-green" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-text-primary">{user.name}</div>
                              <div className="text-sm text-text-muted">{user.email}</div>
                            </div>
                          </div>
                        </Link>

                        {/* Menu Items */}
                        <div className="py-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-hacker-red hover:bg-terminal-light transition-colors"
                          >
                            <FaSignOutAlt className="w-4 h-4" />
                            <span>Đăng Xuất</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-3 py-1.5 text-sm text-text-secondary hover:text-matrix-green border border-matrix-green/30 rounded-md hover:border-matrix-green/50 transition-all"
                >
                  Đăng Nhập
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-1 rounded-md hover:bg-terminal-gray transition-colors"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="w-4 h-4 text-text-primary" />
            ) : (
              <FaBars className="w-4 h-4 text-text-primary" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="md:hidden bg-gradient-to-br from-terminal-dark via-terminal-black to-terminal-dark border-t border-matrix-green/40 overflow-hidden relative"
            >


              {/* Glowing border effect */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-matrix-green to-transparent animate-pulse" />

              <div className="relative p-5 space-y-5">
                {/* Search Bar with enhanced styling */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-matrix-green/20 to-matrix-cyan/20 rounded-lg blur opacity-75" />
                  <div className="relative">
                    <TechSearchBar onSearch={() => setIsMobileMenuOpen(false)} />
                  </div>
                </motion.div>

                {/* Actions Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  {/* Write Button - Hide on write/edit pages and show only for users with write permissions */}
                  {router.pathname !== '/write' && !router.pathname.startsWith('/edit/') && user && canWritePosts() && (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleWriteClick}
                      className="w-full group relative overflow-hidden bg-gradient-to-r from-matrix-green/10 to-matrix-green/5 border border-matrix-green/30 rounded-lg p-4 hover:border-matrix-green/50 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-matrix-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center space-x-3">
                        <div className="p-2 bg-matrix-green/20 rounded-lg group-hover:bg-matrix-green/30 transition-colors">
                          <FaEdit className="w-4 h-4 text-matrix-green" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-matrix-green">Viết Bài</div>
                          <div className="text-xs text-text-muted">Tạo bài viết mới</div>
                        </div>
                      </div>
                    </motion.button>
                  )}

                  {/* Publish Button (show on write page) */}
                  {router.pathname === '/write' && onPublish && (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handlePublishClick}
                      className="w-full group relative overflow-hidden bg-gradient-to-r from-hacker-yellow/10 to-hacker-yellow/5 border border-hacker-yellow/30 rounded-lg p-4 hover:border-hacker-yellow/50 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-hacker-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center space-x-3">
                        <div className="p-2 bg-hacker-yellow/20 rounded-lg group-hover:bg-hacker-yellow/30 transition-colors">
                          <FaRocket className="w-4 h-4 text-hacker-yellow" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-hacker-yellow">Đăng Bài Viết</div>
                          <div className="text-xs text-text-muted">Xuất bản bài viết</div>
                        </div>
                      </div>
                    </motion.button>
                  )}

                  {/* Update Button (show on edit page) */}
                  {router.pathname.startsWith('/edit/') && onPublish && (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handlePublishClick}
                      className="w-full group relative overflow-hidden bg-gradient-to-r from-matrix-cyan/10 to-matrix-cyan/5 border border-matrix-cyan/30 rounded-lg p-4 hover:border-matrix-cyan/50 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-matrix-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center space-x-3">
                        <div className="p-2 bg-matrix-cyan/20 rounded-lg group-hover:bg-matrix-cyan/30 transition-colors">
                          <FaBolt className="w-4 h-4 text-matrix-cyan" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-matrix-cyan">Cập Nhật Bài</div>
                          <div className="text-xs text-text-muted">Lưu thay đổi</div>
                        </div>
                      </div>
                    </motion.button>
                  )}
                </motion.div>

                {/* User Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  {user ? (
                    <>
                      {/* Enhanced User Profile Card */}
                      <Link
                        href={`/${user.username}`}
                        className="group block relative overflow-hidden bg-gradient-to-r from-terminal-gray/50 to-terminal-gray/30 border border-matrix-green/20 rounded-xl p-4 hover:border-matrix-green/40 transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-matrix-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-matrix-green/30 to-matrix-green/10 rounded-full flex items-center justify-center border border-matrix-green/30">
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={user.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <FaUser className="w-6 h-6 text-matrix-green" />
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-matrix-green rounded-full flex items-center justify-center">
                              <FaLaptopCode className="w-2 h-2 text-terminal-black" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-text-primary group-hover:text-matrix-green transition-colors">{user.name}</div>
                            <div className="text-sm text-text-muted font-mono">{user.email}</div>
                            <div className="text-xs text-matrix-green/70 font-mono mt-1">@{user.username}</div>
                          </div>
                          <div className="text-matrix-green/50 group-hover:text-matrix-green transition-colors">
                            <FaServer className="w-4 h-4" />
                          </div>
                        </div>
                      </Link>
                      
                      {/* Enhanced Logout Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="w-full group relative overflow-hidden bg-gradient-to-r from-hacker-red/10 to-hacker-red/5 border border-hacker-red/30 rounded-xl p-4 hover:border-hacker-red/60 transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-hacker-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-center justify-center space-x-3">
                          <FaSignOutAlt className="w-4 h-4 text-hacker-red" />
                          <span className="font-medium text-hacker-red">Đăng Xuất</span>
                        </div>
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full group relative overflow-hidden bg-gradient-to-r from-matrix-green/10 to-matrix-green/5 border border-matrix-green/30 rounded-xl p-4 hover:border-matrix-green/60 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-matrix-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center justify-center space-x-3">
                        <FaGithub className="w-5 h-5 text-matrix-green" />
                        <span className="font-medium text-matrix-green">Đăng Nhập</span>
                      </div>
                    </motion.button>
                  )}
                </motion.div>

                {/* Terminal Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center text-xs text-matrix-green/50 font-mono pt-2 border-t border-matrix-green/20"
                >
                  <span>Trạng thái hệ thống: </span>
                  <span className="text-matrix-green">HOẠT ĐỘNG</span>
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="ml-2"
                  >
                    ●
                  </motion.span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;

