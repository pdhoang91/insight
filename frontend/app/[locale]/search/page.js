'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { HomeLayout } from '../../../components/Layout/Layout';
import { SearchResults } from '../../../components/Search';
import PersonalBlogSidebar from '../../../components/Sidebar/PersonalBlogSidebar';

const SearchHeader = () => {
  const t = useTranslations();
  return (
    <div className="text-center py-12">
      <h1 className="font-serif text-3xl font-bold text-[var(--text)] mb-3">{t('search.title')}</h1>
      <p className="text-[var(--text-muted)] max-w-md mx-auto mb-8">
        {t('search.subtitle')}
      </p>

      <div className="w-16 h-16 mx-auto mb-6 bg-[var(--accent-light)] rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="max-w-sm mx-auto text-[13px] text-[var(--text-faint)] space-y-1.5">
        <p>{t('search.tipTitles')}</p>
        <p>{t('search.tipQuotes')}</p>
        <p>{t('search.tipRelevance')}</p>
      </div>
    </div>
  );
};

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');

  return (
    <HomeLayout sidebar={<PersonalBlogSidebar />}>
      {q ? <SearchResults query={q} /> : <SearchHeader />}
    </HomeLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
