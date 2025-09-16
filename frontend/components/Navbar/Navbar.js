// components/Navbar/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaEdit
} from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { usePostContext } from '../../context/PostContext';
import ThemeToggle from '../UI/ThemeToggle';
import SimpleSearchBar from '../Shared/SimpleSearchBar';
import NavbarMobile from './NavbarMobile';
import { canWritePosts } from '../../services/authService';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const Navbar = () => {
  const { user, setUser, setModalOpen } = useUser();
  const { theme, mounted } = useTheme();
  const { handlePublish } = usePostContext();
  const router = useRouter();
  const isWritePage = router.pathname === '/write' || router.pathname.startsWith('/edit/');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef();
  
  // Get mobile navigation components
  const mobileNav = NavbarMobile();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const handlePublishClick = () => {
    if (handlePublish) {
      handlePublish();
    }
  };

  const handleWriteClick = () => {
    if (!user) {
      setModalOpen(true);
    } else {
      router.push('/write');
    }
  };

  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  // Don't render navbar until theme is mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className={combineClasses(
        'fixed top-0 left-0 right-0 z-50',
        themeClasses.bg.primary + '/80'
      )}>
        <div className={themeClasses.layout.container}>
          <div className="flex items-center justify-between h-16">
            <div className="animate-pulse">
              <div className={combineClasses(
                'h-8 w-32 rounded',
                themeClasses.animations.skeleton
              )}></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={combineClasses(
      'fixed top-0 left-0 right-0 z-50',
      themeClasses.animations.smooth,
      scrolled 
        ? combineClasses(
            themeClasses.bg.primary,
            'border-b',
            themeClasses.border.primary,
            themeClasses.effects.shadow
          )
        : themeClasses.bg.primary + '/90'
    )}>
      <div className={themeClasses.layout.container}>
        <div className="flex items-center justify-between h-16 md:h-18 lg:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center group"
          >
            <div className={combineClasses(
              themeClasses.typography.h2,
              themeClasses.text.primary,
              themeClasses.text.accentHover,
              themeClasses.animations.smooth
            )}>
              Insight
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search - Always visible with responsive width */}
            <div className="w-48 md:w-56 lg:w-64 xl:w-72">
              <SimpleSearchBar placeholder="Tìm kiếm..." />
            </div>

            {/* Write/Publish Button */}
            {(user && canWritePosts(user)) && (
              <>
                {isWritePage ? (
                  <button
                    onClick={handlePublishClick}
                    className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 min-h-[44px] text-sm text-medium-text-secondary hover:text-medium-accent-green hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200 ease-out flex items-center"
                    aria-label="Đăng bài viết"
                  >
                    Đăng
                  </button>
                ) : (
                  <button
                    onClick={handleWriteClick}
                    className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 min-h-[44px] text-sm text-medium-text-secondary hover:text-medium-accent-green hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200 ease-out flex items-center"
                    aria-label="Viết bài mới"
                  >
                    <FaEdit className={combineClasses(
                      themeClasses.icons.sm, 
                      'mr-2',
                      themeClasses.text.accent
                    )} />
                    Viết bài
                  </button>
                )}
              </>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className={combineClasses(
                    'flex items-center gap-2 p-2 rounded-full',
                    'hover:bg-medium-bg-secondary transition-all duration-200 ease-out',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-medium-accent-green focus-visible:ring-offset-2'
                  )}
                  aria-label="Mở menu người dùng"
                  aria-expanded={isUserMenuOpen}
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className={themeClasses.avatar.sm}
                    />
                  ) : (
                    <div className={combineClasses(
                      themeClasses.avatar.sm,
                      'bg-medium-bg-secondary border border-medium-border',
                      'flex items-center justify-center'
                    )}>
                      <FaUser className={combineClasses(
                        themeClasses.icons.sm,
                        themeClasses.text.secondary
                      )} />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className={combineClasses(
                        'absolute right-0 mt-2 w-64 overflow-hidden z-50',
                        'bg-medium-bg-primary border-medium-border border',
                        'rounded-lg shadow-2xl'
                      )}
                      style={{ 
                        backgroundColor: 'var(--medium-bg-primary)',
                        opacity: '1'
                      }}
                    >
                      {/* User Info - Clickable to profile */}
                      <div className="px-4 py-3">
                        <Link
                          href={`/${user.username}`}
                          className={combineClasses(
                            'flex items-center gap-3 rounded-lg p-2 -m-2',
                            'hover:bg-medium-bg-secondary transition-all duration-200 ease-out'
                          )}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className={themeClasses.avatar.md}
                            />
                          ) : (
                            <div className={combineClasses(
                              themeClasses.avatar.md,
                              'bg-medium-bg-secondary border border-medium-border',
                              'flex items-center justify-center'
                            )}>
                              <FaUser className={combineClasses(
                                themeClasses.icons.md,
                                themeClasses.text.secondary
                              )} />
                            </div>
                          )}
                          <div>
                            <div className={combineClasses(
                              themeClasses.typography.weightMedium,
                              themeClasses.text.primary,
                              themeClasses.text.accentHover,
                              themeClasses.animations.smooth
                            )}>
                              {user.name}
                            </div>
                            <div className={combineClasses(
                              themeClasses.typography.bodySmall,
                              themeClasses.text.secondary
                            )}>
                              {user.email}
                            </div>
                          </div>
                        </Link>
                      </div>

                      {/* Divider */}
                      <div className={themeClasses.menu.divider}></div>

                      {/* Menu Items */}
                      <div className="px-2 py-2 space-y-1">
                        {/* Theme Toggle Button */}
                        <ThemeToggle 
                          variant="simple" 
                          className={combineClasses(
                            'w-full justify-start px-4 py-2 text-sm rounded-md',
                            'hover:bg-medium-bg-secondary transition-all duration-200 ease-out'
                          )} 
                        />

                        {/* Sign out */}
                        <button
                          onClick={handleLogout}
                          className={combineClasses(
                            'w-full px-4 py-2 text-sm cursor-pointer flex items-center gap-3 rounded-md',
                            'text-medium-text-primary bg-transparent',
                            'hover:bg-medium-bg-secondary hover:text-medium-text-primary',
                            'transition-all duration-200 ease-out'
                          )}
                          aria-label="Đăng xuất khỏi tài khoản"
                        >
                          <FaSignOutAlt className={combineClasses(themeClasses.icons.sm, 'mr-3')} />
                          Đăng xuất
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
                  className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 min-h-[44px] text-sm text-medium-text-secondary hover:text-medium-accent-green hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200 ease-out flex items-center"
                  aria-label="Đăng nhập vào tài khoản"
                >
                  Đăng nhập
                </button>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          {mobileNav?.mobileControls}
        </div>
      </div>

      {/* Mobile Menu - positioned outside navbar container for proper spacing */}
      {mobileNav?.mobileMenu}
    </nav>
  );
};

export default Navbar;
