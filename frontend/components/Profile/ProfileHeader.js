'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaShieldAlt } from 'react-icons/fa';
import { getRoleDisplayName, USER_ROLES } from '../../constants/roles';

const ProfileHeader = ({
  avatarUrl,
  name,
  bio,
  email,
  id,
  onUpdate,
  isOwner = true,
  isAdmin = false,
  userRole = USER_ROLES.USER,
}) => {
  const [imageError, setImageError] = useState(false);
  const imgSrc = imageError
    ? '/images/placeholder.svg'
    : `${avatarUrl || '/images/placeholder.svg'}?t=${new Date().getTime()}`;

  const canEdit = onUpdate && (isOwner || isAdmin);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        paddingBottom: '2.5rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '2.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1.5rem',
        }}
        className="flex-col items-center text-center sm:flex-row sm:items-start sm:text-left"
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'var(--bg-surface)',
              border: '2px solid var(--border-mid)',
            }}
          >
            <img
              src={imgSrc}
              alt={`${name}'s avatar`}
              onError={() => setImageError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {canEdit && (
            <motion.button
              onClick={onUpdate}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 16 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--accent)',
                color: 'var(--text-inverse)',
                border: '2px solid var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                transition: 'background 0.2s',
              }}
              aria-label="Update avatar"
            >
              <FaCamera style={{ width: 10, height: 10 }} />
            </motion.button>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.5rem',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                color: 'var(--text)',
                margin: 0,
              }}
            >
              {name}
            </h1>

            {isAdmin && !isOwner && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                  background: 'var(--accent-light)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '2px',
                }}
              >
                <FaShieldAlt style={{ width: 9, height: 9 }} />
                {getRoleDisplayName(userRole)}
              </span>
            )}
          </div>

          {bio && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: 'var(--text-muted)',
                margin: '0.35rem 0 0 0',
                maxWidth: '52ch',
              }}
            >
              {bio}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
