// // components/Following/FollowList.js
// import React, { useEffect, useState } from 'react';
// import { addTab, removeTab } from '../../services/tabService';
// import { FaPlus, FaMinus } from 'react-icons/fa'; // Sử dụng icon cho Follow/Unfollow

// const FollowList = ({ category, initialItems, onFollowChange }) => {
//   const [items, setItems] = useState(initialItems);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Cập nhật items khi initialItems thay đổi
//   useEffect(() => {
//     setItems(initialItems);
//   }, [initialItems]);

//   const handleFollow = async (item) => {
//     setLoading(true);
//     try {
//       await addTab(item.name);
//       const updatedItem = { ...item, isFollowing: true };
//       setItems((prevItems) =>
//         prevItems.map((i) => (i.name === item.name ? updatedItem : i))
//       );
//       if (onFollowChange) onFollowChange(updatedItem);
//     } catch (err) {
//       setError(`Failed to follow ${item.name}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUnfollow = async (item) => {
//     setLoading(true);
//     try {
//       await removeTab(item.name);
//       const updatedItem = { ...item, isFollowing: false };
//       setItems((prevItems) =>
//         prevItems.map((i) => (i.name === item.name ? updatedItem : i))
//       );
//       if (onFollowChange) onFollowChange(updatedItem);
//     } catch (err) {
//       setError(`Failed to unfollow ${item.name}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mb-6">
//       <h2 className="text-xl font-semibold mb-4">{category}</h2>
//       {error && <div className="text-red-500 mb-2">{error}</div>}
//       <ul>
//         {items.map((item) => (
//           <li key={item.name} className="flex justify-between items-center mb-2">
//             <span>{item.name}</span>
//             <button
//               onClick={() =>
//                 item.isFollowing ? handleUnfollow(item) : handleFollow(item)
//               }
//               className={`flex items-center px-3 py-1 rounded ${
//                 item.isFollowing
//                   ? 'bg-red-500 text-white hover:bg-red-600'
//                   : 'bg-blue-500 text-white hover:bg-blue-600'
//               }`}
//               disabled={loading}
//             >
//               {item.isFollowing ? <FaMinus className="mr-1" /> : <FaPlus className="mr-1" />}
//               {item.isFollowing ? 'Unfollow' : 'Follow'}
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };



// // export default FollowList;
// // components/Following/FollowList.js
// import React, { useEffect, useState } from 'react';
// import { addCategoryFollow, removeCategoryFollow } from '../../services/tabService';
// import { FaPlus, FaMinus } from 'react-icons/fa'; // Sử dụng icon cho Follow/Unfollow


// const FollowList = ({ category, initialItems, onFollowChange }) => {
//   const [items, setItems] = useState(initialItems);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Cập nhật items khi initialItems thay đổi
//   useEffect(() => {
//     setItems(initialItems);
//   }, [initialItems]);

//   const handleFollow = async (item) => {
//     setLoading(true);
//     setError(null);
//     try {
//       await addCategoryFollow(item.id); // Sử dụng category ID
//       const updatedItem = { ...item, isFollowing: true };
//       setItems((prevItems) =>
//         prevItems.map((i) => (i.id === item.id ? updatedItem : i))
//       );
//       if (onFollowChange) onFollowChange(updatedItem);
     
//     } catch (err) {
//       setError(`Failed to follow ${item.name}`);
     
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUnfollow = async (item) => {
//     setLoading(true);
//     setError(null);
//     try {
//       await removeCategoryFollow(item.id); // Sử dụng category ID
//       const updatedItem = { ...item, isFollowing: false };
//       setItems((prevItems) =>
//         prevItems.map((i) => (i.id === item.id ? updatedItem : i))
//       );
//       if (onFollowChange) onFollowChange(updatedItem);
      
//     } catch (err) {
//       setError(`Failed to unfollow ${item.name}`);
      
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mb-6">
//       <h2 className="text-xl font-semibold mb-4">{category}</h2>
//       {error && <div className="text-red-500 mb-2">{error}</div>}
//       <ul>
//         {items.map((item) => (
//           <div key={item.id} className="flex justify-between items-center mb-2"> {/* Sử dụng item.id thay vì item.name */}
//             <span>{item.name}</span>
//             <button
//               onClick={() =>
//                 item.isFollowing ? handleUnfollow(item) : handleFollow(item)
//               }
//               className={`flex items-center px-3 py-1 rounded ${
//                 item.isFollowing
//                   ? 'bg-red-500 text-white hover:bg-red-600'
//                   : 'bg-blue-500 text-white hover:bg-blue-600'
//               }`}
//               disabled={loading}
//             >
//               {item.isFollowing ? <FaMinus className="mr-1" /> : <FaPlus className="mr-1" />}
//               {item.isFollowing ? 'Unfollow' : 'Follow'}
//             </button>
//           </div>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default FollowList;


import React, { useEffect, useState } from 'react';
import { addCategoryFollow, removeCategoryFollow } from '../../services/tabService';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { motion } from 'framer-motion'; // Thư viện hỗ trợ animation

const FollowList = ({ category, initialItems, onFollowChange }) => {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleFollow = async (item) => {
    setLoading(true);
    setError(null);
    try {
      await addCategoryFollow(item.id);
      const updatedItem = { ...item, isFollowing: true };
      setItems((prevItems) =>
        prevItems.map((i) => (i.id === item.id ? updatedItem : i))
      );
      if (onFollowChange) onFollowChange(updatedItem);
    } catch (err) {
      setError(`Failed to follow ${item.name}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (item) => {
    setLoading(true);
    setError(null);
    try {
      await removeCategoryFollow(item.id);
      const updatedItem = { ...item, isFollowing: false };
      setItems((prevItems) =>
        prevItems.map((i) => (i.id === item.id ? updatedItem : i))
      );
      if (onFollowChange) onFollowChange(updatedItem);
    } catch (err) {
      setError(`Failed to unfollow ${item.name}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">{category}</h2>
      {error && <div className="text-red-500 mb-4 animate-pulse">{error}</div>}
      <ul>
        {items.map((item) => (
          <motion.li
            key={item.id}
            className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-lg text-gray-700">{item.name}</span>
            <motion.button
              onClick={() =>
                item.isFollowing ? handleUnfollow(item) : handleFollow(item)
              }
              className={`flex items-center px-4 py-2 rounded-full font-medium transition-colors duration-300 ${
                item.isFollowing
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              disabled={loading}
              whileTap={{ scale: 0.95 }}
            >
              {item.isFollowing ? (
                <FaMinus className="mr-2 text-sm" />
              ) : (
                <FaPlus className="mr-2 text-sm" />
              )}
              {item.isFollowing ? 'Unfollow' : 'Follow'}
            </motion.button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default FollowList;

