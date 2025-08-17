// services/imageService.js
import {axiosPublicInstanceSimple} from '../utils/axiosPublicInstance';
import {axiosPrivateInstance} from '../utils/axiosPrivateInstance';

export const uploadImage = async (file, type) => {

    const formData = new FormData();
    formData.append('image', file);
  
    const response = await axiosPrivateInstance.post(`/images/upload/v2/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    //return response.data.url; // Assuming your API returns the URL of the uploaded image
    const data =  response.data
    const imageUrl = data.url.startsWith('http') ? data.url : `http://${data.url}`;
    return imageUrl

  };