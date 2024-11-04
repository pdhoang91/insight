// services/postService.js
import axiosPublicInstance from '../utils/axiosPublicInstance';

export const uploadImage = async (file) => {

    const formData = new FormData();
    formData.append('image', file);
  
    const response = await axiosPublicInstance.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log("response.data.url", response.data.url);
    //return response.data.url; // Assuming your API returns the URL of the uploaded image
    const data =  response.data
    const imageUrl = data.url.startsWith('http') ? data.url : `http://${data.url}`;
    return imageUrl

  };