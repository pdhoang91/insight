// components/Profile/ProfileHeader.js
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const ProfileHeader = ({ avatarUrl, name, bio, email, id, onUpdate }) => {
  return (
    <motion.div 
      className="mb-6 bg-surface rounded-xl shadow-sm border border-border-primary overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6 sm:p-8">
        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-2 gap-6 sm:gap-8">
          
          {/* Left Column */}
          <div className="space-y-4">
            {/* Avatar - No edit icon */}
            <div className="relative">
              <img
                src={`${avatarUrl || '/default-avatar.png'}?t=${new Date().getTime()}`}
                alt="Avatar"
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full object-cover border-4 border-primary/20 shadow-lg"
              />
            </div>

            {/* Edit Profile Button */}
            {onUpdate && (
              <button
                onClick={onUpdate}
                className="w-full sm:w-auto px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors border border-primary/20 hover:border-primary/30 font-mono text-sm"
              >
                edit_profile()
              </button>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-3 flex flex-col justify-center">
            {/* Name */}
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary leading-tight font-matrix">
                {name}
              </h2>
            </div>
            
            {/* Email */}
            {email && (
              <div>
                <p className="text-sm sm:text-base text-secondary font-mono">
                  {email}
                </p>
              </div>
            )}

            {/* Bio - Moved to right column if short */}
            {bio && bio.length <= 100 && (
              <div>
                <p className="text-sm text-muted leading-relaxed">
                  {bio}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bio Section - Full Width for longer bios */}
        {bio && bio.length > 100 && (
          <div className="mt-6 pt-6 border-t border-border-primary">
            <div className="mb-2">
              <span className="text-xs font-mono text-secondary uppercase tracking-wider">
                // bio
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              {bio}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
