// components/Profile/AvatarUpdateModal.js
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCamera } from 'react-icons/fa';
import { updateProfileWithAvatar } from '../../services/imageService';

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
          className="relative w-full max-w-md bg-medium-bg-primary border border-matrix-green/20 rounded-lg shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-matrix-green/20">
            <h3 className="text-lg font-mono text-matrix-green">
              cập_nhật_avatar()
            </h3>
            <button
              onClick={onCancel}
              className="text-medium-text-muted hover:text-matrix-green transition-colors"
            >
              <FaTimes className="w-5 h-5" />
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
                    className="w-24 h-24 rounded-full object-cover border-2 border-matrix-green/30" 
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <div className="w-6 h-6 border-2 border-matrix-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={handleAvatarUploadClick}
                  disabled={isUploading}
                  className="flex items-center space-x-2 px-4 py-2 bg-matrix-green/10 text-matrix-green border border-matrix-green/30 rounded-lg hover:bg-matrix-green/20 transition-colors disabled:opacity-50 font-mono"
                >
                  <FaCamera className="w-4 h-4" />
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
                  className="flex-1 px-4 py-2 text-medium-text-muted border border-medium-border rounded-lg hover:bg-medium-bg-elevated transition-colors font-mono"
                >
                  hủy()
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !avatarFile}
                  className="flex-1 px-4 py-2 bg-matrix-green text-black rounded-lg hover:bg-matrix-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono font-medium"
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
