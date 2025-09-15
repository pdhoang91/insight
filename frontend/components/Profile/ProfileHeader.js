// components/Profile/ProfileHeader.js
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaEdit, FaShieldAlt, FaCamera } from 'react-icons/fa';
import { getRoleDisplayName, USER_ROLES } from '../../constants/roles';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const ProfileHeader = ({ avatarUrl, name, bio, email, id, onUpdate, isOwner = true, isAdmin = false, userRole = USER_ROLES.USER }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <motion.div 
      className={themeClasses.bg.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Mobile Layout */}
      <div className={themeClasses.responsive.mobileOnly}>
        <div className={combineClasses(
          'flex flex-col items-center text-center',
          themeClasses.spacing.stackLarge
        )}>
          {/* Avatar */}
          <motion.div 
            className={themeClasses.utils.relative}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className={combineClasses(
              themeClasses.avatar.xl,
              themeClasses.utils.overflowHidden
            )}>
              <img
                src={imageError ? '/images/placeholder.svg' : `${avatarUrl || '/images/placeholder.svg'}?t=${new Date().getTime()}`}
                alt={`${name}'s avatar`}
                onError={handleImageError}
                className={combineClasses(
                  themeClasses.utils.full,
                  'object-cover'
                )}
              />
            </div>
            {/* Avatar Edit Icon */}
            {onUpdate && (isOwner || isAdmin) && (
              <motion.button
                onClick={onUpdate}
                className={combineClasses(
                  themeClasses.utils.absolute,
                  '-bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center',
                  themeClasses.effects.shadowLarge,
                  themeClasses.bg.accent,
                  themeClasses.text.white,
                  'hover:bg-medium-accent-green/90',
                  themeClasses.animations.smooth
                )}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaCamera className={themeClasses.icons.xs} />
              </motion.button>
            )}
          </motion.div>

          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={themeClasses.spacing.stackSmall}
          >
            <h1 className={combineClasses(
              themeClasses.typography.h3,
              themeClasses.text.primary
            )}>
              {name}
            </h1>
            
            {/* Role Badge */}
            {isAdmin && !isOwner && (
              <div className={combineClasses(
                themeClasses.tag.primary,
                'inline-flex items-center',
                themeClasses.spacing.gapSmall
              )}>
                <FaShieldAlt className={themeClasses.icons.xs} />
                <span>{getRoleDisplayName(userRole)}</span>
              </div>
            )}

            {/* Bio */}
            {bio && (
              <p className={combineClasses(
                themeClasses.typography.bodySmall,
                themeClasses.text.secondary,
                'leading-relaxed max-w-xs'
              )}>
                {bio}
              </p>
            )}
          </motion.div>

        </div>
      </div>

      {/* Desktop Layout */}
      <div className={combineClasses(
        themeClasses.responsive.desktopOnly,
        'flex items-start',
        themeClasses.spacing.gap
      )}>
        {/* Avatar */}
        <motion.div 
          className={combineClasses(
            'flex-shrink-0',
            themeClasses.utils.relative
          )}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={combineClasses(
            'w-24 h-24 lg:w-28 lg:h-28',
            themeClasses.avatar.xl,
            themeClasses.utils.overflowHidden
          )}>
            <img
              src={imageError ? '/images/placeholder.svg' : `${avatarUrl || '/images/placeholder.svg'}?t=${new Date().getTime()}`}
              alt={`${name}'s avatar`}
              onError={handleImageError}
              className={combineClasses(
                themeClasses.utils.full,
                'object-cover'
              )}
            />
          </div>
          {/* Avatar Edit Icon */}
          {onUpdate && (isOwner || isAdmin) && (
            <motion.button
              onClick={onUpdate}
              className={combineClasses(
                themeClasses.utils.absolute,
                '-bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center',
                themeClasses.effects.shadowLarge,
                themeClasses.bg.accent,
                themeClasses.text.white,
                'hover:bg-medium-accent-green/90',
                themeClasses.animations.smooth
              )}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCamera className={themeClasses.icons.sm} />
            </motion.button>
          )}
        </motion.div>

        {/* User Info */}
        <motion.div 
          className={combineClasses(
            'flex-1 min-w-0'
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={combineClasses(
            'flex items-start justify-between'
          )}>
            <div className={themeClasses.spacing.stackSmall}>
              <div>
                <h1 className={combineClasses(
                  themeClasses.typography.h2,
                  themeClasses.text.primary
                )}>
                  {name}
                </h1>
                
                {/* Role Badge */}
                {isAdmin && !isOwner && (
                  <div className={combineClasses(
                    'mt-2',
                    themeClasses.badge.primary,
                    'inline-flex items-center',
                    themeClasses.spacing.gapSmall
                  )}>
                    <FaShieldAlt className={themeClasses.icons.sm} />
                    <span>{getRoleDisplayName(userRole)}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {bio && (
                <p className={combineClasses(
                  themeClasses.text.secondary,
                  'leading-relaxed max-w-2xl'
                )}>
                  {bio}
                </p>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
