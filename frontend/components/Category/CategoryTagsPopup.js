// components/Category/CategoryTagsPopup.js
import React, { useState } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import { useCategories } from '../../hooks/useCategories';

const CategoryTagsPopup = ({ title, content, imageTitle, onPublish, onCancel }) => {
  const { categories, isLoading } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tags, setTags] = useState('');

  const filteredCategories = categories?.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const toggleCategory = (category) => {
    const isSelected = selectedCategories.some(cat => cat.id === category.id);
    if (isSelected) {
      setSelectedCategories(selectedCategories.filter(cat => cat.id !== category.id));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handlePublish = () => {
    const categoryNames = selectedCategories.map(cat => cat.name).join(',');
    onPublish(categoryNames, tags);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chọn danh mục
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <FaTimes className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          
          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              placeholder="react, javascript, web development..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-[40vh] px-4 pb-4">
          {isLoading ? (
            <div className="text-center py-4">Đang tải...</div>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map((category) => {
                const isSelected = selectedCategories.some(cat => cat.id === category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      isSelected 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      {isSelected && <FaPlus className="w-4 h-4 rotate-45" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 p-4 border-t dark:border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handlePublish}
            className="px-6 py-2 bg-medium-accent-green hover:bg-medium-accent-green/90 text-white rounded-md transition-colors font-medium"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryTagsPopup;
