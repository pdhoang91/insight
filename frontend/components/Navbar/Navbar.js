// components/Navbar/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaUserCircle, 
  FaCog, 
  FaBars, 
  FaTimes, 
  FaEdit,
  FaPaperPlane
} from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import TechSearchBar from '../Shared/TechSearchBar';

const Navbar = ({ onPublish }) => {
  const { user, setUser, setModalOpen } = useUser();
  const router = useRouter();
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
    setIsMobileMenuOpen(false); // Close mobile menu
    router.push('/');
  };

  const handleWriteClick = () => {
    setIsMobileMenuOpen(false); // Close mobile menu
    if (!user) {
      setModalOpen(true);
    } else {
      router.push('/write');
    }
  };

  const handlePublishClick = () => {
    setIsMobileMenuOpen(false); // Close mobile menu
    if (onPublish) {
      onPublish();
    }
  };

  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-terminal-dark/95 backdrop-blur-md border-b border-matrix-green/30' 
        : 'bg-terminal-black/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="text-lg font-bold text-matrix-green hover:text-matrix-light-green transition-colors">
              INSIGHT
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-6">
            {/* Search Bar */}
            <div className="w-56 lg:w-80">
              <TechSearchBar />
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Write Button - Hide on write/edit pages */}
              {router.pathname !== '/write' && !router.pathname.startsWith('/edit/') && (
                                  <button
                    onClick={handleWriteClick}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-matrix-green/10 text-matrix-green border border-matrix-green/30 rounded-md hover:bg-matrix-green hover:text-terminal-black transition-all duration-300 text-sm"
                  >
                    <FaEdit className="w-3 h-3" />
                    <span className="font-medium">Write</span>
                  </button>
              )}

              {/* Publish Button (show on write page) */}
              {router.pathname === '/write' && onPublish && (
                <button
                  onClick={handlePublishClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-hacker-yellow/10 text-hacker-yellow border border-hacker-yellow/30 rounded-md hover:bg-hacker-yellow hover:text-terminal-black transition-all duration-300 text-sm"
                >
                  <FaPaperPlane className="w-3 h-3" />
                  <span className="font-medium">Publish</span>
                </button>
              )}

              {/* Update Button (show on edit page) */}
              {router.pathname.startsWith('/edit/') && onPublish && (
                <button
                  onClick={handlePublishClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-matrix-cyan/10 text-matrix-cyan border border-matrix-cyan/30 rounded-md hover:bg-matrix-cyan hover:text-terminal-black transition-all duration-300 text-sm"
                >
                  <FaPaperPlane className="w-3 h-3" />
                  <span className="font-medium">Update</span>
                </button>
              )}

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-1.5 p-1.5 rounded-md hover:bg-terminal-gray transition-colors"
                  >
                    <div className="w-7 h-7 bg-matrix-green/20 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <FaUser className="w-3 h-3 text-matrix-green" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-terminal-gray border border-matrix-green/30 rounded-lg shadow-lg overflow-hidden"
                      >
                        {/* User Info - Clickable to go to profile */}
                        <Link
                          href={`/${user.username}`}
                          className="block p-4 border-b border-matrix-green/20 hover:bg-terminal-light transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-matrix-green/20 rounded-full flex items-center justify-center">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <FaUser className="w-5 h-5 text-matrix-green" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-text-primary">{user.name}</div>
                              <div className="text-sm text-text-muted">{user.email}</div>
                            </div>
                          </div>
                        </Link>

                        {/* Menu Items */}
                        <div className="py-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-hacker-red hover:bg-terminal-light transition-colors"
                          >
                            <FaSignOutAlt className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-3 py-1.5 text-sm text-text-secondary hover:text-matrix-green border border-matrix-green/30 rounded-md hover:border-matrix-green/50 transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-1 rounded-md hover:bg-terminal-gray transition-colors"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="w-4 h-4 text-text-primary" />
            ) : (
              <FaBars className="w-4 h-4 text-text-primary" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-terminal-dark border-t border-matrix-green/30 overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Search Bar */}
                <TechSearchBar onSearch={() => setIsMobileMenuOpen(false)} />

                {/* Actions */}
                <div className="space-y-2">
                  {/* Write Button - Hide on write/edit pages */}
                  {router.pathname !== '/write' && !router.pathname.startsWith('/edit/') && (
                    <button
                      onClick={handleWriteClick}
                      className="w-full flex items-center space-x-2 p-3 text-matrix-green hover:bg-terminal-gray rounded-lg transition-colors"
                    >
                      <FaEdit className="w-4 h-4" />
                      <span>Write</span>
                    </button>
                  )}

                  {/* Publish Button (show on write page) */}
                  {router.pathname === '/write' && onPublish && (
                    <button
                      onClick={handlePublishClick}
                      className="w-full flex items-center space-x-2 p-3 text-hacker-yellow hover:bg-terminal-gray rounded-lg transition-colors"
                    >
                      <FaPaperPlane className="w-4 h-4" />
                      <span>Publish</span>
                    </button>
                  )}

                  {/* Update Button (show on edit page) */}
                  {router.pathname.startsWith('/edit/') && onPublish && (
                    <button
                      onClick={handlePublishClick}
                      className="w-full flex items-center space-x-2 p-3 text-matrix-cyan hover:bg-terminal-gray rounded-lg transition-colors"
                    >
                      <FaPaperPlane className="w-4 h-4" />
                      <span>Update</span>
                    </button>
                  )}

                  {user ? (
                    <>
                      {/* User Info - Clickable to go to profile */}
                      <Link
                        href={`/${user.username}`}
                        className="w-full p-3 border border-matrix-green/20 rounded-lg hover:bg-terminal-gray transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-matrix-green/20 rounded-full flex items-center justify-center">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <FaUser className="w-5 h-5 text-matrix-green" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-text-primary">{user.name}</div>
                            <div className="text-sm text-text-muted">{user.email}</div>
                          </div>
                        </div>
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 p-3 text-hacker-red hover:bg-terminal-gray rounded-lg transition-colors"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full p-3 text-text-secondary hover:text-matrix-green border border-matrix-green/30 rounded-lg hover:border-matrix-green/50 transition-all"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;

