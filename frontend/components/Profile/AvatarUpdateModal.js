// components/Profile/AvatarUpdateModal.js
'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, GoogleLogo, UploadSimple, WarningCircle, Check } from '@phosphor-icons/react';
import { updateProfileWithAvatar } from '../../services/imageService';
import { useTranslations } from 'next-intl';

const springConfig = { type: 'spring', stiffness: 100, damping: 20 };

const AvatarUpdateModal = ({ userProfile, onUpdate, onCancel }) => {
  const t = useTranslations();
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [usingGooglePhoto, setUsingGooglePhoto] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const panelRef = useRef(null);

  const googlePictureUrl = userProfile.google_picture_url;
  const canSubmit = avatarFile || usingGooglePhoto;
  const hasNewSelection = avatarFile || usingGooglePhoto;

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsUploading(true);
    setError(null);
    try {
      const profileData = {
        name: userProfile.name,
        bio: userProfile.bio,
        avatar_url: usingGooglePhoto ? googlePictureUrl : avatarUrl,
      };
      const response = await updateProfileWithAvatar(profileData, usingGooglePhoto ? null : avatarFile);
      onUpdate(response.data);
    } catch {
      setError(t('profile.avatarUpdateFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const processFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5 MB.');
      return;
    }
    setError(null);
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
    setUsingGooglePhoto(false);
  }, []);

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  }, [processFile]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleUseGooglePhoto = () => {
    setError(null);
    setAvatarUrl(googlePictureUrl);
    setAvatarFile(null);
    setUsingGooglePhoto(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={springConfig}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(26, 20, 16, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        onClick={onCancel}
      >
        <motion.form
          ref={panelRef}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={springConfig}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '400px',
            margin: '0 1rem',
            padding: '2rem',
            background: 'var(--bg)',
            border: '1px solid var(--border-mid)',
            borderRadius: '6px',
            boxShadow: '0 24px 48px -12px rgba(26, 20, 16, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          }}
        >
          {/* Close button — matches LoginModal */}
          <button
            type="button"
            onClick={onCancel}
            style={{
              position: 'absolute',
              top: '0.875rem',
              right: '0.875rem',
              padding: '0.4rem',
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s, transform 0.15s',
              lineHeight: 0,
            }}
            className="hover:text-[var(--text)] active:-translate-y-[1px]"
          >
            <X style={{ width: 14, height: 14 }} />
          </button>

          {/* Title */}
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.125rem',
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              margin: '0 0 1.25rem 0',
              lineHeight: 1.1,
            }}
          >
            {t('profile.updateAvatarTitle')}
          </h3>

          {/* Drop zone */}
          <motion.div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            animate={isDragging ? { scale: 1.008 } : { scale: 1 }}
            transition={springConfig}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '1.5rem 1rem',
              background: isDragging ? 'var(--bg-elevated)' : 'var(--bg-surface)',
              border: `1.5px dashed ${isDragging ? 'var(--accent)' : 'var(--border-mid)'}`,
              borderRadius: '4px',
              cursor: isUploading ? 'default' : 'pointer',
              transition: 'background 0.2s, border-color 0.2s',
              userSelect: 'none',
            }}
          >
            {/* Avatar ring + preview */}
            <motion.div
              style={{ borderRadius: '50%' }}
              animate={
                hasNewSelection
                  ? { boxShadow: '0 0 0 2.5px var(--accent), 0 0 0 5px var(--accent-light)' }
                  : { boxShadow: '0 0 0 0px var(--accent), 0 0 0 0px var(--accent-light)' }
              }
              transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-mid)',
                }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={22} style={{ color: 'var(--text-faint)' }} />
                  </div>
                )}
              </div>
            </motion.div>

            <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: isDragging ? 'var(--accent)' : 'var(--text)',
                  marginBottom: '0.2rem',
                  transition: 'color 0.2s',
                }}
              >
                <UploadSimple size={13} />
                {isDragging ? 'Drop to upload' : t('profile.choosePhoto')}
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-faint)',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                PNG, JPG up to 5 MB
              </p>
            </div>

            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

            {/* Upload overlay */}
            <AnimatePresence>
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: 'rgba(242, 237, 228, 0.88)',
                    backdropFilter: 'blur(2px)',
                  }}
                >
                  <motion.div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: '2px solid var(--border-mid)',
                      borderTopColor: 'var(--accent)',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--text-muted)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {t('profile.uploading')}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Google photo option */}
          {googlePictureUrl && (
            <button
              type="button"
              onClick={handleUseGooglePhoto}
              disabled={isUploading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                marginTop: '0.625rem',
                padding: '0.6rem 0.75rem',
                fontFamily: 'var(--font-display)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: usingGooglePhoto ? 'var(--accent)' : 'var(--text-muted)',
                background: usingGooglePhoto ? 'var(--accent-light)' : 'transparent',
                border: `1px solid ${usingGooglePhoto ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '4px',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                opacity: isUploading ? 0.5 : 1,
                transition: 'color 0.2s, background 0.2s, border-color 0.2s',
              }}
              className="hover:bg-[var(--bg-surface)]"
            >
              <GoogleLogo size={14} />
              <span style={{ flex: 1, textAlign: 'left' }}>Use Google Account photo</span>
              <AnimatePresence>
                {usingGooglePhoto && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Check size={12} weight="bold" style={{ color: 'var(--accent)' }} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}

          {/* Inline error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  background: 'rgba(220, 38, 38, 0.08)',
                  border: '1px solid rgba(220, 38, 38, 0.2)',
                  borderRadius: '4px',
                  color: '#B91C1C',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8125rem',
                  letterSpacing: '-0.01em',
                }}
              >
                <WarningCircle size={13} style={{ flexShrink: 0 }} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '0.625rem 1rem',
                fontFamily: 'var(--font-display)',
                fontSize: '0.875rem',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: 'var(--text-muted)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-mid)',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
              className="hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] active:-translate-y-[1px]"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isUploading || !canSubmit}
              style={{
                flex: 1,
                padding: '0.625rem 1rem',
                fontFamily: 'var(--font-display)',
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: 'var(--text-inverse)',
                background: 'var(--accent)',
                border: '1px solid transparent',
                borderRadius: '4px',
                cursor: isUploading || !canSubmit ? 'not-allowed' : 'pointer',
                opacity: isUploading || !canSubmit ? 0.45 : 1,
                transition: 'background 0.2s, opacity 0.2s',
              }}
              className="hover:bg-[var(--accent-dark)] active:-translate-y-[1px] disabled:hover:bg-[var(--accent)]"
            >
              {isUploading ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
};

export default AvatarUpdateModal;
