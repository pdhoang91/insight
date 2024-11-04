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
}) => {
  return (
    <InfiniteScroll
      dataLength={items.length}
      next={fetchMore}
      hasMore={hasMore}
      loader={loader}
      endMessage={endMessage}
    >
      <div className={className}>
        {items.map((item) => renderItem(item))}
      </div>
    </InfiniteScroll>
  );
};

export default InfiniteScrollWrapper;

