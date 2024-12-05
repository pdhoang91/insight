// components/Shared/Navbar.js
import { useState, useEffect } from 'react';

import Logo from './Logo';
import SearchForm from './SearchForm';
import MobileMenuButton from './MobileMenuButton';
import WritePublishButton from './WritePublishButton';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  // Handle scroll to show/hide navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and scrolled more than 100px
        setShowNavbar(false);
      } else {
        // Scrolling up
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full border-b border-gray-300 z-10 bg-white transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'
          }`}
      >
        {/* Left Section: Logo and Search */}
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-6">
            <Logo />

            {/* Search Form (visible on md and above) */}
            <div className="hidden md:block">
              <SearchForm />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <MobileMenuButton isOpen={mobileMenuOpen} toggle={toggleMobileMenu} />
          </div>

          {/* Right Section: Buttons and Avatar */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Write/Publish Button */}
            <WritePublishButton />

            {/* User Menu without isMobile prop (default: false) */}
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && <MobileMenu onClose={handleMobileMenuClose} />}
    </>
  );
};

export default Navbar;

