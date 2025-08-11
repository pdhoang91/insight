// components/Profile/ProfileUpdateForm.js

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaTimes, FaUser, FaFileAlt } from 'react-icons/fa';
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
        className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onCancel}
      >
        <motion.div 
          className="bg-terminal-gray rounded-xl shadow-xl border border-primary w-full max-w-lg mx-4 relative overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-primary">
            <h2 className="text-2xl font-bold text-primary font-mono">update_profile()</h2>
            <button
              className="p-2 text-muted hover:text-secondary rounded-lg hover:bg-elevated transition-colors"
              onClick={onCancel}
              aria-label="Close"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <p className="text-secondary mb-6 font-mono text-sm tech-comment">
              update your profile information
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-4 p-4 bg-elevated rounded-lg border border-primary">
                <div className="relative">
                  <img 
                    src={avatarUrl || '/images/placeholder.svg'} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary" 
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-mono text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Upload Avatar"
                  >
                    <FaUpload size={14} />
                    {isUploading ? 'uploading...' : 'upload_avatar()'}
                  </button>
                  <p className="text-muted text-xs font-mono mt-1">// jpg, png, gif (max 5MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <label className="block text-sm font-mono text-primary flex items-center gap-2">
                  <FaUser className="text-primary" size={14} />
                  name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 font-mono bg-elevated border border-primary text-primary placeholder-muted focus:border-secondary rounded-lg focus:outline-none transition-colors"
                  placeholder="your_name"
                  required
                />
              </div>

              {/* Bio Field */}
              <div className="space-y-2">
                <label className="block text-sm font-mono text-primary flex items-center gap-2">
                  <FaFileAlt className="text-primary" size={14} />
                  bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 font-mono bg-elevated border border-primary text-primary placeholder-muted focus:border-secondary rounded-lg resize-none focus:outline-none transition-colors"
                  placeholder="tell_us_about_yourself"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-muted text-xs font-mono mt-1">// max 500 characters ({bio.length}/500)</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-mono text-sm font-semibold shadow-md transition-transform transform hover:scale-105 active:scale-95 hover:shadow-xl"
                >
                  update()
                </button>
                <button 
                  type="button" 
                  onClick={onCancel} 
                  className="flex-1 bg-elevated text-secondary border border-primary py-3 rounded-lg font-mono text-sm font-semibold hover:bg-terminal-light transition-colors"
                >
                  cancel()
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

