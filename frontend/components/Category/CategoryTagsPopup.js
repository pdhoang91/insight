// components/Category/CategoryTagsPopup.js
import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaTag, FaFolderOpen } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryTagsPopup = ({ title, content, imageTitle, onPublish, onCancel }) => {
  const [categories, setCategories] = useState('');
  const [tags, setTags] = useState('');

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl mx-auto p-6 relative overflow-y-auto max-h-screen"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Nút Đóng */}
          <button
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
            onClick={onCancel}
            aria-label="Đóng Popup"
          >
            <FaTimes size={20} />
          </button>

          <div className="flex flex-col md:flex-row">
            {/* Phần xem trước bài viết */}
            <div className="w-full md:w-1/2 p-4 border-r mb-4 md:mb-0">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Xem Trước Bài Viết</h2>
              <div className="border p-4 rounded bg-gray-100">
                {/* Hiển thị Image Title nếu có */}
                {imageTitle && (
                  <img
                    src={imageTitle}
                    alt="Image Title"
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                )}
                <h3 className="text-lg font-bold text-gray-700">{title || 'Chưa có tiêu đề'}</h3>
                {/* Giới hạn độ dài của nội dung */}
                <div className="mt-2 text-gray-600">
                  {getLimitedContent(content, 300)}
                </div>
                <p className="text-gray-500 mt-4 text-sm">
                  Bao gồm một hình ảnh chất lượng cao trong câu chuyện của bạn để làm cho nó hấp
                  dẫn hơn với người đọc.
                </p>
              </div>
            </div>

            {/* Phần nhập category và tags */}
            <div className="w-full md:w-1/2 p-4">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Thêm Categories và Tags</h2>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-700 flex items-center">
                  <FaFolderOpen className="mr-2" />
                  Categories
                </label>
                <input
                  type="text"
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="Ví dụ: Công nghệ, Khoa Học"
                  aria-label="Nhập Categories"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-700 flex items-center">
                  <FaTag className="mr-2" />
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="Ví dụ: Golang, Sao Hoả"
                  aria-label="Nhập Tags"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => onPublish(categories, tags)}
                  className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                  aria-label="Đăng Ngay"
                >
                  <FaCheck className="mr-2" />
                  Đăng Ngay
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                  aria-label="Hủy"
                >
                  <FaTimes className="mr-2" />
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hàm để giới hạn độ dài nội dung
const getLimitedContent = (content, maxLength) => {
  if (!content) return '';
  const strippedContent = content.replace(/<[^>]+>/g, ''); // Xóa tất cả thẻ HTML
  return strippedContent.length > maxLength
    ? strippedContent.substring(0, maxLength) + '...'
    : strippedContent;
};

export default CategoryTagsPopup;
