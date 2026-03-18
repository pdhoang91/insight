'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaEdit, FaBars, FaTimes } from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import { usePostContext } from '../../context/PostContext';
import SimpleSearchBar from '../Shared/SimpleSearchBar';
import { canWritePosts } from '../../services/authService';
import { useTranslations } from 'next-intl';

const Navbar = () => {
  const t = useTranslations();
  const { user, setUser, setModalOpen } = useUser();
  const { handlePublish } = usePostContext();
  const router = useRouter();
  const pathname = usePathname();
  const isWritePage = pathname === '/write' || pathname.startsWith('/edit/');

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
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
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsUserMenuOpen(false);
    router.push('/');
  };

  return (
    <nav
      style={{
        background: scrolled ? 'rgba(242, 237, 228, 0.96)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(26, 20, 16, 0.11)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-[1192px] mx-auto px-5 md:px-8">
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
              isWritePage ? (
                <button
                  onClick={() => handlePublish?.()}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    letterSpacing: '-0.01em',
                    background: 'var(--accent)',
                    color: 'var(--text-inverse)',
                    padding: '0.45rem 1.1rem',
                    borderRadius: '3px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  className="hover:opacity-85"
                >
                  {t('nav.publish')}
                </button>
              ) : (
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
                  <FaEdit style={{ width: 13, height: 13 }} />
                  {t('nav.write')}
                </button>
              )
            )}

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center"
                  style={{ padding: '2px', transition: 'opacity 0.2s' }}
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border-mid)' }}
                    />
                  ) : (
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: 'var(--bg-surface)',
                      border: '1.5px solid var(--border-mid)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FaUser style={{ width: 13, height: 13, color: 'var(--text-muted)' }} />
                    </div>
                  )}
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
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <FaUser style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                          </div>
                        )}
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
                        <FaSignOutAlt style={{ width: 13, height: 13 }} />
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
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ padding: '6px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
              className="hover:text-[var(--text)]"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen
                ? <FaTimes style={{ width: 18, height: 18 }} />
                : <FaBars style={{ width: 18, height: 18 }} />
              }
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
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'var(--bg)',
              borderTop: '1px solid var(--border)',
              overflow: 'hidden',
            }}
            className="md:hidden"
          >
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {user && canWritePosts(user) && !isWritePage && (
                <button
                  onClick={() => { router.push('/write'); setIsMobileMenuOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    fontFamily: 'var(--font-display)', fontSize: '0.875rem',
                    color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer',
                    letterSpacing: '-0.01em', padding: '6px 0',
                  }}
                >
                  <FaEdit style={{ width: 13, height: 13 }} />
                  {t('nav.write')}
                </button>
              )}

              {user ? (
                <>
                  <Link
                    href={`/${user.username}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaUser style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
                      </div>
                    )}
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', letterSpacing: '-0.01em' }}>
                      {user.name}
                    </span>
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                      fontFamily: 'var(--font-display)', fontSize: '0.875rem',
                      color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer',
                      letterSpacing: '-0.01em', padding: '6px 0', textAlign: 'left',
                    }}
                  >
                    <FaSignOutAlt style={{ width: 13, height: 13 }} />
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setModalOpen(true); setIsMobileMenuOpen(false); }}
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
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
