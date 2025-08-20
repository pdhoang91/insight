// services/optimizedPostService.js
import axiosPrivateInstance from '../utils/axiosPrivateInstance';

/**
 * Extract image IDs from HTML content
 * @param {string} content - HTML content
 * @returns {string[]} - Array of image IDs
 */
export const extractImageIDs = (content) => {
  if (!content) return [];
  
  const imageIds = [];
  
  // Method 1: Extract from data-image-id attributes
  const dataImageIdRegex = /data-image-id=['"]([^'"]+)['"]/g;
  let match;
  while ((match = dataImageIdRegex.exec(content)) !== null) {
    imageIds.push(match[1]);
  }
  
  // Method 2: Extract from /images/v2/ URLs
  const imageUrlRegex = /\/images\/v2\/([a-f0-9-]+)/g;
  while ((match = imageUrlRegex.exec(content)) !== null) {
    if (!imageIds.includes(match[1])) {
      imageIds.push(match[1]);
    }
  }
  
  return imageIds;
};

/**
 * Extract image ID from title image URL
 * @param {string} imageTitle - Image title URL
 * @returns {string|null} - Image ID or null
 */
export const extractTitleImageID = (imageTitle) => {
  if (!imageTitle) return null;
  
  const match = imageTitle.match(/\/images\/v2\/([a-f0-9-]+)/);
  return match ? match[1] : null;
};

/**
 * Create post using optimized API v2
 * @param {Object} postData - Post data
 * @returns {Promise} - API response
 */
export const createPostV2 = async (postData) => {
  const {
    title,
    content,
    image_title,
    preview_content,
    categories = [],
    tags = []
  } = postData;

  // Extract image IDs from content and title
  const contentImageIDs = extractImageIDs(content);
  const titleImageID = extractTitleImageID(image_title);

  // Convert categories and tags to IDs if they're strings
  const categoryIDs = Array.isArray(categories) ? categories : [];
  const tagIDs = Array.isArray(tags) ? tags : [];

  const optimizedData = {
    title,
    content,
    image_title,
    preview_content: preview_content || '',
    category_ids: categoryIDs,
    tag_ids: tagIDs,
    content_image_ids: contentImageIDs,
    title_image_id: titleImageID
  };

  console.log('🚀 Creating post with optimized API:', {
    title,
    contentImageIDs,
    titleImageID,
    categoryIDs: categoryIDs.length,
    tagIDs: tagIDs.length
  });

  const response = await axiosPrivateInstance.post('/api/posts/v2', optimizedData);
  return response.data;
};

/**
 * Update post using optimized API v2
 * @param {string} postId - Post ID
 * @param {Object} postData - Post data
 * @returns {Promise} - API response
 */
export const updatePostV2 = async (postId, postData) => {
  const {
    title,
    content,
    image_title,
    preview_content,
    categories = [],
    tags = []
  } = postData;

  // Extract image IDs from content and title
  const contentImageIDs = extractImageIDs(content);
  const titleImageID = extractTitleImageID(image_title);

  // Convert categories and tags to IDs if they're strings
  const categoryIDs = Array.isArray(categories) ? categories : [];
  const tagIDs = Array.isArray(tags) ? tags : [];

  const optimizedData = {
    title,
    content,
    image_title,
    preview_content: preview_content || '',
    category_ids: categoryIDs,
    tag_ids: tagIDs,
    content_image_ids: contentImageIDs,
    title_image_id: titleImageID
  };

  console.log('🔄 Updating post with optimized API:', {
    postId,
    title,
    contentImageIDs,
    titleImageID,
    categoryIDs: categoryIDs.length,
    tagIDs: tagIDs.length
  });

  const response = await axiosPrivateInstance.put(`/api/posts/v2/${postId}`, optimizedData);
  return response.data;
};

/**
 * Enhanced image upload that returns both URL and ID
 * @param {File} file - Image file
 * @param {string} type - Image type (content, title, avatar)
 * @returns {Promise<{url: string, id: string}>} - Image URL and ID
 */
export const uploadImageV2 = async (file, type) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axiosPrivateInstance.post(`/images/upload/v2/${type}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const data = response.data;
  const imageUrl = data.url.startsWith('http') ? data.url : `http://${data.url}`;
  
  // Extract image ID from URL
  const imageId = extractTitleImageID(imageUrl);
  
  console.log('📸 Image uploaded:', {
    url: imageUrl,
    id: imageId,
    type
  });

  return {
    url: imageUrl,
    id: imageId
  };
};
