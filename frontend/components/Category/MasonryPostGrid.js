'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { StaggerContainer, SpringDiv } from '../UI/SpringMotion';
import { useTranslations, useLocale } from 'next-intl';

const MasonryPostGrid = ({
  posts = [],
  isLoading,
  setSize,
  isReachingEnd,
  categoryName
}) => {
  const t = useTranslations();
  const locale = useLocale();
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);

  // Format posts for masonry layout
  useEffect(() => {
    if (posts && posts.length > 0) {
      const formattedPosts = posts.map((post, index) => ({
        ...post,
        gridSpan: getGridSpan(index),
        aspectRatio: getAspectRatio(index),
      }));
      setDisplayedPosts(formattedPosts);
    }
  }, [posts]);

  // Dynamic grid spanning for masonry effect
  const getGridSpan = (index) => {
    // Create asymmetric pattern following DESIGN_VARIANCE=8
    const patterns = [
      'md:col-span-2 md:row-span-2', // Large featured
      'md:col-span-1 md:row-span-1', // Regular
      'md:col-span-1 md:row-span-1', // Regular
      'md:col-span-2 md:row-span-1', // Wide
      'md:col-span-1 md:row-span-2', // Tall
      'md:col-span-1 md:row-span-1', // Regular
    ];
    return patterns[index % patterns.length];
  };

  const getAspectRatio = (index) => {
    const ratios = ['aspect-[4/3]', 'aspect-[3/4]', 'aspect-square', 'aspect-[16/9]'];
    return ratios[index % ratios.length];
  };

  // Load more posts
  const handleLoadMore = useCallback(async () => {
    if (isReachingEnd || loadingMore) return;
    
    setLoadingMore(true);
    try {
      await setSize((prev) => prev + 1);
    } finally {
      setLoadingMore(false);
    }
  }, [setSize, isReachingEnd, loadingMore]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isReachingEnd && !loadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const target = document.getElementById('load-more-trigger');
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, [handleLoadMore, isReachingEnd, loadingMore]);

  if (!posts || posts.length === 0) {
    return (
      <EmptyState categoryName={categoryName} />
    );
  }

  return (
    <div className="w-full">
      
      {/* Masonry Grid */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-min">
        <AnimatePresence mode="popLayout">
          {displayedPosts.map((post, index) => (
            <motion.article
              key={post.id}
              className={`group ${post.gridSpan}`}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: (index % 12) * 0.05, // Stagger in batches
              }}
              whileHover={{ y: -4 }}
            >
              <Link href={`/posts/${post.slug}`}>
                <div className="bg-white/80 backdrop-blur-sm rounded-[1.5rem] 
                               border border-slate-200/50 overflow-hidden
                               shadow-[0_10px_30px_-10px_rgba(26,20,16,0.03)]
                               hover:shadow-[0_20px_40px_-10px_rgba(26,20,16,0.06)]
                               transition-all duration-300 h-full flex flex-col">
                  
                  {/* Post Image */}
                  {post.image_url && (
                    <div className={`relative ${post.aspectRatio} overflow-hidden`}>
                      <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent 
                                     opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Reading time badge */}
                      <motion.div
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm 
                                   px-3 py-1 rounded-full text-xs font-display font-semibold 
                                   text-slate-700"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 25 }}
                      >
                        {post.reading_time || '5'} {t('category.min')}
                      </motion.div>
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      
                      {/* Category tag */}
                      <motion.span 
                        className="inline-block px-3 py-1 bg-[var(--accent-light)] 
                                   text-[var(--accent)] rounded-full text-xs font-display 
                                   font-semibold uppercase tracking-wide"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        {categoryName}
                      </motion.span>

                      {/* Title */}
                      <h2 className="font-display font-bold text-lg lg:text-xl 
                                    text-slate-900 leading-tight line-clamp-3
                                    group-hover:text-[var(--accent)] transition-colors duration-300">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="font-body text-slate-600 text-sm leading-relaxed 
                                     line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Post Meta */}
                    <div className="flex items-center justify-between mt-4 pt-4 
                                   border-t border-slate-100">
                      <div className="flex items-center space-x-3">
                        {post.author?.avatar_url && (
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={post.author.avatar_url}
                              alt={post.author.full_name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="text-xs text-slate-500">
                          <div className="font-display font-medium">
                            {post.author?.full_name || 'Anonymous'}
                          </div>
                          <div className="opacity-75">
                            {new Date(post.created_at).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                          </div>
                        </div>
                      </div>

                      <motion.div
                        className="text-[var(--accent)] opacity-0 group-hover:opacity-100 
                                   transition-opacity duration-300"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </AnimatePresence>
      </StaggerContainer>

      {/* Load More Trigger */}
      <div 
        id="load-more-trigger" 
        className="flex justify-center py-16"
      >
        {loadingMore && (
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent 
                           rounded-full animate-spin" />
            <span className="font-display font-medium text-slate-600">
              {t('category.loadingMore')}
            </span>
          </motion.div>
        )}

        {isReachingEnd && posts.length > 0 && (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <div className="inline-flex items-center space-x-2 text-slate-500">
              <div className="w-8 h-px bg-slate-300" />
              <span className="font-display text-sm">{t('category.allPostsShown')}</span>
              <div className="w-8 h-px bg-slate-300" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = ({ categoryName }) => {
  const t = useTranslations();
  return (
    <div className="w-full">
      <motion.div
        className="text-center py-24"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full
                       flex items-center justify-center mb-8">
          <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <h3 className="font-display font-bold text-2xl text-slate-900 mb-4">
          {t('category.noPostsTitle')}
        </h3>
        <p className="font-body text-lg text-slate-600 max-w-md mx-auto mb-8 leading-relaxed">
          {t('category.noPostsMessage', { categoryName })}
        </p>

        <Link href="/category">
          <motion.div
            className="inline-flex items-center px-6 py-3 bg-[var(--accent)] text-white
                       font-display font-semibold rounded-full hover:bg-[var(--accent-dark)]
                       transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {t('category.allCategories')}
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
};

export default MasonryPostGrid;