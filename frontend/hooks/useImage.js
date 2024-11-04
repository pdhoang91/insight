// hooks/useImage.js
import { useCallback } from 'react';
import { uploadImage } from '../services/postService'; // Ensure you have an imageService that handles uploads

export const useImage = () => {
  const handleImageUpload = useCallback(async (file) => {
    // Call the API to upload the image
    const response = await uploadImage(file);
    return response.url; // Assuming your API returns the URL in this format
  }, []);

  return { handleImageUpload };
};
