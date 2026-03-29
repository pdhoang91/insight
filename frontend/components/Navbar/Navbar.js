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
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: compact ? '0.8rem' : '0.875rem',
          letterSpacing: '-0.01em',
          background: 'var(--accent)',
          color: 'var(--text-inverse)',
          padding: compact ? '0.4rem 0.85rem' : '0.45rem 1.1rem',
          borderRadius: '3px',
          border: 'none',
          cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
        className="hover:opacity-85"
      >
        {t('nav.publish')}
      </button>
    );
  }

  if (compact) {
    return (
      <button
        onClick={() => router.push('/write')}
        style={{ padding: '6px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
        className="hover:text-[var(--text)]"
        aria-label="Write"
      >
        <PencilSimple size={20} weight="regular" />
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push('/write')}
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 500,
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        transition: 'color 0.2s',
        letterSpacing: '-0.01em',
      }}
      className="hover:text-[var(--text)]"
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
        borderBottom: scrolled ? '1px solid rgba(26, 20, 16, 0.11)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-[1192px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.35rem',
              letterSpacing: '-0.03em',
              color: 'var(--text)',
              lineHeight: 1,
            }}
            className="hover:opacity-70 transition-opacity duration-200"
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
                  className="flex items-center"
                  style={{ padding: '2px', transition: 'opacity 0.2s' }}
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
                      style={{
                        position: 'absolute',
                        right: 0,
                        marginTop: '10px',
                        width: 220,
                        background: 'var(--bg)',
                        border: '1px solid var(--border-mid)',
                        borderRadius: '4px',
                        boxShadow: 'var(--shadow-lg)',
                        overflow: 'hidden',
                        zIndex: 50,
                      }}
                    >
                      <Link
                        href={`/${user.username}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Avatar src={user.avatar_url} name={user.name} size="md" />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', letterSpacing: '-0.01em' }} className="truncate">{user.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }} className="truncate">{user.email}</div>
                        </div>
                      </Link>

                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                          padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                          fontFamily: 'var(--font-display)', fontSize: '0.875rem',
                          color: 'var(--text-muted)', letterSpacing: '-0.01em',
                          transition: 'color 0.15s',
                          textAlign: 'left',
                        }}
                        className="hover:text-[var(--text)]"
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
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    letterSpacing: '-0.01em',
                    color: 'var(--text-muted)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    paddingBottom: '1px',
                    borderBottom: '1px solid var(--border-mid)',
                    transition: 'color 0.2s, border-color 0.2s',
                  }}
                  className="hover:text-[var(--text)] hover:border-[var(--accent)]"
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
              style={{ padding: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
              className="hover:text-[var(--text)]"
              aria-label="Explore"
            >
              <Compass size={20} weight="regular" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ padding: '6px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
              className="hover:text-[var(--text)]"
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
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          {user && (
            <motion.div variants={panelItem}>
              <Link
                href={`/${user.username}`}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Avatar src={user.avatar_url} name={user.name} size="sm" />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', letterSpacing: '-0.01em' }}>
                  {user.name}
                </span>
              </Link>
            </motion.div>
          )}

          <motion.div variants={panelItem} style={{ padding: '4px 0' }}>
            <LanguageTogglePill variant="panel" />
          </motion.div>

          {user ? (
            <motion.div variants={panelItem}>
              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  fontFamily: 'var(--font-display)', fontSize: '0.875rem',
                  color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer',
                  letterSpacing: '-0.01em', padding: '8px 0', textAlign: 'left',
                }}
              >
                <SignOut size={16} weight="regular" />
                {t('nav.logout')}
              </button>
            </motion.div>
          ) : (
            <motion.div variants={panelItem}>
              <button
                onClick={() => { setIsMobileMenuOpen(false); setModalOpen(true); }}
                style={{
                  fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem',
                  letterSpacing: '-0.01em', color: 'var(--text)',
                  background: 'none', border: '1px solid var(--border-mid)',
                  borderRadius: '3px', padding: '8px 16px', cursor: 'pointer',
                  alignSelf: 'flex-start',
                }}
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
