// components/Profile/ProfileHeader.js
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const ProfileHeader = ({ avatarUrl, name, bio, email, id, onUpdate }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <motion.div 
      className="relative overflow-hidden mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-terminal-grid opacity-10 pointer-events-none"></div>
      
      {/* Main Container */}
      <div className="relative bg-gradient-terminal border border-matrix-green/20 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-terminal backdrop-blur-terminal">
        
        {/* Mobile Layout (Stack) */}
        <div className="block sm:hidden">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Avatar */}
            <motion.div 
              className="relative group"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="relative">
                {/* Avatar Ring */}
                <div className="absolute -inset-1 bg-gradient-neon rounded-full opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Avatar Image */}
                <div className="relative w-20 h-20">
                  <img
                    src={imageError ? '/default-avatar.png' : `${avatarUrl || '/default-avatar.png'}?t=${new Date().getTime()}`}
                    alt={`${name}'s avatar`}
                    onError={handleImageError}
                    className="w-full h-full rounded-full object-cover border-2 border-matrix-green/30 shadow-neon-green group-hover:shadow-neon-cyan transition-all duration-300"
                  />
                </div>
              </div>
              
              {/* Scan Line Effect */}
              <div className="absolute inset-0 scan-line rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>

            {/* User Info */}
            <div className="space-y-2">
              <motion.h1 
                className="text-xl font-bold text-gradient-matrix font-matrix leading-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {name}
              </motion.h1>

              {bio && (
                <motion.p 
                  className="text-sm text-muted leading-relaxed font-mono max-w-xs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {bio}
                </motion.p>
              )}
            </div>

            {/* Edit Button */}
            {onUpdate && (
              <motion.button
                onClick={onUpdate}
                className="group relative p-3 bg-matrix-green/10 hover:bg-matrix-green/20 text-matrix-green border border-matrix-green/30 hover:border-matrix-green/50 rounded-full transition-all duration-200 hover:shadow-neon-green active:scale-95"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Edit Icon */}
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                  />
                </svg>
                
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-terminal-dark text-matrix-green text-xs font-mono px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-matrix-green/20">
                  edit_profile()
                </div>
              </motion.button>
            )}
          </div>
        </div>

        {/* Desktop Layout (3 Columns) */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-6 items-center">
          
          {/* Left Column - Avatar */}
          <motion.div 
            className="relative group flex justify-start"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="relative">
              {/* Avatar Ring */}
              <div className="absolute -inset-1 bg-gradient-neon rounded-full opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Avatar Image */}
              <div className="relative w-24 h-24 lg:w-28 lg:h-28">
                <img
                  src={imageError ? '/default-avatar.png' : `${avatarUrl || '/default-avatar.png'}?t=${new Date().getTime()}`}
                  alt={`${name}'s avatar`}
                  onError={handleImageError}
                  className="w-full h-full rounded-full object-cover border-2 border-matrix-green/30 shadow-neon-green group-hover:shadow-neon-cyan transition-all duration-300"
                />
              </div>
            </div>
            
            {/* Scan Line Effect */}
            <div className="absolute inset-0 scan-line rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.div>

          {/* Center Column - User Info */}
          <div className="text-left">
            {/* Name */}
            <motion.h1 
              className="text-2xl lg:text-3xl font-bold text-gradient-matrix font-matrix leading-tight mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {name}
            </motion.h1>

            {/* Bio */}
            {bio && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm lg:text-base text-muted leading-relaxed font-mono">
                  {bio}
                </p>
              </motion.div>
            )}
          </div>

          {/* Right Column - Edit Button */}
          {onUpdate && (
            <motion.div 
              className="flex justify-end"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={onUpdate}
                className="group relative p-3 lg:p-4 bg-matrix-green/10 hover:bg-matrix-green/20 text-matrix-green border border-matrix-green/30 hover:border-matrix-green/50 rounded-xl transition-all duration-200 hover:shadow-neon-green active:scale-95"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Edit Icon */}
                <svg 
                  className="w-5 h-5 lg:w-6 lg:h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                  />
                </svg>
                
                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-matrix-green/5 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                
                {/* Tooltip */}
                <div className="absolute -top-12 right-0 bg-terminal-dark text-matrix-green text-xs font-mono px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-matrix-green/20 shadow-neon-green">
                  edit_profile()
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-matrix-green/20"></div>
                </div>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
