// lib/axios.ts
import axios from 'axios';
import { BASE_API_URL, BASE_AIAPI_URL, BASE_API_URL_SIMPLE } from '@/config/api';

// Public axios instance (no authentication required)
export const axiosPublicInstance = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Private axios instance (with authentication)
export const axiosPrivateInstance = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
axiosPrivateInstance.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle auth errors
axiosPrivateInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// AI service axios instance
export const axiosAIPublicInstance = axios.create({
  baseURL: BASE_AIAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple API instance
export const axiosPublicInstanceSimple = axios.create({
  baseURL: BASE_API_URL_SIMPLE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosPrivateInstanceSimple = axios.create({
  baseURL: BASE_API_URL_SIMPLE,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosPrivateInstanceSimple.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosPrivateInstance; 