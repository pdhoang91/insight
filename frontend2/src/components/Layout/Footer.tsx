'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' }
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand and Social */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="text-xl font-bold text-gray-900">Blog Template</span>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Address */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 text-sm">Address</h4>
              <p className="text-gray-600 text-sm">
                Level 1, 12 Sample St, Sydney NSW 2000
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 text-sm">Phone Number</h4>
              <p className="text-gray-600 text-sm">
                1800 123 4567
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 text-sm">Email</h4>
              <p className="text-gray-600 text-sm">
                blog@template.io
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-gray-500 text-sm">
              © {currentYear} Blog Template. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-700 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gray-700 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-gray-700 transition-colors">
                Cookies Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 