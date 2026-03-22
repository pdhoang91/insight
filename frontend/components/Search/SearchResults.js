// components/Search/SearchResults.js
import React from 'react';
import BasePostItem from '../Post/BasePostItem';
import { useSearch } from '../../hooks/useSearch';
import ErrorState from '../UI/ErrorState';
import EmptyState from '../UI/EmptyState';
import PostSkeleton from '../Shared/PostSkeleton';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTranslations } from 'next-intl';

const SearchResults = ({ query }) => {
  const t = useTranslations();
  const { data, totalCount, isLoading, isValidating, isError, loadMore, hasMore } = useSearch(query);

  if (isError) {
    return <ErrorState title={t('search.failed')} message={t('search.failedMessage')} />;
  }

  if (isLoading && (!data || !data.stories || data.stories.length === 0)) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <PostSkeleton key={index} variant="timeline" />
        ))}
      </div>
    );
  }

  const stories = (data?.stories && Array.isArray(data.stories)) ? data.stories : [];

  if (stories.length === 0) {
    return (
      <EmptyState
        title={t('search.noResults')}
        message={t('search.noResultsFor', { query })}
      />
    );
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#292929] mb-2">
          {t('search.results')}
        </h1>
        <p className="text-[#757575]">
          {t('search.foundResults', { count: totalCount || 0, query })}
          {stories.length < (totalCount || 0) && (
            <span className="text-[#b3b3b1] ml-2">({t('search.showing')} {stories.length})</span>
          )}
        </p>
      </header>

      <InfiniteScroll
        dataLength={stories.length}
        next={loadMore}
        hasMore={hasMore}
        loader={
          <div className="space-y-6 mt-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <PostSkeleton key={`loading-${index}`} variant="timeline" />
            ))}
          </div>
        }
      >
        <div>
          {stories.map((story, index) => (
            <BasePostItem key={`${story?.id || index}-${index}`} post={story} />
          ))}
        </div>
      </InfiniteScroll>
    </>
  );
};

export default SearchResults;
