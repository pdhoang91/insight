// components/Navbar/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaEdit,
  FaBars, 
  FaTimes,
  FaSearch,
  FaCog
} from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { usePostContext } from '../../context/PostContext';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import ThemeToggle from '../UI/ThemeToggle';
import SimpleSearchBar from '../Shared/SimpleSearchBar';
import { canWritePosts } from '../../services/authService';

const Navbar = () => {
  const { user, setUser, setModalOpen } = useUser();
  const { theme, mounted } = useTheme();
  const { handlePublish } = usePostContext();
  const { classes } = useThemeClasses();
  const router = useRouter();
  const isWritePage = router.pathname === '/write' || router.pathname.startsWith('/edit/');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const handlePublishClick = () => {
    if (handlePublish) {
      handlePublish();
    }
  };

  const handleWriteClick = () => {
    setIsMobileMenuOpen(false);
    if (!user) {
      setModalOpen(true);
    } else {
      router.push('/write');
    }
  };

  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Don't render navbar until theme is mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className={`fixed top-0 left-0 right-0 z-50 ${classes.bg.primary}/80 backdrop-blur-sm`}>
        <div className="max-w-container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="animate-pulse">
              <div className={`h-8 w-32 ${classes.skeleton} rounded`}></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? `${classes.bg.primary}/95 backdrop-blur-md border-b ${classes.border.primary} shadow-sm` 
        : `${classes.bg.primary}/80 backdrop-blur-sm`
    }`}>
      <div className="max-w-container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="text-2xl font-serif font-bold text-medium-text-primary group-hover:text-medium-accent-green transition-colors duration-200">
              Insight
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="w-80">
                  <SimpleSearchBar 
                    onClose={() => setIsSearchOpen(false)}
                    autoFocus={true}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-medium-text-secondary hover:text-medium-text-primary hover:bg-medium-hover rounded-medium transition-all duration-200"
                  aria-label="Search"
                >
                  <FaSearch className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Write Button */}
            {(user && canWritePosts(user)) && (
              <>
                {isWritePage ? (
                  <button
                    onClick={handlePublishClick}
                    className="px-6 py-2 bg-medium-accent-green hover:bg-medium-accent-green/90 text-white rounded-button text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Publish
                  </button>
                ) : (
                  <button
                    onClick={handleWriteClick}
                    className="flex items-center px-6 py-2 bg-medium-accent-green hover:bg-medium-accent-green/90 text-white rounded-button text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <FaEdit className="w-4 h-4 mr-2" />
                    Write
                  </button>
                )}
              </>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-medium-hover transition-all duration-200"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-medium-accent-green rounded-full flex items-center justify-center">
                      <FaUser className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className={`absolute right-0 mt-2 w-64 ${classes.card} shadow-lg border ${classes.border.primary} overflow-hidden`}
                    >
                      {/* User Info */}
                      <div className={`px-4 py-3 border-b ${classes.border.primary}`}>
                        <div className="flex items-center space-x-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className={`w-10 h-10 ${classes.bg.accent} rounded-full flex items-center justify-center`}>
                              <FaUser className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div>
                            <div className={`font-medium ${classes.text.primary}`}>
                              {user.name}
                            </div>
                            <div className={`text-sm ${classes.text.secondary}`}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href={`/${user.username}`}
                          className={`flex items-center px-4 py-2 text-sm ${classes.text.secondary} hover:${classes.bg.secondary} hover:${classes.text.primary} transition-colors`}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaUser className="w-4 h-4 mr-3" />
                          Profile
                        </Link>
                        
                        <button
                          className={`w-full flex items-center px-4 py-2 text-sm ${classes.text.secondary} hover:${classes.bg.secondary} hover:${classes.text.primary} transition-colors`}
                        >
                          <FaCog className="w-4 h-4 mr-3" />
                          Settings
                        </button>
                      </div>

                      {/* Theme Toggle */}
                      <div className={`px-4 py-3 border-t ${classes.border.primary}`}>
                        <ThemeToggle />
                      </div>

                      {/* Logout */}
                      <div className={`border-t ${classes.border.primary}`}>
                        <button
                          onClick={handleLogout}
                          className={`w-full flex items-center px-4 py-3 text-sm ${classes.text.secondary} hover:${classes.bg.secondary} hover:${classes.text.primary} transition-colors`}
                        >
                          <FaSignOutAlt className="w-4 h-4 mr-3" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-medium-text-secondary hover:text-medium-text-primary hover:bg-medium-hover px-3 py-2 rounded-medium transition-all duration-200"
                >
                  Sign in
                </button>
                <button
                  onClick={handleWriteClick}
                  className="px-6 py-2 bg-medium-accent-green hover:bg-medium-accent-green/90 text-white rounded-button text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Get started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className={`p-2 ${classes.text.secondary} hover:${classes.text.primary} transition-colors`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="w-5 h-5" />
              ) : (
                <FaBars className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden ${classes.card} border-t ${classes.border.primary}`}
          >
            <div className="px-6 py-4 space-y-4">
              {/* Mobile Search */}
              <div>
                <SimpleSearchBar placeholder="Search articles..." />
              </div>

              {/* Mobile Navigation */}
              {user ? (
                <div className="space-y-3">
                  <Link
                    href={`/${user.username}`}
                    className={`flex items-center py-2 ${classes.text.secondary}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaUser className="w-4 h-4 mr-3" />
                    Profile
                  </Link>
                  
                  {canWritePosts(user) && (
                    <button
                      onClick={handleWriteClick}
                      className={`flex items-center py-2 ${classes.text.secondary}`}
                    >
                      <FaEdit className="w-4 h-4 mr-3" />
                      Write
                    </button>
                  )}
                  
                  <div className="py-2">
                    <ThemeToggle />
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className={`flex items-center py-2 ${classes.text.secondary}`}
                  >
                    <FaSignOutAlt className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full py-2 text-left ${classes.text.secondary}`}
                  >
                    Sign in
                  </button>
                  <button
                    onClick={handleWriteClick}
                    className={`block w-full py-2 px-4 ${classes.button.primary} rounded-full text-center font-medium`}
                  >
                    Get started
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
