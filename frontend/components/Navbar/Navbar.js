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
  FaSearch
} from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { usePostContext } from '../../context/PostContext';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import ThemeToggle from '../UI/ThemeToggle';
import SimpleSearchBar from '../Shared/SimpleSearchBar';
import { canWritePosts } from '../../services/authService';
import { themeClasses } from '../../utils/themeClasses';

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
      <nav className={`fixed top-0 left-0 right-0 z-50 ${classes.bg.primary}/80`}>
        <div className={themeClasses.layout.container}>
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
        ? `${classes.bg.primary} border-b ${classes.border.primary} shadow-sm` 
        : `${classes.bg.primary}/90`
    }`}>
      <div className={themeClasses.layout.container}>
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
          <div className="hidden md:flex items-center gap-6">
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
                  className={`p-2 text-medium-text-secondary hover:text-medium-text-primary hover:bg-medium-hover rounded-medium transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) hover:scale-105 ${themeClasses.interactive.touchTarget}`}
                  aria-label="Open search"
                  role="button"
                  tabIndex={0}
                >
                  <FaSearch className={`${themeClasses.icons.sm} ${themeClasses.text.secondary}`} />
                </button>
              )}
            </div>

            {/* Write Button */}
            {(user && canWritePosts(user)) && (
              <>
                {isWritePage ? (
                  <button
                    onClick={handlePublishClick}
                    className="px-6 py-2 bg-medium-accent-green hover:bg-medium-accent-green/90 text-white rounded-button text-sm font-medium transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-sm hover:shadow-[0_8px_25px_rgba(26,137,23,0.25)] hover:-translate-y-0.5 hover:scale-[1.02]"
                  >
                    Publish
                  </button>
                ) : (
                  <button
                    onClick={handleWriteClick}
                    className="flex items-center px-6 py-2 bg-medium-accent-green hover:bg-medium-accent-green/90 text-white rounded-button text-sm font-medium transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-sm hover:shadow-[0_8px_25px_rgba(26,137,23,0.25)] hover:-translate-y-0.5 hover:scale-[1.02]"
                  >
                    <FaEdit className={`${themeClasses.icons.sm} mr-2 text-white`} />
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
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-medium-hover transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) hover:scale-105"
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
                      className={`absolute right-0 mt-2 w-64 ${classes.bg.card} shadow-lg rounded-lg overflow-hidden backdrop-blur-md`}
                    >
                      {/* User Info - Clickable to profile */}
                      <div className="px-4 py-3">
                        <Link
                          href={`/${user.username}`}
                          className="flex items-center gap-3 hover:bg-medium-hover rounded-lg p-2 -m-2 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
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
                            <div className={`font-medium ${classes.text.primary} hover:text-medium-accent-green transition-colors`}>
                              {user.name}
                            </div>
                            <div className={`text-sm ${classes.text.secondary}`}>
                              {user.email}
                            </div>
                          </div>
                        </Link>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-medium-border my-2"></div>

                      {/* Menu Items */}
                      <div className="px-2 py-2 space-y-1">
                        {/* Write Button - if user can write */}
                        {canWritePosts(user) && (
                          <button
                            onClick={() => {
                              handleWriteClick();
                              setIsUserMenuOpen(false);
                            }}
                            className={`w-full flex items-center px-4 py-2 text-sm ${classes.text.secondary} hover:bg-medium-hover hover:${classes.text.primary} transition-colors rounded-md`}
                          >
                            <FaEdit className="w-4 h-4 mr-3" />
                            Write
                          </button>
                        )}

                        {/* Theme Toggle Button */}
                        <ThemeToggle variant="simple" className="w-full justify-start px-4 py-2 text-sm hover:bg-medium-hover transition-colors rounded-md" />

                        {/* Sign out */}
                        <button
                          onClick={handleLogout}
                          className={`w-full flex items-center px-4 py-2 text-sm ${classes.text.secondary} hover:bg-medium-hover hover:${classes.text.primary} transition-colors rounded-md`}
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
                <div className="flex items-center gap-4">
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
            className={`md:hidden backdrop-blur-md rounded-b-lg shadow-lg`}
          >
            <div className="px-6 py-4 space-y-4">
              {/* Mobile Search */}
              <div>
                <SimpleSearchBar placeholder="Search articles..." />
              </div>

              {/* Mobile Navigation */}
              {user ? (
                <div className="space-y-3">
                  {/* User Profile Link */}
                  <Link
                    href={`/${user.username}`}
                    className="flex items-center gap-3 p-3 hover:bg-medium-hover rounded-lg transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
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
                        View Profile
                      </div>
                    </div>
                  </Link>
                  
                  {/* Menu Items with consistent styling */}
                  <div className="space-y-1">
                    {canWritePosts(user) && (
                      <button
                        onClick={() => {
                          handleWriteClick();
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 text-sm ${classes.text.secondary} hover:bg-medium-hover hover:${classes.text.primary} transition-colors rounded-md`}
                      >
                        <FaEdit className="w-4 h-4 mr-3" />
                        Write
                      </button>
                    )}
                    
                    {/* Theme Toggle */}
                    <div className="px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${classes.text.secondary}`}>Theme</span>
                        <ThemeToggle variant="simple" />
                      </div>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center px-3 py-2 text-sm ${classes.text.secondary} hover:bg-medium-hover hover:${classes.text.primary} transition-colors rounded-md`}
                    >
                      <FaSignOutAlt className="w-4 h-4 mr-3" />
                      Sign out
                    </button>
                  </div>
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
