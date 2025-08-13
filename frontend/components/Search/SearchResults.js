// components/Search/SearchResults.js
import React, { useEffect } from 'react';
import PostItemTimeline from '../Post/PostItemTimeline';
import { useSearch } from '../../hooks/useSearch';
import { trackSearch } from '../../services/searchService';
import ErrorState from '../Shared/ErrorState';
import EmptyState from '../Shared/EmptyState';
import PostSkeleton from '../Shared/PostSkeleton';
import InfiniteScroll from 'react-infinite-scroll-component';

const SearchResults = ({ query }) => {
  const { data, totalCount, isLoading, isValidating, isError, loadMore, hasMore } = useSearch(query);

  // Track search when query changes and results are loaded
  useEffect(() => {
    if (query && data && data.stories && Array.isArray(data.stories) && data.stories.length > 0) {
      trackSearch(query, null, totalCount || 0);
    }
  }, [query, totalCount]);

  // Error State
  if (isError) {
    return (
      <ErrorState 
        title="Search failed"
        message="Something went wrong while searching. Please check your connection and try again."
      />
    );
  }

  // Initial Loading State
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

  // Empty State
  if (stories.length === 0) {
    return (
      <EmptyState 
        title="No articles found"
        message={`No articles found for "${query}". Try different keywords or browse categories.`}
        icon="search"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {totalCount || 0} {(totalCount || 0) === 1 ? 'article' : 'articles'} found
          {stories.length < (totalCount || 0) && (
            <span className="text-text-muted ml-2">
              (showing {stories.length})
            </span>
          )}
        </p>
      </div>

      {/* Articles list with infinite scroll */}
      <InfiniteScroll
        dataLength={stories.length}
        next={loadMore}
        hasMore={hasMore}
        loader={
          <div className="space-y-4 mt-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <PostSkeleton key={`loading-${index}`} variant="timeline" />
            ))}
          </div>
        }
      >
        <div className="space-y-4">
          {stories.map((story, index) => (
            <PostItemTimeline key={`${story?.id || index}-${index}`} post={story} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default SearchResults;
