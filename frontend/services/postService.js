// services/postService.js
import axiosInstance from '../utils/axiosPrivateInstance';
import axiosPublicInstance from '../utils/axiosPublicInstance';

export const getPosts = async (page = 1, limit = 10) => {
  const response = await axiosPublicInstance.get(`/posts?page=${page}&limit=${limit}`);
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

export const getPopulerPosts = async (page = 1, limit = 10) => {
  const response = await axiosPublicInstance.get(`/posts/populer?page=${page}&limit=${limit}`);
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

export const fetchUserPosts = async (username, page = 1, limit = 10) => {
  try {
    const response = await axiosPublicInstance.get(`/public/${username}/posts`, {
      params: { page, limit },
    });
    const data = response.data;

    if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
      throw new Error('Invalid response format for getUserPosts');
    }

    return {
      posts: data.data,
      totalCount: data.total_count,
    };
  } catch (error) {
    console.error(`Error fetching posts for user "${username}":`, error);
    throw error;
  }
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
  const response = await axiosInstance.put(`/api/posts/${postData.id}`, postData);
  return response.data;
};

// Hàm xóa bài viết
export const deletePost = async (postId) => {
  const response = await axiosInstance.delete(`/api/posts/${postId}`);
  return response.data;
};

export const getPostById = async (id) => {
  const response = await axiosPublicInstance.get(`/api/posts/${id}`);
  const data = response.data;
  return data.data;
};


export const getPostByName = async (name) => {
  const response = await axiosPublicInstance.get(`/p/${name}`);
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