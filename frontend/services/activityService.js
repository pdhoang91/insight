// services/activityService.js
import axiosPrivateInstance from '../utils/axiosPrivateInstance';
import axiosPublicInstance from '../utils/axiosPublicInstance';

// Kiểm tra xem người dùng đã clapped bài viết chưa
export const checkHasClapped = async (postId) => {
  //const response = await axiosPrivateInstance.get(`/api/post/${postId}/hasClapped`);
  //return response.data.hasClapped;
  return false
};

// Gửi clap cho bài viết
export const clapPost = async (postID) => {
  const response = await axiosPrivateInstance.post(`/api/post/${postID}/clap`);
  return response.data;
};

// Unclap bài viết
export const unclapPost = async (postId) => {
  const response = await axiosPrivateInstance.post(`/api/posts/${postId}/unclap`);
  return response.data;
};

// Gửi clap cho comment
export const clapComment = async (commentID) => {
  const response = await axiosPrivateInstance.post(`/api/comment/${commentID}/clap`);
  return response.data;
};

// Gửi clap cho reply
export const clapReply = async (replyId) => {
  const response = await axiosPrivateInstance.post(`/api/reply/${replyId}/clap`); // Pass token if necessary
  return response.data;
};

// Lấy số lượng clap cho reply
export const getClapsCount = async (type, id) => {
  const response = await axiosPublicInstance.get(`/api/claps`, {
    params: { type, id }  // Sử dụng params để truyền dữ liệu
  });
  return response.data.clap_count;
};

