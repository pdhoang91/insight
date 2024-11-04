// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { getUserProfile } from '../services/userService';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initializeUser = async () => {
    try {
      // Lấy token từ fragment URL (ví dụ: #token=...)
      const hash = typeof window !== 'undefined' ? window.location.hash.substr(1) : '';
      const params = new URLSearchParams(hash);
      const token = params.get('token');

      if (token) {
        // Lưu token vào localStorage
        localStorage.setItem('token', token);

        // Gọi API để lấy thông tin người dùng
        const response = await getUserProfile();
        setUser(response);

        // Loại bỏ fragment từ URL
        window.history.replaceState({}, document.title, '/');
      } else {
        // Nếu không có token trong URL, kiểm tra token trong localStorage
        const existingToken = localStorage.getItem('token');
        if (existingToken) {
          const response = await getUserProfile();
          setUser(response);
        }
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      // Xóa token nếu có lỗi
      localStorage.removeItem('token');
      alert('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeUser();
  }, []);

  return { user, setUser, loading };
};

export default useAuth;
