
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
      revalidateOnReconnect: true, // Enable revalidation on reconnect for better auth sync
      dedupingInterval: 5000, // Reduce to 5 seconds to catch auth state changes faster
      errorRetryCount: 2, // Limit retries to prevent infinite loops
      errorRetryInterval: 1000, // Wait 1s between retries
      onError: (error) => {
        // Clear token on 401/403 errors
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
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
        // Validate token format and expiration before using
        try {
          const tokenParts = existingToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            
            // Check if token is expired
            if (payload.exp && payload.exp > currentTime) {
              setInitialized(true); // Token is valid, trigger SWR
            } else {
              // Token expired, remove it
              localStorage.removeItem('token');
              setUser(null);
            }
          } else {
            // Invalid token format
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          // Token parsing error
          localStorage.removeItem('token');
          setUser(null);
        }
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
