'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, ShieldCheck } from '@phosphor-icons/react';
import { getRoleDisplayName, USER_ROLES } from '../../constants/roles';

const AVATAR_SIZE = 72;

const AvatarEditable = ({ imgSrc, name, onUpdate, onError }) => (
  <motion.button
    onClick={onUpdate}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 16 }}
    whileTap={{ scale: 0.97 }}
    aria-label="Update avatar"
    className="group"
    style={{
      position: 'relative',
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: '50%',
      overflow: 'hidden',
      background: 'var(--bg-surface)',
      border: '2px solid var(--border-mid)',
      cursor: 'pointer',
      padding: 0,
      display: 'block',
    }}
  >
    <img
      src={imgSrc}
      alt={`${name}'s avatar`}
      onError={onError}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
    {/* Full overlay — visible on hover-capable devices */}
    <div
      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
      style={{
        background: 'rgba(26, 20, 16, 0.48)',
        transition: 'opacity 0.2s',
      }}
    >
      <Camera size={18} color="var(--text-inverse)" />
    </div>
    {/* Persistent badge — always visible, hides on hover (desktop) */}
    <div
      className="group-hover:opacity-0"
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: 'var(--accent)',
        border: '2px solid var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.2s',
      }}
    >
      <Camera size={9} weight="bold" color="var(--text-inverse)" />
    </div>
  </motion.button>
);

const AvatarReadOnly = ({ imgSrc, name, onError }) => (
  <div
    style={{
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: '50%',
      overflow: 'hidden',
      background: 'var(--bg-surface)',
      border: '2px solid var(--border-mid)',
    }}
  >
    <img
      src={imgSrc}
      alt={`${name}'s avatar`}
      onError={onError}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  </div>
);

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
          {canEdit ? (
            <AvatarEditable
              imgSrc={imgSrc}
              name={name}
              onUpdate={onUpdate}
              onError={() => setImageError(true)}
            />
          ) : (
            <AvatarReadOnly
              imgSrc={imgSrc}
              name={name}
              onError={() => setImageError(true)}
            />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}
            className="justify-center sm:justify-start"
          >
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
                <ShieldCheck size={9} />
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
