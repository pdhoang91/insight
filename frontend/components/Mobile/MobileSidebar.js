// components/Mobile/MobileSidebar.js
import React, { useState } from 'react';
import { FaTimes, FaUser, FaFire, FaCalendar, FaTag, FaEnvelope } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AuthorProfile from '../Author/AuthorProfile';
import PopularPostsWidget from '../Widgets/PopularPostsWidget';
import ArchiveWidget from '../Archive/ArchiveWidget';
import NewsletterWidget from '../Widgets/NewsletterWidget';

const MobileSidebar = ({ 
  isOpen, 
  onClose, 
  author, 
  posts = [], 
  categories = [],
  className = '' 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-medium-bg-primary/80 backdrop-blur-sm z-50 md:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className={`fixed top-0 right-0 bottom-0 w-80 max-w-[90vw] bg-medium-bg-primary z-50 overflow-y-auto ${className}`}
          >
            {/* Header */}
            <div className="sticky top-0 bg-medium-bg-primary border-b border-medium-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-medium-text-primary">
                About & More
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-medium-bg-secondary rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5 text-medium-text-secondary" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Author Profile - Compact Version */}
              <div className="bg-medium-bg-card rounded-lg p-4 border border-medium-border">
                <AuthorProfile 
                  author={author}
                  showFullBio={false}
                  showStats={false}
                  showFollowButton={true}
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-medium-bg-card rounded-lg border border-medium-border">
                  <div className="text-xl font-bold text-medium-text-primary">
                    {posts.length}
                  </div>
                  <div className="text-xs text-medium-text-muted">Posts</div>
                </div>
                <div className="text-center p-3 bg-medium-bg-card rounded-lg border border-medium-border">
                  <div className="text-xl font-bold text-medium-text-primary">
                    {categories.length}
                  </div>
                  <div className="text-xs text-medium-text-muted">Topics</div>
                </div>
                <div className="text-center p-3 bg-medium-bg-card rounded-lg border border-medium-border">
                  <div className="text-xl font-bold text-medium-text-primary">
                    1.2K
                  </div>
                  <div className="text-xs text-medium-text-muted">Readers</div>
                </div>
              </div>

              {/* Popular Posts - Mobile Optimized */}
              <PopularPostsWidget 
                limit={3} 
                showImages={true}
                className="bg-medium-bg-card"
              />

              {/* Categories - Compact */}
              <div className="bg-medium-bg-card rounded-lg p-4 border border-medium-border">
                <h3 className="text-lg font-serif font-bold text-medium-text-primary mb-3 flex items-center">
                  <FaTag className="w-4 h-4 mr-2 text-medium-accent-green" />
                  Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 8).map((category) => (
                    <span
                      key={category.id}
                      className="px-3 py-1 bg-medium-bg-secondary text-medium-text-secondary text-sm rounded-full hover:bg-medium-accent-green hover:text-white transition-colors cursor-pointer"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Newsletter - Mobile Optimized */}
              <NewsletterWidget />

              {/* Archive - Compact */}
              <ArchiveWidget posts={posts} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;
