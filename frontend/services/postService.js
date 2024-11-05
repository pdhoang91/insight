// services/postService.js
import axiosInstance from '../utils/axiosPrivateInstance';
import axiosPublicInstance from '../utils/axiosPublicInstance';

export const getPosts = async (page = 1, limit = 10) => {
  const response = await axiosPublicInstance.get(`/api/posts?page=${page}&limit=${limit}`);
  const data = response.data;
  if (
    !data ||
    !Array.isArray(data.data) || 
    typeof data.total_count !== 'number'
  ) {
    throw new Error('Invalid response format for getPosts');
  }

  return {
    posts: data.data,
    totalCount: data.total_count, 
  };
};

export const createPost = async (postData) => {
  const response = await axiosInstance.post('/api/posts', postData);
  return response.data;
};

export const submitPost = async (postData) => {
  try {
    const response = await axiosInstance.post('/api/posts', postData); // Đường dẫn API để lưu bài post
    return response.data;
  } catch (error) {
    console.error("Error submitting post:", error);
    throw error;
  }
};

export const updatePost = async (id, postData) => {
  const response = await axiosInstance.put(`/api/posts/${id}`, postData);
  return response.data;
};

export const getPostById = async (id) => {
  const response = await axiosPublicInstance.get(`/api/posts/${id}`);
  //console.log('getPostById: response', response);
  const data = response.data;
  return data.data;
};


export const getPostByName = async (name) => {
  const response = await axiosPublicInstance.get(`/p/${name}`);
  //console.log('getPostById: response', response);
  const data = response.data;
  return data.data;
};

export const getFollowingPosts = async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/api/following/posts?page=${page}&limit=${limit}`);
    const data = response.data;

    // Kiểm tra định dạng dữ liệu trả về
    if (
      !data ||
      !Array.isArray(data.data) ||
      typeof data.total_count !== 'number'
    ) {
      throw new Error('Invalid response format for getFollowingPosts');
    }


    return {
      posts: data.data,
      totalCount: data.total_count,
    };

};

export const getPostsByCategory = async (categoryName, page = 1, limit = 10) => {
  const response = await axiosPublicInstance.get(
    `/categories/${encodeURIComponent(categoryName)}/posts?page=${page}&limit=${limit}`
  );
  const data = response.data;
    
    if (
      !data ||
      !Array.isArray(data.data) ||
      typeof data.total_count !== 'number'
    ) {
      throw new Error('Invalid response format for getPostsByCategory');
    }

    return {
      posts: data.data,
      totalCount: data.total_count,
    };
};

// Kiểm tra xem người dùng đã clap bài viết chưa
export const checkHasClapped = async (postId) => {
  //const response = await axiosPrivateInstance.get(`/posts/${postId}/hasClapped`);
  //return response.data;
  return true
};

export const getLatestPosts = async (limit) => {
  const response = await axiosPublicInstance.get(`/posts?limit=${limit}`);
  const data = response.data;

  return data.data;
};


export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axiosPublicInstance.post('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log("response.data.url", response.data.url);
  return response.data.url; // Assuming your API returns the URL of the uploaded image
};