// components/Search/SearchResults.js
import React from 'react';
import PostItem from '../Post/PostItem';
import { useSearch } from '../../hooks/useSearch';

const SearchResults = ({ query }) => {
  const { data, isLoading, isError } = useSearch(query);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading posts skeleton */}
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-6 h-6 bg-muted/20 rounded-full"></div>
                <div className="h-4 bg-muted/20 rounded w-32"></div>
                <div className="h-4 bg-muted/20 rounded w-24"></div>
              </div>
              <div className="h-6 bg-muted/20 rounded w-3/4 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted/20 rounded w-full"></div>
                <div className="h-4 bg-muted/20 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 md:py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">Search Error</h3>
        <p className="text-secondary font-mono text-sm">
          Unable to perform search. Please try again later.
        </p>
      </div>
    );
  }

  const stories = data?.stories || [];

  if (stories.length === 0) {
    return (
      <div className="text-center py-12 md:py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">No Articles Found</h3>
        <p className="text-secondary font-mono text-sm">
          No articles found for "{query}". Try different keywords or browse categories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary font-mono">
          {stories.length} {stories.length === 1 ? 'article' : 'articles'} found
        </p>
      </div>

      {/* Articles list */}
      <div className="space-y-6">
        {stories.map((story) => (
          <div key={story.id} className="pb-6 border-b border-gray-600/10 last:border-b-0 last:pb-0">
            <PostItem post={story} variant="default" />
          </div>
        ))}
      </div>

      {/* Load more placeholder */}
      {stories.length >= 10 && (
        <div className="text-center pt-6">
          <button className="px-6 py-3 text-secondary hover:text-primary transition-colors font-mono text-sm">
            Load more articles
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
