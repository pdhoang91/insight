
// hooks/useAuth.js
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { getUserProfile } from '../services/userService';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Use SWR to cache the /api/me request
  const { data: userData, error, mutate } = useSWR(
    initialized ? '/api/me' : null,
    getUserProfile,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 10000, // Prevent duplicate requests within 10 seconds
    }
  );

  const initializeUser = async () => {
    try {
      // Lấy token từ fragment URL (ví dụ: #token=...)
      const hash = typeof window !== 'undefined' ? window.location.hash.substr(1) : '';
      const params = new URLSearchParams(hash);
      const token = params.get('token');

      if (token) {
        // Lưu token vào localStorage
        localStorage.setItem('token', token);

        // Loại bỏ fragment từ URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Check if we have a token in localStorage
      const existingToken = localStorage.getItem('token');
      if (existingToken) {
        setInitialized(true); // This will trigger SWR to fetch user data
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeUser();
  }, []);

  // Update user state when SWR data changes
  useEffect(() => {
    if (userData) {
      setUser(userData);
    } else if (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [userData, error]);

  return { 
    user, 
    setUser, 
    loading: !initialized || (!userData && !error),
    mutate // Expose mutate for manual revalidation
  };
};

export default useAuth;
