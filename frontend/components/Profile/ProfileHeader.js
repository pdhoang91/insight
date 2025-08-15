// components/Profile/ProfileHeader.js
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaUser, FaEdit, FaTerminal, FaCode, FaLaptopCode } from 'react-icons/fa';

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
      {/* Main Container */}
      <div className="relative bg-gradient-to-br from-terminal-dark via-terminal-black to-terminal-dark border border-matrix-green/30 rounded-xl p-4 sm:p-6 lg:p-8 shadow-2xl backdrop-blur-sm">
        
        {/* Glowing border effect */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-matrix-green to-transparent animate-pulse" />
        
        {/* Terminal Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center space-x-2 text-matrix-green text-sm font-mono mb-4"
        >
          <FaTerminal className="w-4 h-4" />
          <span>~/dev/profile $</span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-4 bg-matrix-green inline-block"
          />
        </motion.div>
        
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
                <div className="absolute -inset-1 bg-gradient-to-r from-matrix-green/50 to-matrix-cyan/50 rounded-full opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Avatar Image */}
                <div className="relative w-20 h-20">
                  <img
                    src={imageError ? '/images/placeholder.svg' : `${avatarUrl || '/images/placeholder.svg'}?t=${new Date().getTime()}`}
                    alt={`${name}'s avatar`}
                    onError={handleImageError}
                    className="w-full h-full rounded-full object-cover border-2 border-matrix-green/40 group-hover:border-matrix-green/60 transition-all duration-300"
                  />
                  {/* Tech badge */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-matrix-green rounded-full flex items-center justify-center border-2 border-terminal-dark">
                    <FaLaptopCode className="w-3 h-3 text-terminal-black" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* User Info */}
            <div className="space-y-3">
              <motion.h1 
                className="text-xl font-bold text-text-primary leading-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {name}
              </motion.h1>

              {bio && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-matrix-cyan/20 to-matrix-green/20 rounded-lg blur opacity-75" />
                  <div className="relative bg-terminal-gray/50 border border-matrix-green/20 rounded-lg p-3">
                    <p className="text-sm text-text-muted leading-relaxed font-mono">
                      {bio}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Edit Button */}
            {onUpdate && (
              <motion.button
                onClick={onUpdate}
                className="group relative overflow-hidden bg-gradient-to-r from-matrix-green/10 to-matrix-green/5 border border-matrix-green/30 rounded-lg px-6 py-3 hover:border-matrix-green/50 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-matrix-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center space-x-2">
                  <FaEdit className="w-4 h-4 text-matrix-green" />
                  <span className="text-sm font-medium text-matrix-green">Edit Profile</span>
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
              <div className="absolute -inset-1 bg-gradient-to-r from-matrix-green/50 to-matrix-cyan/50 rounded-full opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Avatar Image */}
              <div className="relative w-24 h-24 lg:w-28 lg:h-28">
                <img
                  src={imageError ? '/images/placeholder.svg' : `${avatarUrl || '/images/placeholder.svg'}?t=${new Date().getTime()}`}
                  alt={`${name}'s avatar`}
                  onError={handleImageError}
                  className="w-full h-full rounded-full object-cover border-2 border-matrix-green/40 group-hover:border-matrix-green/60 transition-all duration-300"
                />
                {/* Tech badge */}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 lg:w-8 lg:h-8 bg-matrix-green rounded-full flex items-center justify-center border-2 border-terminal-dark">
                  <FaLaptopCode className="w-3 h-3 lg:w-4 lg:h-4 text-terminal-black" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Center Column - User Info */}
          <div className="text-left space-y-4">
            {/* Name */}
            <motion.h1 
              className="text-2xl lg:text-3xl font-bold text-text-primary leading-tight"
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
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-matrix-cyan/20 to-matrix-green/20 rounded-lg blur opacity-75" />
                <div className="relative bg-terminal-gray/50 border border-matrix-green/20 rounded-lg p-4">
                  <p className="text-sm lg:text-base text-text-muted leading-relaxed font-mono">
                    {bio}
                  </p>
                </div>
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
              <motion.button
                onClick={onUpdate}
                className="group relative overflow-hidden bg-gradient-to-r from-matrix-green/10 to-matrix-green/5 border border-matrix-green/30 rounded-lg px-6 py-3 lg:px-8 lg:py-4 hover:border-matrix-green/50 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-matrix-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center space-x-3">
                  <FaEdit className="w-4 h-4 lg:w-5 lg:h-5 text-matrix-green" />
                  <span className="text-sm lg:text-base font-medium text-matrix-green">Edit Profile</span>
                </div>
                
                {/* Terminal tooltip */}
                <div className="absolute -top-12 right-0 bg-terminal-dark text-matrix-green text-xs font-mono px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-matrix-green/20">
                  $ edit_profile --user
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-matrix-green/20"></div>
                </div>
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
