// components/Category/CategoryTagsPopup.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  FaTimes, 
  FaPlus, 
  FaCheck, 
  FaSearch, 
  FaTag, 
  FaHashtag
} from 'react-icons/fa';
import { useCategories } from '../../hooks/useCategories';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const CategoryTagsPopup = ({ title, content, imageTitle, onPublish, onCancel }) => {
  const { categories, isLoading } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [parsedTags, setParsedTags] = useState([]);
  const searchInputRef = useRef(null);

  // Focus search input when popup opens
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Simple tag parsing
  useEffect(() => {
    const parsed = tagInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 5);
    setParsedTags(parsed);
  }, [tagInput]);

  // Simple category filtering
  const filteredCategories = categories?.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Simple suggested tags
  const suggestedTags = ['tutorial', 'guide', 'tips', 'javascript', 'react', 'web-dev'];

  const toggleCategory = (category) => {
    const isSelected = selectedCategories.some(cat => cat.id === category.id);
    if (isSelected) {
      setSelectedCategories(selectedCategories.filter(cat => cat.id !== category.id));
    } else if (selectedCategories.length < 3) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const removeTag = (indexToRemove) => {
    const newTags = parsedTags.filter((_, index) => index !== indexToRemove);
    setTagInput(newTags.join(', '));
  };

  const addSuggestedTag = (tag) => {
    if (!parsedTags.includes(tag) && parsedTags.length < 5) {
      const newTags = [...parsedTags, tag];
      setTagInput(newTags.join(', '));
    }
  };

  const handlePublish = () => {
    const categoryNames = selectedCategories.map(cat => cat.name).join(',');
    const finalTags = parsedTags.join(',');
    onPublish(categoryNames, finalTags);
  };

  const canPublish = selectedCategories.length > 0;

  return (
    <div 
      className={combineClasses(
        'fixed inset-0 z-50 flex items-center justify-center',
        themeClasses.bg.primary + '/80',
        themeClasses.effects.blur
      )}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className={combineClasses(
        'max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden',
        themeClasses.bg.primary,
        themeClasses.effects.rounded,
        themeClasses.effects.shadowLayered,
        themeClasses.border.primary,
        'border transform transition-all duration-300 ease-out scale-100'
      )}>
        {/* Simple Header */}
        <div className={combineClasses(
          'flex items-center justify-between',
          themeClasses.spacing.card,
          themeClasses.border.primary,
          'border-b'
        )}>
          <div>
            <h3 className={combineClasses(
              themeClasses.typography.h4,
              themeClasses.text.primary
            )}>
              Publish Article
          </h3>
            <p className={combineClasses(
              themeClasses.typography.bodySmall,
              themeClasses.text.secondary
            )}>
              Choose categories and add tags to help readers find your content
            </p>
          </div>
          
          <button
            onClick={onCancel}
            className={combineClasses(
              'p-2 rounded-full transition-colors duration-200',
              'hover:bg-medium-hover',
              themeClasses.text.secondary
            )}
          >
            <FaTimes className={themeClasses.icons.md} />
          </button>
        </div>
        
        {/* Content */}
        <div className={combineClasses(
          'overflow-y-auto max-h-[65vh]'
        )}>
          <div className={themeClasses.spacing.card}>
            <div className={themeClasses.spacing.stackLarge}>
              {/* Categories Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <FaTag className={combineClasses(themeClasses.icons.md, themeClasses.text.accent)} />
                    <div>
                      <h4 className={combineClasses(themeClasses.typography.h4, themeClasses.text.primary)}>
                        Categories
                      </h4>
                      <p className={combineClasses(themeClasses.typography.bodySmall, themeClasses.text.secondary)}>
                        Choose up to 3 categories
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={combineClasses(
                      'text-sm px-3 py-1.5 rounded-full font-medium',
                      selectedCategories.length > 0 ? 
                        combineClasses(themeClasses.bg.accent, 'text-white') : 
                        combineClasses(themeClasses.bg.secondary, themeClasses.text.muted)
                    )}>
                      {selectedCategories.length}/3
                    </span>
                  </div>
                </div>
                
                {/* Search & Add New */}
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <FaSearch className={combineClasses(
                      'absolute left-4 top-1/2 transform -translate-y-1/2',
                      themeClasses.icons.sm,
                      themeClasses.text.muted
                    )} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search or create new category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={combineClasses(
                        themeClasses.interactive.inputBase,
                        themeClasses.interactive.inputLarge,
                        themeClasses.interactive.input,
                        'pl-12 pr-4'
                      )}
                    />
                  </div>
                  
                  {/* Add New Category Option */}
                  {searchTerm && !filteredCategories.some(cat => cat.name.toLowerCase() === searchTerm.toLowerCase()) && (
                    <button
                      onClick={() => {
                        const newCategory = { 
                          id: `new-${Date.now()}`, 
                          name: searchTerm.trim(),
                          isNew: true 
                        };
                        if (selectedCategories.length < 3) {
                          setSelectedCategories([...selectedCategories, newCategory]);
                          setSearchTerm('');
                        }
                      }}
                      disabled={selectedCategories.length >= 3}
                      className={combineClasses(
                        'w-full flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed transition-all duration-200',
                        selectedCategories.length >= 3
                          ? combineClasses('opacity-50 cursor-not-allowed', themeClasses.border.primary)
                          : combineClasses(
                              'border-medium-accent-green/50 hover:border-medium-accent-green hover:bg-medium-accent-green/5',
                              themeClasses.text.accent
                            )
                      )}
                    >
                      <FaPlus className={themeClasses.icons.sm} />
                      <span className="font-medium">
                        Create new category: "{searchTerm}"
                      </span>
                    </button>
                  )}
                </div>

                {/* Selected Categories */}
                {selectedCategories.length > 0 && (
                  <div className="mb-6">
                    <h5 className={combineClasses(
                      'text-sm font-semibold mb-3',
                      themeClasses.text.primary
                    )}>
                      Selected Categories:
                    </h5>
                    <div className="flex flex-wrap gap-3">
                      {selectedCategories.map((category) => (
                        <div
                          key={category.id}
                          className={combineClasses(
                            'group flex items-center space-x-3 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 hover:scale-105',
                            category.isNew 
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : combineClasses(
                                  themeClasses.border.accent,
                                  themeClasses.bg.accentLight,
                                  themeClasses.text.accent
                                )
                          )}
                        >
                          <FaTag className="w-4 h-4" />
                          <span className="font-medium">{category.name}</span>
                          {category.isNew && (
                            <span className="text-xs bg-blue-200 px-2 py-0.5 rounded-full">NEW</span>
                          )}
                          <button
                            onClick={() => toggleCategory(category)}
                            className="opacity-70 hover:opacity-100 hover:bg-white/20 rounded-full p-1 transition-all duration-200"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Categories */}
                {filteredCategories.length > 0 && (
                  <div>
                    <h5 className={combineClasses(
                      'text-sm font-semibold mb-4',
                      themeClasses.text.primary
                    )}>
                      Available Categories:
                    </h5>
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                      {isLoading ? (
                        <div className="col-span-2 text-center py-8">
                          <div className="animate-spin w-6 h-6 border-2 border-medium-accent-green border-t-transparent rounded-full mx-auto mb-2"></div>
                          <span className={combineClasses(themeClasses.text.secondary)}>Loading...</span>
                        </div>
                      ) : (
                        filteredCategories.map((category) => {
                          const isSelected = selectedCategories.some(cat => cat.id === category.id);
                          const isDisabled = !isSelected && selectedCategories.length >= 3;
                          
                          return (
                            <button
                              key={category.id}
                              onClick={() => !isDisabled && toggleCategory(category)}
                              disabled={isDisabled}
                              className={combineClasses(
                                'group relative p-4 rounded-xl border-2 text-left transition-all duration-200 transform hover:scale-102',
                                isSelected 
                                  ? combineClasses(
                                      themeClasses.border.accent,
                                      themeClasses.bg.accentLight,
                                      'shadow-lg'
                                    )
                                  : isDisabled
                                  ? combineClasses(
                                      themeClasses.border.primary,
                                      'opacity-40 cursor-not-allowed'
                                    )
                                  : combineClasses(
                                      themeClasses.border.primary,
                                      'hover:border-medium-accent-green/50 hover:bg-medium-hover hover:shadow-md'
                                    )
                              )}
                            >
                              <div className="flex items-center space-x-2">
                                <FaTag className={combineClasses(
                                  'w-4 h-4',
                                  isSelected ? themeClasses.text.accent : themeClasses.text.secondary
                                )} />
                                <span className={combineClasses(
                                  'font-medium text-sm',
                                  isSelected ? themeClasses.text.accent : themeClasses.text.primary
                                )}>
                                  {category.name}
                                </span>
                              </div>
                              {isSelected && (
                                <div className={combineClasses(
                                  'absolute -top-2 -right-2 p-1 rounded-full',
                                  themeClasses.bg.accent
                                )}>
                                  <FaCheck className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags Section */}
              <div className={combineClasses(
                'pt-8 border-t-2',
                themeClasses.border.primary
              )}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <FaHashtag className={combineClasses(themeClasses.icons.md, themeClasses.text.accent)} />
                    <div>
                      <h4 className={combineClasses(themeClasses.typography.h4, themeClasses.text.primary)}>
                        Tags
                      </h4>
                      <p className={combineClasses(themeClasses.typography.bodySmall, themeClasses.text.secondary)}>
                        Add relevant keywords
                      </p>
                    </div>
                  </div>
                  <span className={combineClasses(
                    'text-sm px-3 py-1.5 rounded-full font-medium',
                    parsedTags.length > 0 ? 
                      combineClasses(themeClasses.bg.accent, 'text-white') : 
                      combineClasses(themeClasses.bg.secondary, themeClasses.text.muted)
                  )}>
                    {parsedTags.length}/5
                  </span>
                </div>

                {/* Tag Input */}
                <div className="relative mb-6">
                  <FaHashtag className={combineClasses(
                    'absolute left-4 top-1/2 transform -translate-y-1/2',
                    themeClasses.icons.sm,
                    themeClasses.text.muted
                  )} />
                  <input
                    type="text"
                    placeholder="Enter tags separated by commas (e.g. javascript, react, tutorial)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className={combineClasses(
                      themeClasses.interactive.inputBase,
                      themeClasses.interactive.inputLarge,
                      themeClasses.interactive.input,
                      'pl-12 pr-4'
                    )}
                  />
                </div>

                {/* Current Tags */}
                {parsedTags.length > 0 && (
                  <div>
                    <h5 className={combineClasses(
                      'text-sm font-semibold mb-4',
                      themeClasses.text.primary
                    )}>
                      Your Tags:
                    </h5>
                    <div className="flex flex-wrap gap-3">
                      {parsedTags.map((tag, index) => (
                        <div
                          key={index}
                          className={combineClasses(
                            'group flex items-center space-x-3 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 hover:scale-105',
                            themeClasses.border.accent,
                            'bg-medium-accent-green/10'
                          )}
                        >
                          <FaHashtag className={combineClasses('w-4 h-4', themeClasses.text.accent)} />
                          <span className={combineClasses('font-medium', themeClasses.text.accent)}>
                            {tag}
                          </span>
                          <button
                            onClick={() => removeTag(index)}
                            className="opacity-70 hover:opacity-100 hover:bg-medium-accent-green/20 rounded-full p-1 transition-all duration-200"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={combineClasses(
          'flex items-center justify-between border-t-2',
          themeClasses.spacing.card,
          themeClasses.border.primary,
          themeClasses.bg.secondary + '/30'
        )}>
          <button
            onClick={onCancel}
            className={combineClasses(
              'px-6 py-3 rounded-xl font-medium transition-all duration-200',
              themeClasses.interactive.buttonGhost,
              'hover:bg-medium-hover hover:scale-105'
            )}
          >
            Cancel
          </button>
          
          <button
            onClick={handlePublish}
            disabled={!canPublish}
            className={combineClasses(
              'px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform',
              canPublish 
                ? combineClasses(
                    themeClasses.bg.accent,
                    'text-white shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-0.5'
                  )
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
            )}
          >
            {canPublish ? 'Publish Article' : 'Select Categories First'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryTagsPopup;
