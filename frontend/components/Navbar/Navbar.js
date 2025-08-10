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
  FaPaperPlane,
  FaCode,
  FaLaptopCode,
  FaServer,
  FaBug,
  FaDatabase,
  FaRocket
} from 'react-icons/fa';
import { 
  SiVim, 
  SiVisualstudiocode, 
  SiLinux, 
  SiDocker,
  SiKubernetes,
  SiPython,
  SiJavascript,
  SiReact
} from 'react-icons/si';
import { useUser } from '../../context/UserContext';
import TechSearchBar from '../Shared/TechSearchBar';

const Navbar = ({ onPublish }) => {
  const { user, setUser, setModalOpen } = useUser();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const userMenuRef = useRef();

  // Terminal clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
        ? 'bg-terminal-black/95 backdrop-blur-terminal shadow-neon-green border-b border-matrix-green/30' 
        : 'bg-terminal-black border-b border-matrix-green/30'
    }`}>
      {/* Terminal Header Bar */}
      <div className="bg-terminal-gray border-b border-matrix-green/20 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-6 text-xs font-mono">
          <div className="flex items-center space-x-4 text-matrix-green">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-hacker-red rounded-full animate-terminal-blink"></span>
              <span className="w-2 h-2 bg-hacker-yellow rounded-full"></span>
              <span className="w-2 h-2 bg-matrix-green rounded-full"></span>
            </span>
            <span className="text-text-secondary">insight@terminal:~$</span>
          </div>
          <div className="flex items-center space-x-4 text-text-muted">
            <span className="hidden md:inline">CPU: 23%</span>
            <span className="hidden md:inline">RAM: 4.2GB</span>
            <span className="text-matrix-green font-bold terminal-cursor">{currentTime}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Hacker Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-all duration-300 group">
            <div className="flex items-center relative">
              <div className="text-matrix-green font-matrix text-2xl font-bold flex items-center">
                <span className="animate-neon-pulse">[</span>
                <span className="mx-1 text-gradient-matrix">INSIGHT</span>
                <span className="animate-neon-pulse">]</span>
              </div>
              <div className="ml-2 text-xs text-text-muted font-mono">
                <span className="text-hacker-yellow">v2.0</span>
              </div>
            </div>
            {/* ASCII Art decoration */}
            <div className="hidden lg:block text-xs text-matrix-green/50 font-mono leading-none">
              <div>{'>'}</div>
              <div>{'_'}</div>
            </div>
          </Link>

          {/* Desktop Navigation - Enhanced Terminal Style */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationLinks.map((link) => {
              if (link.authRequired && !user) return null;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center space-x-2 px-4 py-2 text-sm font-mono transition-all duration-300 rounded-lg border ${
                    link.active
                      ? 'text-matrix-green bg-terminal-gray shadow-neon-green border-matrix-green/50'
                      : 'text-text-secondary hover:text-matrix-green hover:bg-terminal-gray/50 border-transparent hover:border-matrix-green/30'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.active && (
                    <motion.div
                      className="absolute bottom-1 left-2 right-2 h-0.5 bg-matrix-green rounded-full shadow-neon-green"
                      layoutId="navbar-indicator"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Enhanced Search Bar with Terminal Styling */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-matrix-green">
                <FaTerminal className="w-4 h-4" />
              </div>
              <TechSearchBar placeholder="$ grep -r 'articles' --include='*.tech'" />
            </div>
          </div>

          {/* Enhanced User Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Write/Publish Button - Terminal Style */}
                {(router.pathname === '/write' || router.pathname.startsWith('/edit/')) ? (
                  <button
                    onClick={onPublish}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-mono transition-all duration-300 rounded-lg bg-matrix-green/20 text-matrix-green border border-matrix-green hover:bg-matrix-green hover:text-terminal-black shadow-neon-green hover:shadow-neon-cyan"
                  >
                    <FaRocket className="w-4 h-4" />
                    <span>DEPLOY</span>
                  </button>
                ) : (
                  <Link
                    href="/write"
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-mono transition-all duration-300 rounded-lg text-text-secondary hover:text-matrix-green hover:bg-terminal-gray/50 border border-transparent hover:border-matrix-green/30"
                  >
                    <FaCode className="w-4 h-4" />
                    <span>{'<CODE/>'}</span>
                  </Link>
                )}

                {/* System Stats Mini Display */}
                <div className="hidden xl:flex items-center space-x-2 px-3 py-1 bg-terminal-gray rounded border border-matrix-green/30 text-xs font-mono">
                  <SiReact className="w-3 h-3 text-matrix-cyan" />
                  <span className="text-text-muted">|</span>
                  <span className="text-matrix-green">{user.posts_count || 0}</span>
                  <span className="text-text-muted">posts</span>
                </div>

                {/* Enhanced User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-text-secondary hover:text-matrix-green rounded-lg transition-all duration-300 hover:bg-terminal-gray/50 border border-transparent hover:border-matrix-green/30"
                  >
                    {user.avatar ? (
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full border-2 border-matrix-green shadow-neon-green"
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-matrix-green rounded-full animate-terminal-blink"></div>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-terminal-gray rounded-full border-2 border-matrix-green flex items-center justify-center">
                        <FaTerminal className="w-4 h-4 text-matrix-green" />
                      </div>
                    )}
                    <span className="hidden sm:block font-mono text-sm">{user.username || user.name}</span>
                  </button>

                  {/* Enhanced User Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-terminal-dark border border-matrix-green rounded-lg shadow-neon-green overflow-hidden"
                      >
                        {/* Terminal Header */}
                        <div className="bg-terminal-gray px-4 py-2 border-b border-matrix-green/30">
                          <div className="flex items-center space-x-2 text-xs font-mono text-matrix-green">
                            <span className="flex space-x-1">
                              <span className="w-2 h-2 bg-hacker-red rounded-full"></span>
                              <span className="w-2 h-2 bg-hacker-yellow rounded-full"></span>
                              <span className="w-2 h-2 bg-matrix-green rounded-full"></span>
                            </span>
                            <span>user@{user.username || 'anonymous'}</span>
                          </div>
                        </div>
                        
                        <div className="py-2">
                          <Link
                            href={`/${user.username}`}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-text-secondary hover:text-matrix-green hover:bg-terminal-gray transition-all duration-300 font-mono"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <FaUser className="w-4 h-4" />
                            <span>$ cat ~/.profile</span>
                          </Link>
                          
                          <div className="flex items-center space-x-3 px-4 py-2 text-xs text-text-muted font-mono">
                            <SiLinux className="w-3 h-3 text-matrix-cyan" />
                            <span>Status: Online</span>
                            <span className="ml-auto text-matrix-green">●</span>
                          </div>
                          
                          <div className="border-t border-matrix-green/30 my-1"></div>
                          
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-text-secondary hover:text-hacker-red hover:bg-terminal-gray transition-all duration-300 font-mono"
                          >
                            <FaSignOutAlt className="w-4 h-4" />
                            <span>$ exit</span>
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
                  className="flex items-center space-x-2 px-4 py-2 text-text-secondary hover:text-matrix-green hover:bg-terminal-gray/50 font-mono text-sm rounded-lg transition-all duration-300 border border-transparent hover:border-matrix-green/30"
                >
                  <FaLaptopCode className="w-4 h-4" />
                  <span>{'<CODE/>'}</span>
                </button>
                
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-matrix-green/20 text-matrix-green font-mono text-sm rounded-lg hover:bg-matrix-green hover:text-terminal-black transition-all duration-300 border border-matrix-green shadow-neon-green"
                >
                  <FaTerminal className="w-4 h-4" />
                  <span>$ login</span>
                </button>
              </>
            )}

            {/* Mobile Menu Button - Enhanced */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-text-secondary hover:text-matrix-green rounded-lg transition-all duration-300 hover:bg-terminal-gray/50 border border-transparent hover:border-matrix-green/30"
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

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-terminal-dark/95 backdrop-blur-terminal border-t border-matrix-green/30"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Terminal Header */}
              <div className="flex items-center justify-between text-xs font-mono text-matrix-green mb-4 pb-2 border-b border-matrix-green/30">
                <span>mobile@terminal:~$</span>
                <span className="text-text-muted">{currentTime}</span>
              </div>

              {/* Mobile Search */}
              <div className="md:hidden mb-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-matrix-green">
                    <FaTerminal className="w-4 h-4" />
                  </div>
                  <TechSearchBar placeholder="$ search..." />
                </div>
              </div>

              {/* Write/Publish Link for Mobile */}
              {user ? (
                (router.pathname === '/write' || router.pathname.startsWith('/edit/')) ? (
                  <button
                    onClick={() => {
                      onPublish();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-3 py-3 text-sm font-mono rounded-lg transition-all duration-300 bg-matrix-green/20 text-matrix-green w-full text-left border border-matrix-green"
                  >
                    <FaRocket className="w-4 h-4" />
                    <span>$ deploy --production</span>
                  </button>
                ) : (
                  <Link
                    href="/write"
                    className="flex items-center space-x-3 px-3 py-3 text-sm font-mono rounded-lg transition-all duration-300 text-text-secondary hover:text-matrix-green hover:bg-terminal-gray/50 border border-transparent hover:border-matrix-green/30"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaCode className="w-4 h-4" />
                    <span>$ vim new_post.md</span>
                  </Link>
                )
              ) : (
                <button
                  onClick={() => {
                    setModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-3 py-3 text-sm font-mono rounded-lg transition-all duration-300 text-text-secondary hover:text-matrix-green hover:bg-terminal-gray/50 w-full text-left border border-transparent hover:border-matrix-green/30"
                >
                  <FaLaptopCode className="w-4 h-4" />
                  <span>$ create --new-post</span>
                </button>
              )}

              {!user && (
                <button
                  onClick={() => {
                    setModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-2 w-full mt-4 px-4 py-3 bg-matrix-green/20 text-matrix-green font-mono rounded-lg hover:bg-matrix-green hover:text-terminal-black transition-all duration-300 border border-matrix-green"
                >
                  <FaTerminal className="w-4 h-4" />
                  <span>$ sudo login</span>
                </button>
              )}

              {/* System Info */}
              <div className="mt-4 pt-4 border-t border-matrix-green/30">
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="flex items-center space-x-2 text-text-muted">
                    <SiReact className="w-3 h-3 text-matrix-cyan" />
                    <span>React v18</span>
                  </div>
                  <div className="flex items-center space-x-2 text-text-muted">
                    <SiJavascript className="w-3 h-3 text-hacker-yellow" />
                    <span>ES2023</span>
                  </div>
                  <div className="flex items-center space-x-2 text-text-muted">
                    <FaServer className="w-3 h-3 text-matrix-green" />
                    <span>Online</span>
                  </div>
                  <div className="flex items-center space-x-2 text-text-muted">
                    <FaDatabase className="w-3 h-3 text-hacker-purple" />
                    <span>Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

