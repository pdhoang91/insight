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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-medium-bg-primary/80 backdrop-blur-sm">
      <div className="rounded-card shadow-card max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-medium-border">
          <h3 className="text-lg font-semibold text-medium-text-primary">
            Chọn danh mục
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-medium-hover rounded-full transition-colors"
          >
            <FaTimes className="w-4 h-4 text-medium-text-muted" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-medium-border rounded-medium focus:outline-none focus:ring-2 focus:ring-medium-accent-green  text-medium-text-primary"
          />
          
          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium text-medium-text-primary mb-2">
              Tags (phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              placeholder="react, javascript, web development..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-medium-border rounded-medium focus:outline-none focus:ring-2 focus:ring-medium-accent-green  text-medium-text-primary"
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
                    className={`w-full text-left px-3 py-2 rounded-medium transition-colors ${
                      isSelected 
                        ? 'bg-medium-accent-green/10 text-medium-accent-green' 
                        : 'hover:bg-medium-hover text-medium-text-primary'
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
        <div className="flex items-center justify-end gap-3 p-4 border-t border-medium-border">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-medium-text-secondary hover:bg-medium-hover rounded-medium transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handlePublish}
            className="px-6 py-2 bg-medium-accent-green hover:bg-medium-accent-green/90 text-white rounded-medium transition-colors font-medium"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryTagsPopup;
