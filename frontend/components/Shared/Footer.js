import React, { useState } from 'react';
import Link from 'next/link';
import { FaGithub, FaLinkedin, FaTwitter, FaYoutube, FaCode, FaRocket, FaEnvelope, FaArrowRight } from 'react-icons/fa';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const socialLinks = [
    { name: 'GitHub', icon: FaGithub, url: 'https://github.com', color: 'hover:text-gray-300' },
    { name: 'LinkedIn', icon: FaLinkedin, url: 'https://linkedin.com', color: 'hover:text-blue-400' },
    { name: 'Twitter', icon: FaTwitter, url: 'https://twitter.com', color: 'hover:text-blue-300' },
    { name: 'YouTube', icon: FaYoutube, url: 'https://youtube.com', color: 'hover:text-red-400' },
  ];

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubscribing(true);
    // TODO: Implement newsletter subscription API call
    setTimeout(() => {
      setIsSubscribing(false);
      setEmail('');
      // Show success message
    }, 1000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Brand Section - Takes more space */}
            <div className="lg:col-span-5">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaCode className="text-white w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Insight
                  </span>
                  <p className="text-xs text-gray-400 -mt-1">Tech Blog</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Your ultimate destination for cutting-edge tech tutorials, programming guides, and developer insights. 
                Join our community of passionate developers sharing knowledge and building the future.
              </p>
              
              {/* Newsletter Subscription */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center space-x-2 mb-3">
                  <FaEnvelope className="w-4 h-4 text-blue-400" />
                  <h4 className="font-semibold text-white">Developer Newsletter</h4>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Get weekly updates on latest tech tutorials, frameworks, and developer tools.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="flex-1 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium text-sm transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    {isSubscribing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <FaArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </form>
                <p className="text-xs text-gray-500 mt-2">
                  Join 15,000+ developers. No spam, unsubscribe anytime.
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 text-white">Explore</h3>
              <ul className="space-y-3">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/explore', label: 'All Posts' },
                  { href: '/category', label: 'Categories' },
                  { href: '/write', label: 'Write Article' },
                  { href: '/search', label: 'Search' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-blue-400 transition-colors flex items-center space-x-2 group"
                    >
                      <FaRocket className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community Links */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 text-white">Community</h3>
              <ul className="space-y-3">
                {[
                  { href: '/about', label: 'About Us' },
                  { href: '/contact', label: 'Contact' },
                  { href: '/contributors', label: 'Contributors' },
                  { href: '/guidelines', label: 'Guidelines' },
                  { href: '/help', label: 'Help Center' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Social */}
            <div className="lg:col-span-3">
              <h3 className="text-lg font-semibold mb-4 text-white">Connect & Legal</h3>
              
              {/* Social Links */}
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-3">Follow us on social media</p>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => {
                    const IconComponent = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 transition-all hover:scale-110 hover:shadow-lg ${social.color}`}
                        title={social.name}
                      >
                        <IconComponent className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Legal Links */}
              <ul className="space-y-2">
                {[
                  { href: '/privacy', label: 'Privacy Policy' },
                  { href: '/terms', label: 'Terms of Service' },
                  { href: '/cookies', label: 'Cookie Policy' },
                  { href: '/sitemap', label: 'Sitemap' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-gray-400 text-sm">
                © {currentYear} Insight Tech Blog. All rights reserved.
              </p>
              <div className="hidden md:flex items-center space-x-2 text-xs text-gray-500">
                <span>Made with</span>
                <span className="text-red-400">♥</span>
                <span>for developers</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 