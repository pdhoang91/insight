// components/Profile/AvatarUpdateModal.js
'use client';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, GoogleLogo } from '@phosphor-icons/react';
import { updateProfileWithAvatar } from '../../services/imageService';
import { useTranslations } from 'next-intl';

const AvatarUpdateModal = ({ userProfile, onUpdate, onCancel }) => {
  const t = useTranslations();
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [usingGooglePhoto, setUsingGooglePhoto] = useState(false);
  const fileInputRef = useRef(null);

  const googlePictureUrl = userProfile.google_picture_url;
  const canSubmit = avatarFile || usingGooglePhoto;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsUploading(true);
    try {
      const profileData = {
        name: userProfile.name,
        bio: userProfile.bio,
        avatar_url: usingGooglePhoto ? googlePictureUrl : avatarUrl,
      };
      const response = await updateProfileWithAvatar(profileData, usingGooglePhoto ? null : avatarFile);
      onUpdate(response.data);
    } catch (error) {
      console.error('Failed to update avatar:', error);
      alert(t('profile.avatarUpdateFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
    setUsingGooglePhoto(false);
  };

  const handleUseGooglePhoto = () => {
    setAvatarUrl(googlePictureUrl);
    setAvatarFile(null);
    setUsingGooglePhoto(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

        <motion.div
          className="relative w-full max-w-md bg-white border border-[#e6e6e6] rounded-xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <div className="flex items-center justify-between p-5 border-b border-[#f2f2f2]">
            <h3 className="font-serif text-lg font-bold text-[#292929]">{t('profile.updateAvatarTitle')}</h3>
            <button onClick={onCancel} className="text-[#b3b3b1] hover:text-[#292929] transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={avatarUrl || '/images/placeholder.svg'}
                    alt="Avatar Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#e6e6e6]"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-4 py-2 text-[13px] text-[#1a8917] border border-[#1a8917]/30 rounded-full hover:bg-[#1a8917]/5 transition-colors disabled:opacity-50"
                  >
                    <Camera size={16} />
                    <span>{isUploading ? t('profile.uploading') : t('profile.choosePhoto')}</span>
                  </button>

                  {googlePictureUrl && (
                    <button
                      type="button"
                      onClick={handleUseGooglePhoto}
                      disabled={isUploading}
                      className={`flex items-center gap-2 px-4 py-2 text-[13px] border rounded-full transition-colors disabled:opacity-50 ${
                        usingGooglePhoto
                          ? 'text-[#4285F4] border-[#4285F4]/50 bg-[#4285F4]/5'
                          : 'text-[#757575] border-[#e6e6e6] hover:bg-[#fafafa]'
                      }`}
                    >
                      <GoogleLogo size={16} />
                      <span>Use Google Account photo</span>
                    </button>
                  )}
                </div>

                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 text-[13px] text-[#757575] border border-[#e6e6e6] rounded-full hover:bg-[#fafafa] transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !canSubmit}
                  className="flex-1 px-4 py-2.5 text-[13px] text-white bg-[#1a8917] rounded-full hover:bg-[#156d12] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? t('common.saving') : t('common.save')}
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
