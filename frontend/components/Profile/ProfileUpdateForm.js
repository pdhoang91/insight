// components/Profile/ProfileUpdateForm.js

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUpload } from 'react-icons/fa'; // Import icon upload
import { uploadImage } from '../../services/imageService'; // Điều chỉnh đường dẫn nếu cần

const ProfileUpdateForm = ({ userProfile, onUpdate, onCancel }) => {
  const [name, setName] = useState(userProfile.name || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [dob, setDob] = useState(userProfile.dob || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ name, phone, dob, avatar_url: avatarUrl });
  };

  const handleAvatarUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setAvatarUrl(imageUrl);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert("Không thể tải lên hình ảnh. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <h3 className="text-xl font-semibold mb-4">Update Profile</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <div>
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                className="w-16 h-16 rounded-full object-cover" 
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={handleAvatarUploadClick}
                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition flex items-center"
                aria-label="Upload Avatar"
                title="Tải lên avatar"
              >
                {isUploading ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4">
                    </circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8v8H4z">
                    </path>
                  </svg>
                ) : (
                  <>
                    <FaUpload size={16} className="mr-2" />
                    Upload Avatar
                  </>
                )}
              </button>
              {/* Input File Ẩn */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Name */}
          <div className="flex items-center">
            <span className="mr-2">👤</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Name"
              required
            />
          </div>

          {/* Phone */}
          <div className="flex items-center">
            <span className="mr-2">📞</span>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Phone Number"
            />
          </div>

          {/* Date of Birth */}
          <div className="flex items-center">
            <span className="mr-2">🎂</span>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Update
            </button>
            <button 
              type="button" 
              onClick={onCancel} 
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileUpdateForm;

