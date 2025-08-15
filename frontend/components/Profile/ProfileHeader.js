// components/Profile/ProfileHeader.js
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaEdit, FaShieldAlt } from 'react-icons/fa';
import { getRoleDisplayName, USER_ROLES } from '../../constants/roles';

const ProfileHeader = ({ avatarUrl, name, bio, email, id, onUpdate, isOwner = true, isAdmin = false, userRole = USER_ROLES.USER }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <motion.div 
      className="mb-8"
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
          </motion.div>

          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h1 className="text-xl font-bold text-white">
              {name}
            </h1>
            
            {/* Role Badge */}
            {isAdmin && !isOwner && (
              <div className="inline-flex items-center space-x-1 px-2 py-1 bg-matrix-green/10 text-matrix-green rounded text-xs">
                <FaShieldAlt className="w-3 h-3" />
                <span>{getRoleDisplayName(userRole)}</span>
              </div>
            )}

            {/* Bio */}
            {bio && (
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                {bio}
              </p>
            )}
          </motion.div>

          {/* Edit Button */}
          {onUpdate && (isOwner || isAdmin) && (
            <motion.button
              onClick={onUpdate}
              className="flex items-center space-x-2 px-4 py-2 text-matrix-green hover:bg-matrix-green/10 rounded-lg transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <FaEdit className="w-4 h-4" />
              <span className="text-sm font-medium">Edit Profile</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex items-start space-x-6">
        {/* Avatar */}
        <motion.div 
          className="flex-shrink-0"
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
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  {name}
                </h1>
                
                {/* Role Badge */}
                {isAdmin && !isOwner && (
                  <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1 bg-matrix-green/10 text-matrix-green rounded-md text-sm">
                    <FaShieldAlt className="w-4 h-4" />
                    <span>{getRoleDisplayName(userRole)}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {bio && (
                <p className="text-gray-400 leading-relaxed max-w-2xl">
                  {bio}
                </p>
              )}
            </div>

            {/* Edit Button */}
            {onUpdate && (isOwner || isAdmin) && (
              <motion.button
                onClick={onUpdate}
                className="flex items-center space-x-2 px-4 py-2 text-matrix-green hover:bg-matrix-green/10 rounded-lg transition-colors flex-shrink-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaEdit className="w-4 h-4" />
                <span className="text-sm font-medium">Edit Profile</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
