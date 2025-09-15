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
import ThemeToggle from '../UI/ThemeToggle';
import SimpleSearchBar from '../Shared/SimpleSearchBar';
import { canWritePosts } from '../../services/authService';
import { themeClasses, componentClasses, combineClasses } from '../../utils/themeClasses';

const Navbar = () => {
  const { user, setUser, setModalOpen } = useUser();
  const { theme, mounted } = useTheme();
  const { handlePublish } = usePostContext();
  const router = useRouter();
  const isWritePage = router.pathname === '/write' || router.pathname.startsWith('/edit/');
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
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center group"
            onClick={() => setIsMobileMenuOpen(false)}
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
            {/* Search - Always visible */}
            <div className="w-64">
              <SimpleSearchBar placeholder="Tìm kiếm..." />
            </div>

            {/* Write/Publish Button */}
            {(user && canWritePosts(user)) && (
              <>
                {isWritePage ? (
                  <button
                    onClick={handlePublishClick}
                    className={componentClasses.button.primary}
                    aria-label="Đăng bài viết"
                  >
                    Đăng
                  </button>
                ) : (
                  <button
                    onClick={handleWriteClick}
                    className={combineClasses(
                      componentClasses.button.ghost,
                      'flex items-center'
                    )}
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
                    'flex items-center gap-2 p-1 rounded-full',
                    'hover:bg-medium-hover',
                    themeClasses.interactions.iconHover
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
                      themeClasses.bg.accent,
                      'flex items-center justify-center'
                    )}>
                      <FaUser className={combineClasses(
                        themeClasses.icons.sm,
                        themeClasses.text.white
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
                        'absolute right-0 mt-2 w-64 overflow-hidden',
                        themeClasses.menu.container
                      )}
                    >
                      {/* User Info - Clickable to profile */}
                      <div className="px-4 py-3">
                        <Link
                          href={`/${user.username}`}
                          className={combineClasses(
                            'flex items-center gap-3 rounded-lg p-2 -m-2',
                            'hover:bg-medium-hover',
                            themeClasses.animations.smooth
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
                              themeClasses.bg.accent,
                              'flex items-center justify-center'
                            )}>
                              <FaUser className={combineClasses(
                                themeClasses.icons.md,
                                themeClasses.text.white
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
                            'hover:bg-medium-hover',
                            themeClasses.animations.smooth
                          )} 
                        />

                        {/* Sign out */}
                        <button
                          onClick={handleLogout}
                          className={combineClasses(
                            themeClasses.menu.item,
                            'w-full'
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
                  className={componentClasses.button.ghost}
                  aria-label="Đăng nhập vào tài khoản"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={handleWriteClick}
                  className={componentClasses.button.primary}
                  aria-label="Bắt đầu viết bài"
                >
                  Bắt đầu
                </button>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Search */}
            <div className={combineClasses(
              'flex-1 max-w-48',
              themeClasses.responsive.touchOnly
            )}>
              <SimpleSearchBar placeholder="Tìm kiếm..." />
            </div>
            
            {/* Mobile Write/Publish Button */}
            {(user && canWritePosts(user)) && (
              <>
                {isWritePage ? (
                  <button
                    onClick={handlePublishClick}
                    className={componentClasses.button.primarySmall}
                    aria-label="Đăng bài viết"
                  >
                    Đăng
                  </button>
                ) : (
                  <button
                    onClick={handleWriteClick}
                    className={combineClasses(
                      componentClasses.button.primarySmall,
                      'p-2'
                    )}
                    aria-label="Viết bài mới"
                  >
                    <FaEdit className={combineClasses(
                      themeClasses.icons.sm,
                      themeClasses.text.white
                    )} />
                  </button>
                )}
              </>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
            className={combineClasses(
              themeClasses.interactive.touchTarget,
              'rounded-lg',
              themeClasses.text.secondary,
              themeClasses.interactions.iconHover
            )}
              aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <FaTimes className={themeClasses.icons.md} />
              ) : (
                <FaBars className={themeClasses.icons.md} />
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
            className={combineClasses(
              'md:hidden rounded-b-lg border border-t-0',
              themeClasses.menu.container
            )}
          >
            <div className="px-6 py-4 space-y-4">
              {/* Mobile Navigation */}
              {user ? (
                <div className="space-y-3">
                  {/* User Profile Link */}
                  <Link
                    href={`/${user.username}`}
                    className={combineClasses(
                      themeClasses.menu.item,
                      'gap-3 p-3 rounded-lg'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
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
                        themeClasses.bg.accent,
                        'flex items-center justify-center'
                      )}>
                        <FaUser className={combineClasses(
                          themeClasses.icons.md,
                          themeClasses.text.white
                        )} />
                      </div>
                    )}
                    <div>
                      <div className={combineClasses(
                        themeClasses.typography.weightMedium,
                        themeClasses.text.primary
                      )}>
                        {user.name}
                      </div>
                      <div className={combineClasses(
                        themeClasses.typography.bodySmall,
                        themeClasses.text.secondary
                      )}>
                        Xem hồ sơ
                      </div>
                    </div>
                  </Link>
                  
                  {/* Menu Items with consistent styling */}
                  <div className="space-y-1">
                    {/* Theme Toggle */}
                    <div className="px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className={combineClasses(
                          themeClasses.typography.bodySmall,
                          themeClasses.text.secondary
                        )}>Giao diện</span>
                        <ThemeToggle variant="simple" />
                      </div>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className={combineClasses(
                        themeClasses.menu.item,
                        'w-full px-3 py-2 rounded-md'
                      )}
                      aria-label="Đăng xuất khỏi tài khoản"
                    >
                      <FaSignOutAlt className={combineClasses(themeClasses.icons.sm, 'mr-3')} />
                      Đăng xuất
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
                    className={combineClasses(
                      componentClasses.button.ghost,
                      'w-full text-left justify-start',
                      themeClasses.interactive.touchTarget
                    )}
                    aria-label="Đăng nhập vào tài khoản"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={handleWriteClick}
                    className={combineClasses(
                      componentClasses.button.primary,
                      'w-full text-center',
                      themeClasses.interactive.touchTarget
                    )}
                    aria-label="Bắt đầu viết bài"
                  >
                    Bắt đầu
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
