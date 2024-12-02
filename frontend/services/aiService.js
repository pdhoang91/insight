// src/services/aiService.js

import { BASE_AIAPI_URL } from '../config/api';

/**
 * Lấy nội dung bài viết từ URL.
 * @param {string} url - URL của bài viết.
 * @returns {Promise<string>} - Nội dung bài viết.
 * @throws {Error} - Nếu không thể lấy nội dung.
 */
export const fetchArticle = async (url) => {
  const response = await fetch(`${BASE_AIAPI_URL}/fetch-article`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error('Không thể tải nội dung bài viết');
  }

  const data = await response.json();
  return data.content;
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
  const response = await fetch(`${BASE_AIAPI_URL}/summarize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      model,
      prompt,
    }),
  });

  if (!response.ok) {
    throw new Error('Lỗi khi tóm tắt bài viết');
  }

  const data = await response.json();
  return data.summary;
};
