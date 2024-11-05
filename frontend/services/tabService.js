// services/tabService.js
import axiosPublicInstance from '../utils/axiosPublicInstance';
import axiosPrivateInstance from '../utils/axiosPrivateInstance';

export const getTabs = async () => {
  try {
    const response = await axiosPublicInstance.get('/tabs');
    const data = response.data;
    console.log("data", data)
    if (!data || !Array.isArray(data.tabs)) {
      throw new Error('Invalid response format for getTabs');
    }
    return data?data.tabs:[]; // Giả sử data.tabs là một mảng các tab
  } catch (error) {
    console.error('Error fetching tabs:', error);
    throw error;
  }
};

// Lấy các tabs hiện tại của người dùng
export const getUserTabs = async () => {
    try {
      const response = await axiosPrivateInstance.get('/api/tabs');
      const data = response.data
      console.log("getUserTabs", data)
      //return data?data.tabs:[]; // Giả sử trả về một mảng các tabs
      return data && Array.isArray(data.tabs) ? data.tabs : []; // Trả về mảng rỗng nếu data.tabs không tồn tại hoặc không phải là mảng
    } catch (error) {
      console.error('Error fetching user tabs:', error);
      throw error;
    }
  };

  // Thêm tab (follow category)
export const addCategoryFollow = async (categoryID) => {
  try {
    const response = await axiosPrivateInstance.post('/api/tabs/add', { id: categoryID });
    return response.data;
  } catch (error) {
    console.error(`Error adding category follow:`, error);
    throw error;
  }
};

// Xóa tab (unfollow category)
export const removeCategoryFollow = async (categoryID) => {
  try {
    const response = await axiosPrivateInstance.post('/api/tabs/remove', { id: categoryID });
    return response.data;
  } catch (error) {
    console.error(`Error removing category follow:`, error);
    throw error;
  }
};