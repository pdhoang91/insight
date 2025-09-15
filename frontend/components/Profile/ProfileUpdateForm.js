// components/Profile/ProfileUpdateForm.js

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { updateProfileWithAvatar } from '../../services/imageService';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const ProfileUpdateForm = ({ userProfile, onUpdate, onCancel }) => {
  const [name, setName] = useState(userProfile.name || '');
  const [bio, setBio] = useState(userProfile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      const profileData = { name, bio, avatar_url: avatarUrl };
      const response = await updateProfileWithAvatar(profileData, avatarFile);
      
      // Call the parent update callback with the response data
      onUpdate(response.data);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Không thể cập nhật profile. Vui lòng thử lại.");
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
        className={combineClasses(
          'fixed inset-0 flex items-center justify-center z-50 p-2',
          'bg-black/60',
          themeClasses.effects.blur
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCancel}
      >
        <motion.div 
          className={combineClasses(
            'w-full max-w-sm mx-2 relative',
            themeClasses.bg.card || themeClasses.bg.primary,
            'backdrop-blur-sm rounded-lg'
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={combineClasses(
            'flex items-center justify-between',
            themeClasses.spacing.cardSmall
          )}>
            <h2 className={combineClasses(
              themeClasses.typography.h4,
              themeClasses.text.accent,
              'font-mono'
            )}>$ edit_profile</h2>
            <button
              className={combineClasses(
                themeClasses.text.muted,
                themeClasses.text.primaryHover,
                themeClasses.animations.smooth,
                themeClasses.interactive.touchTarget
              )}
              onClick={onCancel}
            >
              <FaTimes className={themeClasses.icons.sm} />
            </button>
          </div>

          {/* Form Content */}
          <div className={themeClasses.spacing.cardMedium}>
            <form onSubmit={handleSubmit} className={themeClasses.spacing.stackMedium}>
              {/* Avatar Section */}
              <div className={combineClasses(
                'flex items-center',
                themeClasses.spacing.gapSmall
              )}>
                <div className={themeClasses.utils.relative}>
                  <img 
                    src={avatarUrl || '/images/placeholder.svg'} 
                    alt="Avatar" 
                    className={combineClasses(
                      'w-16 h-16 rounded-full object-cover'
                    )}
                  />
                  {isUploading && (
                    <div className={combineClasses(
                      themeClasses.utils.absolute,
                      'inset-0 flex items-center justify-center bg-black/50 rounded-full'
                    )}>
                      <div className={combineClasses(
                        'w-4 h-4 border-2 border-matrix-green border-t-transparent rounded-full animate-spin'
                      )}></div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAvatarUploadClick}
                  disabled={isUploading}
                  className={combineClasses(
                    themeClasses.text.accent,
                    themeClasses.text.bodySmall,
                    'font-mono',
                    'hover:text-matrix-green/80',
                    themeClasses.animations.smooth,
                    'disabled:opacity-50'
                  )}
                >
                  {isUploading ? 'đang tải...' : 'đổi_avatar()'}
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
                  className={combineClasses(
                    'w-full px-3 py-2 bg-transparent border-b font-mono',
                    themeClasses.text.primary,
                    'placeholder-medium-text-muted',
                    'border-matrix-green/30 focus:border-matrix-green',
                    'focus:outline-none',
                    themeClasses.animations.smooth
                  )}
                  placeholder="tên_của_bạn"
                  required
                />
              </div>

              {/* Bio Field */}
              <div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={combineClasses(
                    'w-full px-3 py-2 bg-transparent border-b font-mono resize-none',
                    themeClasses.text.primary,
                    'placeholder-medium-text-muted',
                    'border-matrix-green/30 focus:border-matrix-green',
                    'focus:outline-none',
                    themeClasses.animations.smooth
                  )}
                  placeholder="tiểu_sử_của_bạn"
                  rows={3}
                  maxLength={500}
                />
              </div>

              {/* Action Buttons */}
              <div className={combineClasses(
                'flex pt-2',
                themeClasses.spacing.gapSmall
              )}>
                <button 
                  type="submit" 
                  className={combineClasses(
                    'flex-1 font-mono py-2',
                    themeClasses.text.accent,
                    'hover:bg-matrix-green/10',
                    themeClasses.effects.rounded,
                    themeClasses.animations.smooth
                  )}
                >
                  ./update
                </button>
                <button 
                  type="button" 
                  onClick={onCancel}
                  className={combineClasses(
                    'flex-1 font-mono py-2',
                    themeClasses.text.muted,
                    'hover:bg-medium-hover',
                    themeClasses.effects.rounded,
                    themeClasses.animations.smooth
                  )}
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

