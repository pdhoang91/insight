// components/Navbar/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBell, 
  FaUser, 
  FaSignOutAlt, 
  FaUserCircle, 
  FaBookmark, 
  FaCog, 
  FaBars, 
  FaTimes, 
  FaEdit,
  FaCode,
  FaTerminal,
  FaGithub
} from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import TechSearchBar from '../Shared/TechSearchBar';

const Navbar = () => {
  const { user, setUser, setModalOpen } = useUser();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef();

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
    router.push('/');
    setIsUserMenuOpen(false);
  };

  const navigationLinks = [
    { href: '/explore', label: 'Explore', active: router.pathname === '/explore', icon: FaCode },
    { href: '/category', label: 'Categories', active: router.pathname.startsWith('/category'), icon: FaTerminal },
    { href: '/write', label: 'Write', active: router.pathname === '/write', authRequired: true, icon: FaEdit },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Tech Style */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <span className="text-green-400 font-mono text-xl font-bold">&lt;</span>
              <span className="text-white font-mono text-xl font-bold mx-1">Insight</span>
              <span className="text-green-400 font-mono text-xl font-bold">/&gt;</span>
            </div>
          </Link>

          {/* Desktop Navigation - Terminal Style */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationLinks.map((link) => {
              if (link.authRequired && !user) return null;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center space-x-2 px-4 py-2 text-sm font-mono transition-all duration-200 rounded-md ${
                    link.active
                      ? 'text-green-400 bg-gray-800'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.active && (
                    <motion.div
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-green-400"
                      layoutId="navbar-indicator"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Enhanced Search Bar - Dark Theme */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <TechSearchBar placeholder="$ search technologies..." />
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            {user && (
              <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                <FaBell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              </button>
            )}

            {/* User Menu or Login */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-gray-900 text-sm font-mono font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-mono">{user.name}</span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm font-mono font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-400 font-mono">{user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href={`/${user.username}`}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors font-mono"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaUserCircle className="w-4 h-4" />
                          <span>~/profile</span>
                        </Link>

                        <Link
                          href="/me/bookmarks"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors font-mono"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaBookmark className="w-4 h-4" />
                          <span>~/bookmarks</span>
                        </Link>

                        <Link
                          href="/write"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors font-mono"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaEdit className="w-4 h-4" />
                          <span>~/write</span>
                        </Link>

                        <Link
                          href="/settings"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors font-mono"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaCog className="w-4 h-4" />
                          <span>~/settings</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-700 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors font-mono"
                        >
                          <FaSignOutAlt className="w-4 h-4" />
                          <span>exit()</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-green-400 font-mono text-sm border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-green-400 transition-all duration-200 hover:shadow-lg hover:shadow-green-400/20"
              >
                <FaTerminal className="w-4 h-4" />
                <span>login()</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
            >
              {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <TechSearchBar placeholder="$ search..." />
        </div>
      </div>

      {/* Mobile Menu - Terminal Style */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-gray-800 border-t border-gray-700"
          >
            <div className="px-4 py-4 space-y-2">
              {navigationLinks.map((link) => {
                if (link.authRequired && !user) return null;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-3 px-3 py-2 text-sm font-mono rounded-lg transition-colors ${
                      link.active
                        ? 'bg-gray-700 text-green-400'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {!user && (
                <button
                  onClick={() => {
                    setModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-2 w-full mt-4 px-4 py-2 bg-gray-700 text-green-400 font-mono border border-gray-600 rounded-lg hover:bg-gray-600 hover:border-green-400 transition-all"
                >
                  <FaTerminal className="w-4 h-4" />
                  <span>login()</span>
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

