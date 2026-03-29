'use client';
import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { SignOut, PencilSimple, List, Compass } from '@phosphor-icons/react';
import { useUser } from '../../context/UserContext';
import { usePostContext } from '../../context/PostContext';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { useScrollEffect } from '../../hooks/useScrollEffect';
import SimpleSearchBar from '../Shared/SimpleSearchBar';
import { canWritePosts } from '../../services/authService';
import { useTranslations } from 'next-intl';
import MobileSlidePanel from './MobileSlidePanel';
import LanguageTogglePill from '../Shared/LanguageTogglePill';
import Avatar from '../UI/Avatar';

const panelContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const panelItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30, mass: 0.3 },
  },
};

/** Write or Publish button depending on current page */
const NavWriteAction = ({ isWritePage, onPublish, compact = false }) => {
  const t = useTranslations();
  const router = useRouter();

  if (isWritePage) {
    return (
      <button
        onClick={() => onPublish?.()}
        className={[
          'font-display font-semibold tracking-tight rounded-[3px] border-none cursor-pointer',
          'bg-[var(--accent)] text-[var(--text-inverse)] transition-opacity duration-200 hover:opacity-85',
          compact ? 'text-[0.8rem] px-[0.85rem] py-[0.4rem]' : 'text-[0.875rem] px-[1.1rem] py-[0.45rem]',
        ].join(' ')}
      >
        {t('nav.publish')}
      </button>
    );
  }

  if (compact) {
    return (
      <button
        onClick={() => router.push('/write')}
        className="p-[6px] text-[var(--text-muted)] bg-transparent border-none cursor-pointer transition-colors duration-200 hover:text-[var(--text)]"
        aria-label="Write"
      >
        <PencilSimple size={20} weight="regular" />
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push('/write')}
      className="flex items-center gap-[6px] font-display font-medium text-[0.875rem] tracking-tight text-[var(--text-muted)] bg-transparent border-none cursor-pointer transition-colors duration-200 hover:text-[var(--text)]"
    >
      <PencilSimple size={16} weight="regular" />
      {t('nav.write')}
    </button>
  );
};

const Navbar = () => {
  const t = useTranslations();
  const { user, setUser, setModalOpen } = useUser();
  const { handlePublish } = usePostContext();
  const pathname = usePathname();
  const router = useRouter();
  const isWritePage = pathname === '/write' || pathname.startsWith('/edit/');

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrolled = useScrollEffect(20);
  const userMenuRef = useRef();

  const closeUserMenu = useCallback(() => setIsUserMenuOpen(false), []);
  useOutsideClick(userMenuRef, closeUserMenu);

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsUserMenuOpen(false);
    router.push('/');
  };

  return (
    <>
    <nav
      style={{
        background: scrolled ? 'var(--bg)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-[1192px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            className="font-display font-extrabold text-[1.35rem] tracking-[-0.03em] leading-none text-[var(--text)] hover:opacity-70 transition-opacity duration-200"
          >
            Insight
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            <div className="w-52 lg:w-60">
              <SimpleSearchBar placeholder={t('nav.search')} />
            </div>

            {user && canWritePosts(user) && (
              <NavWriteAction isWritePage={isWritePage} onPublish={handlePublish} />
            )}

            <LanguageTogglePill />

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center p-[2px] transition-opacity duration-200"
                >
                  <Avatar src={user.avatar_url} name={user.name} size="sm" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-[10px] w-[220px] bg-[var(--bg)] border border-[var(--border-mid)] rounded-[4px] shadow-[var(--shadow-lg)] overflow-hidden z-50"
                    >
                      <Link
                        href={`/${user.username}`}
                        className="flex items-center gap-[10px] px-4 py-3"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Avatar src={user.avatar_url} name={user.name} size="md" />
                        <div className="min-w-0">
                          <div className="font-display font-semibold text-sm tracking-tight text-[var(--text)] truncate">{user.name}</div>
                          <div className="text-xs text-[var(--text-faint)] truncate">{user.email}</div>
                        </div>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-[10px] bg-transparent border-none cursor-pointer font-display text-sm tracking-tight text-[var(--text-muted)] text-left transition-colors duration-150 hover:text-[var(--text)]"
                      >
                        <SignOut size={16} weight="regular" />
                        {t('nav.logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setModalOpen(true)}
                  className="font-display font-medium text-sm tracking-tight text-[var(--text-muted)] bg-transparent border-none cursor-pointer transition-colors duration-200 hover:text-[var(--text)]"
                >
                  {t('nav.login')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-32">
              <SimpleSearchBar placeholder={t('nav.search')} />
            </div>
            {user && canWritePosts(user) && (
              <NavWriteAction isWritePage={isWritePage} onPublish={handlePublish} compact />
            )}
            <Link
              href="/explore"
              className="p-[6px] flex items-center text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--text)]"
              aria-label="Explore"
            >
              <Compass size={20} weight="regular" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-[6px] text-[var(--text-muted)] bg-transparent border-none cursor-pointer transition-colors duration-200 hover:text-[var(--text)]"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <List size={20} weight="regular" />
            </button>
          </div>
        </div>
      </div>

    </nav>

      {/* Panels rendered outside <nav> to avoid backdrop-filter containing block */}
      <MobileSlidePanel
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      >
        <motion.div
          variants={panelContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-2"
        >
          {user && (
            <motion.div variants={panelItem}>
              <Link
                href={`/${user.username}`}
                className="flex items-center gap-[10px] py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Avatar src={user.avatar_url} name={user.name} size="sm" />
                <span className="font-display font-semibold text-[0.9rem] tracking-tight text-[var(--text)]">
                  {user.name}
                </span>
              </Link>
            </motion.div>
          )}

          <motion.div variants={panelItem} className="py-1">
            <LanguageTogglePill variant="panel" />
          </motion.div>

          {user ? (
            <motion.div variants={panelItem}>
              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-2 w-full font-display text-sm tracking-tight text-[var(--text-muted)] bg-transparent border-none cursor-pointer py-2 text-left"
              >
                <SignOut size={16} weight="regular" />
                {t('nav.logout')}
              </button>
            </motion.div>
          ) : (
            <motion.div variants={panelItem}>
              <button
                onClick={() => { setIsMobileMenuOpen(false); setModalOpen(true); }}
                className="font-display font-medium text-sm tracking-tight text-[var(--text)] bg-transparent border border-[var(--border-mid)] rounded-[3px] px-4 py-2 cursor-pointer self-start"
              >
                {t('nav.login')}
              </button>
            </motion.div>
          )}
        </motion.div>
      </MobileSlidePanel>
    </>
  );
};

export default Navbar;
