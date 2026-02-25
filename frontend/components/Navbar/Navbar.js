// components/Navbar/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaEdit, FaBars, FaTimes } from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import { usePostContext } from '../../context/PostContext';
import SimpleSearchBar from '../Shared/SimpleSearchBar';
import { canWritePosts } from '../../services/authService';
import LanguageSwitcher from '../Shared/LanguageSwitcher';
import { useTranslation } from 'next-i18next';

const Navbar = () => {
  const { t } = useTranslation('common');
  const { user, setUser, setModalOpen } = useUser();
  const { handlePublish } = usePostContext();
  const router = useRouter();
  const isWritePage = router.pathname === '/write' || router.pathname.startsWith('/edit/');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.asPath]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsUserMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-sm border-b border-medium-border' : 'border-b border-transparent'}`}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-serif text-2xl font-bold text-medium-text-primary hover:text-medium-accent-green transition-colors">
            Insight
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <div className="w-52 lg:w-64">
              <SimpleSearchBar placeholder={t('nav.search')} />
            </div>

            {user && canWritePosts(user) && (
              isWritePage ? (
                <button
                  onClick={() => handlePublish?.()}
                  className="px-4 py-2 text-sm font-medium bg-medium-accent-green text-white rounded-full hover:opacity-90 transition-opacity"
                >
                  {t('nav.publish')}
                </button>
              ) : (
                <button
                  onClick={() => user ? router.push('/write') : setModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-medium-text-secondary hover:text-medium-accent-green transition-colors"
                >
                  <FaEdit className="w-4 h-4" />
                  {t('nav.write')}
                </button>
              )
            )}

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center p-1 rounded-full transition-colors"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-medium-bg-secondary flex items-center justify-center">
                      <FaUser className="w-4 h-4 text-medium-text-muted" />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-medium-border rounded-lg shadow-lg overflow-hidden z-50"
                    >
                      <Link
                        href={`/${user.username}`}
                        className="flex items-center gap-3 px-4 py-3 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-medium-bg-secondary flex items-center justify-center">
                            <FaUser className="w-5 h-5 text-medium-text-muted" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-medium-text-primary truncate">{user.name}</div>
                          <div className="text-xs text-medium-text-muted truncate">{user.email}</div>
                        </div>
                      </Link>
                      <div className="border-t border-medium-border" />
                      <div className="px-4 py-2">
                        <LanguageSwitcher />
                      </div>
                      <div className="border-t border-medium-border" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-medium-text-secondary hover:text-medium-text-primary transition-colors"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        {t('nav.logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <LanguageSwitcher />
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-medium-accent-green border border-medium-accent-green rounded-full hover:opacity-80 transition-opacity"
                >
                  {t('nav.login')}
                </button>
              </>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-36">
              <SimpleSearchBar placeholder={t('nav.search')} />
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-medium-text-secondary hover:text-medium-text-primary transition-colors"
            >
              {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-medium-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {user && canWritePosts(user) && !isWritePage && (
                <button
                  onClick={() => { router.push('/write'); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-medium-text-secondary hover:text-medium-accent-green rounded-lg transition-colors"
                >
                  <FaEdit className="w-4 h-4" />
                  {t('nav.write')}
                </button>
              )}

              <div className="px-4 py-1">
                <LanguageSwitcher />
              </div>

              {user ? (
                <>
                  <Link
                    href={`/${user.username}`}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-medium-bg-secondary flex items-center justify-center">
                        <FaUser className="w-4 h-4 text-medium-text-muted" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-medium-text-primary">{user.name}</span>
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-medium-text-secondary hover:text-medium-text-primary rounded-lg transition-colors"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="w-full px-4 py-2.5 text-sm font-medium text-medium-accent-green border border-medium-accent-green rounded-lg hover:opacity-80 transition-opacity"
                >
                  {t('nav.login')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
