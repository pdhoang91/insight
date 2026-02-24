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
import { usePostContext } from '../../context/PostContext';
import SimpleSearchBar from '../Shared/SimpleSearchBar';
import { canWritePosts } from '../../services/authService';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const NavbarMobile = () => {
  const { user, setUser, setModalOpen } = useUser();
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


  return {
    // Mobile Navigation Controls
    mobileControls: (
      <div className="md:hidden flex items-center gap-1 sm:gap-2">
        {/* Mobile Search */}
        <div className={combineClasses(
          'flex-1 min-w-0 max-w-32 xs:max-w-40 sm:max-w-52',
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
                className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-2 sm:px-3 py-1.5 min-h-[32px] sm:min-h-[36px] text-xs text-medium-text-secondary hover:text-medium-accent-green hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200 ease-out flex items-center"
                aria-label="Đăng bài viết"
              >
                Đăng
              </button>
            ) : (
              <button
                onClick={handleWriteClick}
                className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed p-1.5 sm:p-2 min-h-[32px] sm:min-h-[36px] text-xs text-medium-text-secondary hover:text-medium-accent-green hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200 ease-out flex items-center"
                aria-label="Viết bài mới"
              >
                <FaEdit className={combineClasses(
                  'w-3 h-3 sm:w-4 sm:h-4',
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
            'min-h-[32px] sm:min-h-[36px] min-w-[32px] sm:min-w-[36px] flex items-center justify-center',
            'rounded-lg p-1.5 sm:p-2',
            themeClasses.text.secondary,
            'hover:bg-medium-bg-secondary transition-all duration-200 ease-out'
          )}
          aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <FaBars className="w-4 h-4 sm:w-5 sm:h-5" />
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
              themeClasses.bg.card,
              'border border-t-0',
              themeClasses.border.primary,
              'rounded-b-lg shadow-2xl backdrop-blur-sm'
            )}
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
                        'bg-medium-bg-secondary',
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
