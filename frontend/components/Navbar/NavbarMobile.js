'use client';
// components/Navbar/NavbarMobile.js
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaEdit, FaBars, FaTimes } from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import { usePostContext } from '../../context/PostContext';
import SimpleSearchBar from '../Shared/SimpleSearchBar';
import { canWritePosts } from '../../services/authService';

const NavbarMobile = () => {
  const { user, setUser, setModalOpen } = useUser();
  const { handlePublish } = usePostContext();
  const router = useRouter();
  const pathname = usePathname();
  const isWritePage = pathname === '/write' || pathname.startsWith('/edit/');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef();

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

  const handleWriteClick = () => {
    setIsMobileMenuOpen(false);
    if (!user) {
      setModalOpen(true);
    } else {
      router.push('/write');
    }
  };

  return {
    mobileControls: (
      <div className="md:hidden flex items-center gap-2">
        <div className="flex-1 min-w-0 max-w-40">
          <SimpleSearchBar placeholder="Search..." />
        </div>

        {user && canWritePosts(user) && (
          isWritePage ? (
            <button
              onClick={() => handlePublish?.()}
              className="px-3 py-1.5 text-xs text-[#757575] hover:text-[#1a8917] transition-colors"
            >
              Publish
            </button>
          ) : (
            <button
              onClick={handleWriteClick}
              className="p-2 text-[#1a8917] transition-colors"
            >
              <FaEdit className="w-4 h-4" />
            </button>
          )
        )}

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-[#757575] hover:text-[#292929] transition-colors"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
        </button>
      </div>
    ),

    mobileMenu: (
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 right-0 z-50 bg-white border-b border-[#f2f2f2] shadow-lg"
          >
            <div className="px-6 py-4 space-y-3">
              {user ? (
                <>
                  <Link
                    href={`/${user.username}`}
                    className="flex items-center gap-3 py-3 text-[#292929] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#f2f2f2] flex items-center justify-center">
                        <FaUser className="w-4 h-4 text-[#b3b3b1]" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-[12px] text-[#757575]">View profile</div>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 py-3 text-sm text-[#757575] hover:text-[#292929] transition-colors"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="w-full py-3 text-sm text-[#292929] hover:text-[#1a8917] transition-colors text-left"
                >
                  Sign in
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    ),
  };
};

export default NavbarMobile;
