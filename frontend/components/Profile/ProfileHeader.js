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
      className=""
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Mobile Layout */}
      <div className="block sm:hidden">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-20 h-20 rounded-full overflow-hidden">
              <img
                src={imageError ? '/images/placeholder.svg' : `${avatarUrl || '/images/placeholder.svg'}?t=${new Date().getTime()}`}
                alt={`${name}'s avatar`}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Avatar Edit Icon */}
            {onUpdate && (isOwner || isAdmin) && (
              <motion.button
                onClick={onUpdate}
                className={combineClasses(
                  'absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg',
                  themeClasses.bg.accent,
                  'text-black hover:bg-medium-accent-green/90',
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
            className="space-y-2"
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
                'inline-flex items-center space-x-1 px-2 py-1 rounded text-xs',
                themeClasses.bg.accentLight,
                themeClasses.text.accent
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
      <div className="hidden sm:flex items-start space-x-6">
        {/* Avatar */}
        <motion.div 
          className="flex-shrink-0 relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden">
            <img
              src={imageError ? '/images/placeholder.svg' : `${avatarUrl || '/images/placeholder.svg'}?t=${new Date().getTime()}`}
              alt={`${name}'s avatar`}
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Avatar Edit Icon */}
          {onUpdate && (isOwner || isAdmin) && (
            <motion.button
              onClick={onUpdate}
              className={combineClasses(
                'absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center shadow-lg',
                themeClasses.bg.accent,
                'text-black hover:bg-medium-accent-green/90',
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
          className="flex-1 min-w-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-3">
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
                    'mt-2 inline-flex items-center space-x-2 px-3 py-1 rounded-md text-sm',
                    themeClasses.bg.accentLight,
                    themeClasses.text.accent
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
