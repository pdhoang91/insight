import { axiosAIPublicInstance } from '../utils/axiosPublicInstance';

/**
 * Lấy nội dung bài viết từ URL.
 * @param {string} url - URL của bài viết.
 * @returns {Promise<string>} - Nội dung bài viết.
 * @throws {Error} - Nếu không thể lấy nội dung.
 */
export const fetchArticle = async (url) => {
  const response = await axiosAIPublicInstance.post('/ai/fetch-article', {
    url, // Payload chỉ chứa key-value
  });
  // Trả về nội dung bài viết từ response.data
  return response.data.content;
};

/**
 * Tóm tắt nội dung bài viết.
 * @param {string} content - Nội dung bài viết.
 * @param {string} model - Mô hình AI được chọn.
 * @param {string} prompt - Prompt để tóm tắt.
 * @returns {Promise<string>} - Bản tóm tắt.
 * @throws {Error} - Nếu có lỗi khi tóm tắt.
 */
export const summarizeArticle = async (content, model, prompt) => {
  const response = await axiosAIPublicInstance.post('/ai/summarize', {
    content,
    model,
    prompt, // Gửi payload đúng định dạng JSON
  });
  // Trả về bản tóm tắt từ response.data
  return response.data.summary;
};
