// hooks/useFileUpload.js
import { useState, useCallback } from 'react';

/**
 * Handles imperatively opening a file picker and uploading the selected file.
 * @param {object} options
 * @param {string} options.accept - file input accept string
 * @param {Function} options.uploadFn - async (file) => url string
 * @returns {{ upload: Function, isUploading: boolean, error: string|null, clearError: Function }}
 */
export const useFileUpload = ({ accept, uploadFn }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const upload = useCallback((onSuccess) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', accept);
    input.click();
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      setError(null);
      setIsUploading(true);
      try {
        const url = await uploadFn(file);
        onSuccess(url);
      } catch (err) {
        const msg = err?.response?.data?.error || err?.message || 'Upload failed';
        setError(msg);
      } finally {
        setIsUploading(false);
      }
    };
  }, [accept, uploadFn]);

  const clearError = useCallback(() => setError(null), []);

  return { upload, isUploading, error, clearError };
};
