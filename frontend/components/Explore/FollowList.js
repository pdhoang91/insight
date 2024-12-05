// components/Explore/FollowList.js
import React, { useEffect, useState } from 'react';
import FollowListItem from './FollowListItem';

const FollowList = ({ category, initialItems, onFollowChange }) => {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState(null);

  //console.log("items", items);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleFollowChange = (updatedItem) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    if (onFollowChange) onFollowChange(updatedItem);
  };

  return (
    <div className="mb-6 p-6 rounded-xl">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">{category}</h2>
      {error && <div className="text-red-500 mb-4 animate-pulse">{error}</div>}
      {items.length === 0 ? (
        <div className="text-center text-gray-500">Không có mục nào để hiển thị.</div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item) => (
            <FollowListItem key={item.id} item={item} onFollowChange={handleFollowChange} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default FollowList;
