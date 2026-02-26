// components/Profile/ProfileHeader.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaCamera } from 'react-icons/fa';
import { getRoleDisplayName, USER_ROLES } from '../../constants/roles';

const ProfileHeader = ({ avatarUrl, name, bio, email, id, onUpdate, isOwner = true, isAdmin = false, userRole = USER_ROLES.USER }) => {
  const [imageError, setImageError] = useState(false);
  const imgSrc = imageError ? '/images/placeholder.svg' : `${avatarUrl || '/images/placeholder.svg'}?t=${new Date().getTime()}`;

  const editButton = onUpdate && (isOwner || isAdmin) && (
    <motion.button
      onClick={onUpdate}
      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg bg-[#1a8917] text-white hover:bg-[#156d12] transition-colors"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <FaCamera className="w-3.5 h-3.5" />
    </motion.button>
  );

  const roleBadge = isAdmin && !isOwner && (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1a8917]/10 text-[#1a8917] text-xs rounded-full">
      <FaShieldAlt className="w-3 h-3" />
      <span>{getRoleDisplayName(userRole)}</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Mobile */}
      <div className="lg:hidden flex flex-col items-center text-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden">
            <img src={imgSrc} alt={`${name}'s avatar`} onError={() => setImageError(true)} className="w-full h-full object-cover" />
          </div>
          {editButton}
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-xl font-bold text-[#292929]">{name}</h1>
          {roleBadge}
          {bio && <p className="text-[14px] text-[#757575] leading-relaxed max-w-xs">{bio}</p>}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex items-start gap-6">
        <div className="flex-shrink-0 relative">
          <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden">
            <img src={imgSrc} alt={`${name}'s avatar`} onError={() => setImageError(true)} className="w-full h-full object-cover" />
          </div>
          {editButton}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <h1 className="font-serif text-2xl font-bold text-[#292929]">{name}</h1>
          {roleBadge}
          {bio && <p className="text-[#757575] leading-relaxed max-w-2xl">{bio}</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
