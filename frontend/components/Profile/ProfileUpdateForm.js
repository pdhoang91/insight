// components/Profile/ProfileUpdateForm.js

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { uploadImage } from '../../services/imageService';

const ProfileUpdateForm = ({ userProfile, onUpdate, onCancel }) => {
  const [name, setName] = useState(userProfile.name || '');
  const [bio, setBio] = useState(userProfile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ name, bio, avatar_url: avatarUrl });
  };

  const handleAvatarUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file, "avatar");
      setAvatarUrl(imageUrl);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert("Không thể tải lên hình ảnh. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCancel}
      >
        <motion.div 
          className="bg-black/20 backdrop-blur-sm rounded-lg w-full max-w-sm mx-2 relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-lg font-mono text-matrix-green">$ edit_profile</h2>
            <button
              className="text-gray-400 hover:text-white transition-colors"
              onClick={onCancel}
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Section */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src={avatarUrl || '/images/placeholder.svg'} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full object-cover" 
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <div className="w-4 h-4 border-2 border-matrix-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAvatarUploadClick}
                  disabled={isUploading}
                  className="text-matrix-green text-sm font-mono hover:text-matrix-green/80 transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'uploading...' : 'change_avatar()'}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Name Field */}
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent text-white placeholder-gray-400 border-b border-matrix-green/30 focus:border-matrix-green font-mono focus:outline-none transition-colors"
                  placeholder="your_name"
                  required
                />
              </div>

              {/* Bio Field */}
              <div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent text-white placeholder-gray-400 border-b border-matrix-green/30 focus:border-matrix-green font-mono resize-none focus:outline-none transition-colors"
                  placeholder="your_bio"
                  rows={3}
                  maxLength={500}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 text-matrix-green font-mono hover:bg-matrix-green/10 rounded py-2 transition-colors"
                >
                  ./update
                </button>
                <button 
                  type="button" 
                  onClick={onCancel}
                  className="flex-1 text-gray-400 font-mono hover:bg-gray-400/10 rounded py-2 transition-colors"
                >
                  ./cancel
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileUpdateForm;

