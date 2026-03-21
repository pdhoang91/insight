'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FloatingElement, PulseElement, SpringDiv } from '../UI/SpringMotion';
import { useTranslations } from 'next-intl';

const CategoryPostsHero = ({ categoryName, stats }) => {
  const t = useTranslations();
  const capitalizedName = categoryName?.charAt(0).toUpperCase() + categoryName?.slice(1);

  return (
    <section className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="category-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#category-pattern)" />
        </svg>
      </div>

      <div className="relative py-12 lg:py-16">
        
        {/* Asymmetric Layout - Breaking the center bias */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Main Content - Left Aligned */}
          <div className="lg:col-span-8 lg:col-start-2 space-y-6">
            
            {/* Breadcrumb Navigation */}
            <motion.nav
              className="flex items-center space-x-2 text-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
            >
              <Link 
                href="/" 
                className="font-display text-slate-500 hover:text-[var(--accent)] 
                           transition-colors duration-200"
              >
                {t('category.home')}
              </Link>
              <span className="text-slate-300">→</span>
              <Link 
                href="/category" 
                className="font-display text-slate-500 hover:text-[var(--accent)] 
                           transition-colors duration-200"
              >
                {t('sidebar.categories')}
              </Link>
              <span className="text-slate-300">→</span>
              <span className="font-display font-semibold text-[var(--accent)]">
                {capitalizedName}
              </span>
            </motion.nav>

            {/* Category Title */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            >
              <div className="flex items-center space-x-4">
                <h1 className="font-display font-bold text-4xl lg:text-6xl 
                               tracking-tight leading-none text-slate-900">
                  {capitalizedName}
                </h1>
                
                {/* Floating Category Badge */}
                <FloatingElement duration={3}>
                  <div className="w-3 h-3 bg-[var(--accent)] rounded-full opacity-80" />
                </FloatingElement>
              </div>

              <motion.p 
                className="font-body text-lg lg:text-xl text-slate-600 
                           leading-relaxed max-w-[65ch]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
              >
                {t('category.categoryDescription', { categoryName })}
              </motion.p>
            </motion.div>

            {/* Category Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-6 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.4 }}
            >
              {[
                { label: t('category.articles'), value: stats.totalPosts, suffix: '' },
                { label: t('category.readTime'), value: stats.avgReadTime, suffix: t('category.min') },
                { label: t('category.updated'), value: stats.lastUpdated, suffix: '' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center lg:text-left"
                  animate={{
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 4 + index * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2
                  }}
                >
                  <div className="font-display font-bold text-2xl lg:text-3xl text-slate-900">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="font-body text-sm text-slate-500 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Floating Action Panel - Right Side */}
          <div className="lg:col-span-3 flex justify-center lg:justify-end">
            <SpringDiv
              className="w-full max-w-xs"
              initial={{ opacity: 0, x: 30, rotateY: 15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.5 }}
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-[2rem] 
                             border border-slate-200/50 p-6
                             shadow-[0_20px_40px_-15px_rgba(26,20,16,0.05)]">
                
                <h3 className="font-display font-semibold text-lg text-slate-900 mb-4">
                  {t('category.discoverPanel')}
                </h3>
                
                <div className="space-y-3">
                  <motion.button
                    className="w-full flex items-center justify-between p-3 
                               bg-[var(--accent-light)] rounded-xl 
                               hover:bg-[var(--accent)]/20 
                               transition-colors duration-200 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <span className="font-display font-medium text-sm text-slate-700">
                      {t('category.filterPosts')}
                    </span>
                    <motion.svg 
                      className="w-4 h-4 text-[var(--accent)]"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      animate={{ rotate: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                    </motion.svg>
                  </motion.button>

                  <Link href="/category">
                    <motion.div
                      className="w-full flex items-center justify-between p-3 
                                 bg-slate-50 rounded-xl hover:bg-slate-100 
                                 transition-colors duration-200 group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <span className="font-display font-medium text-sm text-slate-700">
                        {t('category.allCategories')}
                      </span>
                      <motion.svg 
                        className="w-4 h-4 text-slate-400 group-hover:text-[var(--accent)] 
                                   transition-colors duration-200"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        whileHover={{ x: 2 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </motion.svg>
                    </motion.div>
                  </Link>
                </div>

                {/* Decorative Elements */}
                <div className="relative mt-6 pt-6 border-t border-slate-200/50">
                  <PulseElement>
                    <div className="w-2 h-2 bg-[var(--accent)] rounded-full mx-auto opacity-60" />
                  </PulseElement>
                </div>
              </div>
            </SpringDiv>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryPostsHero;