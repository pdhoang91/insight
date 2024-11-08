// components/Profile/ProfileHeader.js
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const ProfileHeader = ({ avatarUrl, name, phone, dob, onUpdate }) => {
  return (
    <motion.div 
      className="mb-6 flex items-center p-4 bg-white rounded-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <img
          src={avatarUrl || '/default-avatar.png'}
          alt="Avatar"
          className="w-32 h-32 rounded-full mr-4 object-cover"
        />
        {onUpdate && (
          <button 
            onClick={onUpdate} 
            className="absolute bottom-0 right-0 bg-blue-400 text-white rounded-full p-2 hover:bg-blue-500 transition"
            title="Update Avatar"
          >
            ✎
          </button>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-semibold">{name}</h2>
        <p className="text-gray-600">Phone: {phone || 'N/A'}</p>
        <p className="text-gray-600">Date of Birth: {dob || 'N/A'}</p>
        {/* Nếu bạn có liên kết cần sử dụng, hãy chắc chắn không sử dụng thẻ <a> bên trong <Link> */}
        {/* Ví dụ:
            <Link href="/edit-profile" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
              Update Profile
            </Link>
        */}
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
