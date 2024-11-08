// services/postService.js
import {axiosPublicInstanceSimple} from '../utils/axiosPublicInstance';

export const uploadImage = async (file) => {

    const formData = new FormData();
    formData.append('image', file);
  
    const response = await axiosPublicInstanceSimple.post('/images/upload/v2', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    //return response.data.url; // Assuming your API returns the URL of the uploaded image
    const data =  response.data
    const imageUrl = data.url.startsWith('http') ? data.url : `http://${data.url}`;
    return imageUrl

  };