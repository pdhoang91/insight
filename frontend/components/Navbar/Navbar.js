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
  FaTerminal,
  FaGithub,
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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    // Removed explore and category links as requested
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-app/95 backdrop-blur-sm shadow-lg border-b border-border-primary' 
        : 'bg-app border-b border-border-primary'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Tech Style */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center">
              <span className="text-primary font-mono text-xl font-bold">&lt;</span>
              <span className="text-primary font-mono text-xl font-bold mx-1">Insight</span>
              <span className="text-primary font-mono text-xl font-bold">/&gt;</span>
            </div>
          </Link>

          {/* Desktop Navigation - Tech Style */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationLinks.map((link) => {
              if (link.authRequired && !user) return null;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center space-x-2 px-4 py-2 text-sm font-mono transition-all duration-200 rounded-lg ${
                    link.active
                      ? 'text-primary bg-elevated shadow-sm'
                      : 'text-secondary hover:text-primary hover:bg-elevated/50'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.active && (
                    <motion.div
                      className="absolute bottom-1 left-2 right-2 h-0.5 bg-primary rounded-full"
                      layoutId="navbar-indicator"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Enhanced Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <TechSearchBar placeholder="Search articles, topics..." />
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Write/Publish Button */}
                {router.pathname === '/write' ? (
                  <button
                    onClick={onPublish}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-mono transition-all duration-200 rounded-lg text-primary bg-elevated shadow-sm hover:bg-elevated/80"
                  >
                    <FaPaperPlane className="w-4 h-4" />
                    <span>Publish</span>
                  </button>
                ) : (
                  <Link
                    href="/write"
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-mono transition-all duration-200 rounded-lg text-secondary hover:text-primary hover:bg-elevated/50"
                  >
                    <FaEdit className="w-4 h-4" />
                    <span>Write</span>
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-secondary hover:text-primary rounded-lg transition-colors"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border-2 border-primary"
                      />
                    ) : (
                      <FaUserCircle className="w-8 h-8" />
                    )}
                    <span className="hidden sm:block font-mono text-sm">{user.name}</span>
                  </button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-surface border border-border-primary rounded-lg shadow-xl overflow-hidden"
                      >
                        <div className="py-2">
                          <Link
                            href={`/${user.username}`}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-elevated transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <FaUser className="w-4 h-4" />
                            <span>Profile</span>
                          </Link>
                          <div className="border-t border-border-primary my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-secondary hover:text-danger hover:bg-elevated transition-colors"
                          >
                            <FaSignOutAlt className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                {/* Write Button for non-authenticated users */}
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-secondary hover:text-primary hover:bg-elevated/50 font-mono text-sm rounded-lg transition-colors"
                >
                  <FaEdit className="w-4 h-4" />
                  <span>Write</span>
                </button>
                
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white font-mono text-sm rounded-lg hover:bg-primary-hover transition-colors"
                >
                  <FaTerminal className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-secondary hover:text-primary rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="w-5 h-5" />
              ) : (
                <FaBars className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-surface/95 backdrop-blur-sm border-t border-border-primary"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Search */}
              <div className="md:hidden mb-4">
                <TechSearchBar placeholder="Search..." />
              </div>

              {/* Write/Publish Link for Mobile */}
              {user ? (
                router.pathname === '/write' ? (
                  <button
                    onClick={() => {
                      onPublish();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-mono rounded-lg transition-colors bg-elevated text-primary w-full text-left"
                  >
                    <FaPaperPlane className="w-4 h-4" />
                    <span>Publish</span>
                  </button>
                ) : (
                  <Link
                    href="/write"
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-mono rounded-lg transition-colors text-secondary hover:text-primary hover:bg-elevated/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaEdit className="w-4 h-4" />
                    <span>Write</span>
                  </Link>
                )
              ) : (
                <button
                  onClick={() => {
                    setModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-3 py-2 text-sm font-mono rounded-lg transition-colors text-secondary hover:text-primary hover:bg-elevated/50 w-full text-left"
                >
                  <FaEdit className="w-4 h-4" />
                  <span>Write</span>
                </button>
              )}

              {!user && (
                <button
                  onClick={() => {
                    setModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-2 w-full mt-4 px-4 py-2 bg-primary text-white font-mono rounded-lg hover:bg-primary-hover transition-colors"
                >
                  <FaTerminal className="w-4 h-4" />
                  <span>Sign In</span>
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

