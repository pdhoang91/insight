// components/Utils/InfiniteScrollWrapper.js
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const InfiniteScrollWrapper = ({
  items,
  renderItem,
  fetchMore,
  hasMore,
  loader,
  endMessage,
  className = "grid grid-cols-1 md:grid-cols-2 gap-4",
  children,
  dataLength = 0,
  loadMore,
  isLoading,
}) => {
  // Support both patterns: items + renderItem OR children
  if (children) {
    return (
      <InfiniteScroll
        dataLength={dataLength}
        next={loadMore || fetchMore}
        hasMore={hasMore}
        loader={isLoading ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2 text-secondary">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span className="font-mono text-sm">Loading...</span>
            </div>
          </div>
        ) : (loader || null)}
        endMessage={endMessage}
      >
        {children}
      </InfiniteScroll>
    );
  }

  // Original pattern with items + renderItem
  return (
    <InfiniteScroll
      dataLength={items?.length || 0}
      next={fetchMore}
      hasMore={hasMore}
      loader={loader}
      endMessage={endMessage}
    >
      <div className={className}>
        {items?.map((item) => renderItem(item)) || []}
      </div>
    </InfiniteScroll>
  );
};

export default InfiniteScrollWrapper;

