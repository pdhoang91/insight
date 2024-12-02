// components/Explore/FollowListItem.js
import React, { useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router'; // Import useRouter từ Next.js
import { addCategoryFollow, removeCategoryFollow } from '../../services/tabService';

const FollowListItem = ({ item, onFollowChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter(); // Sử dụng useRouter

  const handleFollow = async () => {
    setLoading(true);
    setError(null);
    try {
      if (item.isFollowing) {
        await removeCategoryFollow(item.id);
        onFollowChange({ ...item, isFollowing: false });
      } else {
        await addCategoryFollow(item.id);
        onFollowChange({ ...item, isFollowing: true });
      }
    } catch (err) {
      setError(`Không thể ${item.isFollowing ? 'hủy theo dõi' : 'theo dõi'} ${item.name}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    // Chuyển hướng đến trang tương ứng
    router.push(`/category/${encodeURIComponent(item.name.replace(/\s+/g, ''))}`);
  };

  return (
    <motion.li
      className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center flex-grow" onClick={handleNavigate}>
        {/* Thêm hình ảnh hoặc biểu tượng */}
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
          {/* Giả sử có thuộc tính icon cho mỗi item */}
          <span className="text-xl text-blue-500">{item.icon || '📄'}</span>
        </div>
        <span className="text-lg text-gray-700">{item.name}</span>
      </div>
      <div className="flex items-center">
        {error && <span className="text-red-500 mr-4">{error}</span>}
        <motion.button
          onClick={(e) => {
            e.stopPropagation(); // Ngăn chặn sự kiện click truyền lên để không kích hoạt handleNavigate
            handleFollow();
          }}
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
          {item.isFollowing ? 'Hủy theo dõi' : 'Theo dõi'}
        </motion.button>
      </div>
    </motion.li>
  );
};

export default FollowListItem;
