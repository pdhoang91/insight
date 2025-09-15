// components/Profile/AvatarUpdateModal.js
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCamera } from 'react-icons/fa';
import { updateProfileWithAvatar } from '../../services/imageService';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const AvatarUpdateModal = ({ userProfile, onUpdate, onCancel }) => {
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!avatarFile) return;
    
    setIsUploading(true);
    
    try {
      // Only update avatar, keep other profile data unchanged
      const profileData = { 
        name: userProfile.name, 
        bio: userProfile.bio, 
        avatar_url: avatarUrl 
      };
      const response = await updateProfileWithAvatar(profileData, avatarFile);
      
      // Call the parent update callback with the response data
      onUpdate(response.data);
    } catch (error) {
      console.error("Failed to update avatar:", error);
      alert("Không thể cập nhật avatar. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Store the file for upload when form is submitted
    setAvatarFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        />

        {/* Modal */}
        <motion.div
          className={combineClasses(
            'relative w-full max-w-md overflow-hidden',
            themeClasses.bg.primary,
            themeClasses.border.primary,
            'border rounded-lg shadow-2xl'
          )}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          {/* Header */}
          <div className={combineClasses(
            'flex items-center justify-between p-4 border-b',
            themeClasses.border.primary
          )}>
            <h3 className={combineClasses(
              themeClasses.typography.h4,
              themeClasses.text.accent,
              'font-mono'
            )}>
              cập_nhật_avatar()
            </h3>
            <button
              onClick={onCancel}
              className={combineClasses(
                themeClasses.text.muted,
                themeClasses.text.accentHover,
                themeClasses.animations.smooth
              )}
            >
              <FaTimes className={themeClasses.icons.md} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Preview */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <img 
                    src={avatarUrl || '/images/placeholder.svg'} 
                    alt="Avatar Preview" 
                    className={combineClasses(
                      'w-24 h-24 rounded-full object-cover border-2',
                      themeClasses.border.accentLight
                    )}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <div className={combineClasses(
                        'w-6 h-6 border-2 border-t-transparent rounded-full animate-spin',
                        themeClasses.border.accent
                      )}></div>
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={handleAvatarUploadClick}
                  disabled={isUploading}
                  className={combineClasses(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg font-mono',
                    themeClasses.bg.accentLight,
                    themeClasses.text.accent,
                    themeClasses.border.accentLight,
                    'border hover:bg-medium-accent-green/20',
                    themeClasses.animations.smooth,
                    'disabled:opacity-50'
                  )}
                >
                  <FaCamera className={themeClasses.icons.sm} />
                  <span>{isUploading ? 'đang_tải...' : 'chọn_ảnh()'}</span>
                </button>
                
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className={combineClasses(
                    'flex-1 px-4 py-2 rounded-lg font-mono',
                    themeClasses.text.muted,
                    themeClasses.border.primary,
                    'border hover:bg-medium-hover',
                    themeClasses.animations.smooth
                  )}
                >
                  hủy()
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !avatarFile}
                  className={combineClasses(
                    'flex-1 px-4 py-2 rounded-lg font-mono font-medium',
                    themeClasses.bg.accent,
                    'text-black hover:bg-medium-accent-green/90',
                    themeClasses.animations.smooth,
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isUploading ? 'đang_lưu...' : 'lưu()'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AvatarUpdateModal;
