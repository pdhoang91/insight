// services/imageService.js
import {axiosPublicInstance} from '../utils/axiosPublicInstance';
import {axiosPrivateInstance} from '../utils/axiosPrivateInstance';

export const uploadImage = async (file, type) => {
    const formData = new FormData();
    formData.append('image', file);
  
    const response = await axiosPrivateInstance.post(`/api/images/upload/v2/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const data = response.data;
    const imageUrl = data.url.startsWith('http') ? data.url : `http://${data.url}`;
    return imageUrl;
};

// Update profile with avatar upload
export const updateProfileWithAvatar = async (profileData, avatarFile = null) => {
    const formData = new FormData();
    
    // Add profile fields
    if (profileData.name) formData.append('name', profileData.name);
    if (profileData.bio) formData.append('bio', profileData.bio);
    if (profileData.avatar_url) formData.append('avatar_url', profileData.avatar_url);
    
    // Add avatar file if provided
    if (avatarFile) {
        formData.append('avatar', avatarFile);
    }
  
    const response = await axiosPrivateInstance.put('/api/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
};

