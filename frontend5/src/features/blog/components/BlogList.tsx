'use client';

import React from 'react';
import { usePosts } from '@/hooks/usePosts';
import BlogCard from './BlogCard';
import { LoadingSpinner, BlogCardSkeleton } from '@/components/ui';
import { SearchFilters } from '@/types';

interface BlogListProps {
  filters?: SearchFilters;
  pageSize?: number;
  showPagination?: boolean;
}

const BlogList: React.FC<BlogListProps> = ({
  filters = {},
  pageSize = 12,
  showPagination = true,
}) => {
  const { 
    posts, 
    isLoading, 
    error, 
    pagination,
    nextPage,
    prevPage,
    currentPage,
    goToPage
  } = usePosts(1, pageSize, filters);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load posts</h3>
        <p className="text-gray-600 mb-4">Something went wrong while fetching the posts.</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show skeleton loading for initial load
  if (isLoading && posts.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: pageSize || 6 }).map((_, index) => (
          <BlogCardSkeleton key={index} variant="default" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
        <p className="text-gray-600">
          {filters.query 
            ? `No posts match your search for "${filters.query}"`
            : "No posts have been published yet."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <BlogCard
            key={`${post.id}-${index}`}
            post={post}
            variant="default"
            showCategories={true}
            showAuthor={true}
            showExcerpt={true}
          />
        ))}
      </div>

      {/* Loading indicator for additional content */}
      {isLoading && posts.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {Array.from({ length: 3 }).map((_, index) => (
              <BlogCardSkeleton key={`loading-${index}`} variant="default" />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {showPagination && pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={prevPage}
              disabled={!pagination.hasPrev}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            {/* Page numbers */}
            <div className="hidden sm:flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      pageNum === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={nextPage}
              disabled={!pagination.hasNext}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Page info */}
          <div className="text-sm text-gray-500 text-center">
            Showing {((currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} stories
            {filters.category && ` in ${filters.category}`}
            {filters.query && ` matching "${filters.query}"`}
          </div>
        </div>
      )}

      {/* Simple posts count for no pagination */}
      {!showPagination && (
        <div className="text-center text-sm text-gray-500">
          Showing {posts.length} {posts.length === 1 ? 'story' : 'stories'}
          {filters.category && ` in ${filters.category}`}
          {filters.query && ` matching "${filters.query}"`}
        </div>
      )}
    </div>
  );
};

export default BlogList; 