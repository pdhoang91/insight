// components/Profile/ProfileUpdateForm.js

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaTimes, FaUser, FaFileAlt, FaTerminal, FaCode, FaLaptopCode, FaRocket } from 'react-icons/fa';
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
        className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onCancel}
      >
        <motion.div 
          className="bg-gradient-to-br from-terminal-dark via-terminal-black to-terminal-dark rounded-xl shadow-2xl border border-matrix-green/30 w-full max-w-lg mx-4 relative overflow-hidden"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glowing border effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-matrix-green to-transparent animate-pulse" />
          {/* Header */}
          <div className="relative p-6 border-b border-matrix-green/20">
            {/* Terminal Header */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-2 text-matrix-green text-sm font-mono mb-3"
            >
              <FaTerminal className="w-4 h-4" />
              <span>~/dev/profile/edit $</span>
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-4 bg-matrix-green inline-block"
              />
            </motion.div>
            
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary font-mono">update_profile()</h2>
              <button
                className="p-2 text-text-muted hover:text-matrix-green rounded-lg hover:bg-terminal-gray/50 transition-colors"
                onClick={onCancel}
                aria-label="Close"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-text-muted mb-6 font-mono text-sm"
            >
              <span className="text-matrix-green">//</span> update your profile information
            </motion.p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-matrix-green/20 to-matrix-cyan/20 rounded-lg blur opacity-75" />
                <div className="relative flex items-center space-x-4 p-4 bg-terminal-gray/50 rounded-lg border border-matrix-green/20">
                  <div className="relative">
                    <img 
                      src={avatarUrl || '/images/placeholder.svg'} 
                      alt="Avatar" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-matrix-green/40" 
                    />
                    {/* Tech badge */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-matrix-green rounded-full flex items-center justify-center border-2 border-terminal-dark">
                      <FaLaptopCode className="w-2 h-2 text-terminal-black" />
                    </div>
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <svg className="animate-spin h-6 w-6 text-matrix-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4">
                          </circle>
                          <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8v8H4z">
                          </path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={handleAvatarUploadClick}
                      disabled={isUploading}
                      className="group relative overflow-hidden bg-gradient-to-r from-matrix-green/10 to-matrix-green/5 border border-matrix-green/30 rounded-lg px-4 py-2 hover:border-matrix-green/50 transition-all duration-300 font-mono text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Upload Avatar"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-matrix-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center space-x-2">
                        <FaUpload className="w-3 h-3 text-matrix-green" />
                        <span className="text-matrix-green">
                          {isUploading ? 'uploading...' : 'upload_avatar()'}
                        </span>
                      </div>
                    </button>
                    <p className="text-text-muted text-xs font-mono mt-1">
                      <span className="text-matrix-green">//</span> jpg, png, gif (max 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </motion.div>

              {/* Name Field */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <label className="block text-sm font-mono text-matrix-green flex items-center gap-2">
                  <FaUser className="text-matrix-green" size={14} />
                  <span>const name =</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 font-mono bg-terminal-gray/50 border border-matrix-green/20 text-text-primary placeholder-text-muted focus:border-matrix-green/50 rounded-lg focus:outline-none transition-colors"
                    placeholder="'your_name'"
                    required
                  />
                </div>
              </motion.div>

              {/* Bio Field */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <label className="block text-sm font-mono text-matrix-green flex items-center gap-2">
                  <FaCode className="text-matrix-green" size={14} />
                  <span>const bio =</span>
                </label>
                <div className="relative">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-3 font-mono bg-terminal-gray/50 border border-matrix-green/20 text-text-primary placeholder-text-muted focus:border-matrix-green/50 rounded-lg resize-none focus:outline-none transition-colors"
                    placeholder="'tell_us_about_yourself'"
                    rows={4}
                    maxLength={500}
                  />
                </div>
                <p className="text-text-muted text-xs font-mono">
                  <span className="text-matrix-green">//</span> max 500 characters ({bio.length}/500)
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-3 pt-6"
              >
                <motion.button 
                  type="submit" 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 group relative overflow-hidden bg-gradient-to-r from-matrix-green/10 to-matrix-green/5 border border-matrix-green/30 rounded-lg py-3 hover:border-matrix-green/50 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-matrix-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center space-x-2">
                    <FaRocket className="w-4 h-4 text-matrix-green" />
                    <span className="font-mono text-sm font-semibold text-matrix-green">update()</span>
                  </div>
                </motion.button>
                <motion.button 
                  type="button" 
                  onClick={onCancel}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 group relative overflow-hidden bg-terminal-gray/50 border border-matrix-green/20 rounded-lg py-3 hover:border-matrix-green/40 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-hacker-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center space-x-2">
                    <FaTimes className="w-4 h-4 text-text-muted group-hover:text-hacker-red transition-colors" />
                    <span className="font-mono text-sm font-semibold text-text-muted group-hover:text-hacker-red transition-colors">cancel()</span>
                  </div>
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileUpdateForm;

