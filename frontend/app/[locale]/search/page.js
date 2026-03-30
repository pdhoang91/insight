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
    <div className="pb-8">
      <p className="ui-section-header mb-3" style={{ color: 'var(--accent)', letterSpacing: '0.12em' }}>
        {t('search.title')}
      </p>
      <h1
        className="font-display font-extrabold text-[var(--text)] mb-4"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', letterSpacing: '-0.04em', lineHeight: 1.08 }}
      >
        {t('search.subtitle')}
      </h1>
      <div className="text-[0.8rem] text-[var(--text-faint)] space-y-1 font-display">
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
