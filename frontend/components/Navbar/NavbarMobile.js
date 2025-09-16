// components/Navbar/NavbarMobile.js
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaEdit,
  FaBars, 
  FaTimes
} from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { usePostContext } from '../../context/PostContext';
import ThemeToggle from '../UI/ThemeToggle';
import SimpleSearchBar from '../Shared/SimpleSearchBar';
import { canWritePosts } from '../../services/authService';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const NavbarMobile = () => {
  const { user, setUser, setModalOpen } = useUser();
  const { theme, mounted } = useTheme();
  const { handlePublish } = usePostContext();
  const router = useRouter();
  const isWritePage = router.pathname === '/write' || router.pathname.startsWith('/edit/');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef();

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
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

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Don't render until theme is mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return {
    // Mobile Navigation Controls
    mobileControls: (
      <div className="md:hidden flex items-center gap-2">
        {/* Mobile Search */}
        <div className={combineClasses(
          'flex-1 max-w-40 sm:max-w-48',
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
                className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 min-h-[36px] text-xs text-medium-text-secondary hover:text-medium-accent-green hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200 ease-out flex items-center"
                aria-label="Đăng bài viết"
              >
                Đăng
              </button>
            ) : (
              <button
                onClick={handleWriteClick}
                className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 min-h-[36px] text-xs text-medium-text-secondary hover:text-medium-accent-green hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200 ease-out flex items-center p-2"
                aria-label="Viết bài mới"
              >
                <FaEdit className={combineClasses(
                  themeClasses.icons.sm,
                  'text-medium-accent-green'
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
    ),

    // Mobile Menu Dropdown
    mobileMenu: (
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={combineClasses(
              'md:hidden absolute top-full left-0 right-0 z-50',
              'bg-medium-bg-primary border-medium-border border border-t-0',
              'rounded-b-lg shadow-2xl',
              '[&]:bg-opacity-100 [&]:backdrop-blur-none'
            )}
            style={{ 
              backgroundColor: 'var(--medium-bg-primary)',
              opacity: '1',
              backdropFilter: 'none'
            }}
          >
            <div className="px-6 py-6 space-y-4">
              {/* Mobile Navigation */}
              {user ? (
                <div className="space-y-3">
                  {/* User Profile Link */}
                  <Link
                    href={`/${user.username}`}
                    className={combineClasses(
                      'px-4 py-3 text-sm cursor-pointer flex items-center gap-3 rounded-lg',
                      'text-medium-text-primary bg-transparent',
                      'hover:bg-medium-bg-secondary hover:text-medium-text-primary',
                      'transition-all duration-200 ease-out'
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
                        'w-full px-4 py-3 text-sm cursor-pointer flex items-center gap-3 rounded-lg',
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
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 min-h-[44px] text-sm text-medium-text-secondary hover:text-medium-accent-green hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200 ease-out flex items-center w-full text-left justify-start"
                    aria-label="Đăng nhập vào tài khoản"
                  >
                    Đăng nhập
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  };
};

export default NavbarMobile;
