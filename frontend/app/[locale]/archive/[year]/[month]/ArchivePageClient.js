'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { HomeLayout } from '../../../../../components/Layout/Layout';
import PersonalBlogSidebar from '../../../../../components/Sidebar/PersonalBlogSidebar';
import PostList from '../../../../../components/Post/PostList';
import { useArchivePosts } from '../../../../../hooks/useArchivePosts';
import LoadingSpinner from '../../../../../components/Shared/LoadingSpinner';

export default function ArchivePageClient({ year, month }) {
  const t = useTranslations();
  const locale = useLocale();
  const yearInt = parseInt(year);
  const monthInt = parseInt(month);

  const { posts, totalCount, isLoading, isError, hasMore, loadMore } = useArchivePosts(yearInt, monthInt);

  const localeStr = locale === 'vi' ? 'vi-VN' : 'en-US';
  const monthName = !isNaN(monthInt) && monthInt >= 1 && monthInt <= 12
    ? new Date(yearInt, monthInt - 1, 1).toLocaleString(localeStr, { month: 'long' })
    : '';

  if (isNaN(yearInt) || isNaN(monthInt) || yearInt < 1900 || yearInt > 2100 || monthInt < 1 || monthInt > 12) {
    return (
      <HomeLayout sidebar={<PersonalBlogSidebar />}>
        <div className="text-center py-12 text-[var(--text-muted)]">
          <h3 className="text-lg font-medium mb-2">{t('archive.invalidDate')}</h3>
          <p>{t('archive.invalidDateMessage')}</p>
        </div>
      </HomeLayout>
    );
  }

  if (!yearInt || !monthInt) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-[var(--text-muted)] text-sm">{t('archive.loadingArchive')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <HomeLayout sidebar={<PersonalBlogSidebar />}>
        <div className="text-center py-12 text-[var(--text-muted)]">
          <h3 className="text-lg font-medium mb-2">{t('archive.errorTitle')}</h3>
          <p>{t('archive.errorMessage')}</p>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout sidebar={<PersonalBlogSidebar />}>
      <div className="space-y-8">
        <header>
          <h1 className="font-serif font-bold text-3xl text-[var(--text)] mb-2">
            {t('archive.title', { month: monthName, year: yearInt })}
          </h1>
          <p className="text-[var(--text-muted)]">
            {totalCount > 0
              ? t('archive.postsFrom', { count: totalCount, month: monthName, year: yearInt })
              : t('archive.noPostsFor', { month: monthName, year: yearInt })}
          </p>
        </header>

        <PostList
          posts={[posts]}
          isLoading={isLoading}
          isError={isError}
          setSize={loadMore}
          isReachingEnd={!hasMore}
          variant="archive"
          showImages={true}
          showExcerpts={true}
        />
      </div>
    </HomeLayout>
  );
}
