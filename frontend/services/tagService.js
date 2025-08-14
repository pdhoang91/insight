// services/tagService.js
import axiosPublicInstance, { axiosPublicInstanceSimple } from '../utils/axiosPublicInstance';
import axiosPrivateInstance from '../utils/axiosPrivateInstance';

// Get all tags with pagination
export const getTags = async (page = 1, limit = 20) => {
  try {
    const response = await axiosPublicInstance.get(`/tags?page=${page}&limit=${limit}`);
    const data = response.data;

    // Handle different response formats
    if (Array.isArray(data)) {
      return {
        tags: data,
        totalCount: data.length,
      };
    }

    if (data && Array.isArray(data.data)) {
      return {
        tags: data.data,
        totalCount: data.total_count || data.data.length,
      };
    }

    return {
      tags: [],
      totalCount: 0,
    };
  } catch (error) {
    console.error('Error in getTags:', error);
    return {
      tags: [],
      totalCount: 0,
    };
  }
};

// Get popular tags (most used)
export const getPopularTags = async (limit = 9) => {
  try {
    const response = await axiosPublicInstanceSimple.get(`/tags/popular?limit=${limit}`);
    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  } catch (error) {
    console.error('Error in getPopularTags:', error);
    // Fallback to regular tags if popular endpoint doesn't exist
    const allTags = await getTags(1, limit);
    return allTags.tags;
  }
};

// Create a new tag (user-generated)
export const createTag = async (tagName) => {
  try {
    const response = await axiosPrivateInstance.post('/tags', {
      name: tagName.trim(),
    });

    return response.data;
  } catch (error) {
    console.error('Error in createTag:', error);
    throw error;
  }
};

// Add tag to a post
export const addTagToPost = async (tagId, postId) => {
  try {
    const response = await axiosPrivateInstance.post(`/tag/${tagId}/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error in addTagToPost:', error);
    throw error;
  }
};

// Remove tag from a post
export const removeTagFromPost = async (tagId, postId) => {
  try {
    const response = await axiosPrivateInstance.delete(`/tag/${tagId}/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error in removeTagFromPost:', error);
    throw error;
  }
};

// Search tags by name
export const searchTags = async (query, limit = 10) => {
  try {
    const response = await axiosPublicInstance.get(`/tags/search`, {
      params: { q: query, limit },
    });

    const data = response.data;
    
    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  } catch (error) {
    console.error('Error in searchTags:', error);
    // Fallback: filter from all tags
    const allTags = await getTags(1, 50);
    return allTags.tags.filter(tag => 
      tag.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);
  }
};

// Get posts by tag
export const getPostsByTag = async (tagName, page = 1, limit = 10) => {
  try {
    const response = await axiosPublicInstance.get(
      `/tags/${encodeURIComponent(tagName)}/posts?page=${page}&limit=${limit}`
    );
    const data = response.data;

    if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
      return {
        posts: [],
        totalCount: 0,
      };
    }

    return {
      posts: data.data,
      totalCount: data.total_count,
    };
  } catch (error) {
    console.error('Error in getPostsByTag:', error);
    return {
      posts: [],
      totalCount: 0,
    };
  }
}; 