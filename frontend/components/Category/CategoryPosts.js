// components/Category/CategoryPosts.js
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { StaggerContainer, FloatingElement, SpringDiv } from '../UI/SpringMotion';
import CategoryPostsHero from './CategoryPostsHero';
import MasonryPostGrid from './MasonryPostGrid';
import { useTranslations } from 'next-intl';

const CategoryPosts = ({
  categoryName,
  posts,
  isLoading,
  isError,
  setSize,
  isReachingEnd
}) => {
  const t = useTranslations();
  // Calculate category stats for hero section
  const categoryStats = useMemo(() => {
    const totalPosts = posts?.length || 0;
    const avgReadTime = Math.round((totalPosts * 5) + Math.random() * 3); // Simulated

    return {
      totalPosts,
      avgReadTime,
      lastUpdated: t('category.today')
    };
  }, [posts, t]);

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          className="text-center py-16 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h3 className="font-display font-bold text-xl text-slate-900 mb-4">
            {t('category.postsErrorTitle')}
          </h3>
          <p className="font-body text-slate-600 mb-6 leading-relaxed">
            {t('category.postsErrorMessage', { categoryName })}
          </p>

          <motion.button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-[var(--accent)] text-white
                       font-display font-semibold rounded-full hover:bg-[var(--accent-dark)]
                       transition-colors duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('category.retry')}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Enhanced Category Hero */}
      <CategoryPostsHero 
        categoryName={categoryName}
        stats={categoryStats}
      />

      {/* Masonry Posts Grid with Staggered Reveals */}
      <MasonryPostGrid
        posts={posts}
        isLoading={isLoading}
        setSize={setSize}
        isReachingEnd={isReachingEnd}
        categoryName={categoryName}
      />
    </div>
  );
};

export default CategoryPosts;
