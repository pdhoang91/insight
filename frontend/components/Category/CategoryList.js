'use client';
import React from 'react';
import { useCategories } from '../../hooks/useCategories';
import CategoryHero from './CategoryHero';
import BentoGrid from './BentoGrid';
import CategorySkeletonLoader from './CategorySkeletonLoader';
import { useTranslations } from 'next-intl';

const CategoryList = () => {
  const t = useTranslations();
  const { categories, isLoading, isError } = useCategories();

  if (isLoading) {
    return (
      <div className="space-y-16">
        <CategoryHero />
        <CategorySkeletonLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-16">
        <CategoryHero />
        <div className="text-center py-16">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-lg text-slate-900">
              {t('category.errorTitle')}
            </h3>
            <p className="font-body text-slate-600">
              {t('category.errorMessage')}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-[var(--accent)] text-white
                         font-display font-medium rounded-full hover:bg-[var(--accent-dark)]
                         transition-colors duration-200"
            >
              {t('category.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <CategoryHero />
      <BentoGrid categories={categories} />
    </div>
  );
};

export default CategoryList;
