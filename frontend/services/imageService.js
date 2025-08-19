// services/imageService.js
import {axiosPublicInstance} from '../utils/axiosPublicInstance';
import {axiosPrivateInstance} from '../utils/axiosPrivateInstance';

export const uploadImage = async (file, type) => {

    const formData = new FormData();
    formData.append('image', file);
  
      const response = await axiosPrivateInstance.post(`/images/upload/v2/${type}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  console.log('Upload response:', response.data); // Debug log
  
  // API returns { success: true, data: { url: "...", image_id: "..." } }
  const data = response.data.data // Get the nested data object
  const imageUrl = data.url.startsWith('http') ? data.url : `http://${data.url}`;
  
  console.log('Final image URL:', imageUrl); // Debug log
  
  return imageUrl

  };